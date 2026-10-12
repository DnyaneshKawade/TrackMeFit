"""Extract calories and macros per 100 g from the USDA SR Legacy bulk CSV files.

Download (public domain, no API key needed):
  https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_sr_legacy_food_csv_2018-04.zip
Usage:
  python3 scripts/usda/extract_macros.py <unzipped folder> data/usda/sr_legacy_macros.csv
Output columns: fdc_id, ndb_number, category, description, kcal, protein_g, carb_g, fat_g
"""
import csv
import sys
from pathlib import Path

ENERGY_KCAL, ENERGY_KJ = 1008, 1062
PROTEIN, FAT, CARB = 1003, 1004, 1005
WANTED = {ENERGY_KCAL, ENERGY_KJ, PROTEIN, FAT, CARB}


def find(folder: Path, name: str) -> Path:
    hits = list(folder.rglob(name))
    if not hits:
        sys.exit(f"missing {name} under {folder}")
    return hits[0]


def rows(folder: Path, name: str):
    with open(find(folder, name), newline="", encoding="utf-8") as f:
        yield from csv.DictReader(f)


def main() -> None:
    folder, out = Path(sys.argv[1]), Path(sys.argv[2])
    categories = {r["id"]: r["description"] for r in rows(folder, "food_category.csv")}
    ndb = {r["fdc_id"]: r["NDB_number"] for r in rows(folder, "sr_legacy_food.csv")}
    foods = {
        r["fdc_id"]: (categories.get(r["food_category_id"], ""), r["description"])
        for r in rows(folder, "food.csv")
        if r["fdc_id"] in ndb
    }
    values: dict[str, dict[int, float]] = {}
    for r in rows(folder, "food_nutrient.csv"):
        nid = int(r["nutrient_id"])
        if nid in WANTED and r["fdc_id"] in foods and r["amount"]:
            values.setdefault(r["fdc_id"], {})[nid] = float(r["amount"])
    out.parent.mkdir(parents=True, exist_ok=True)
    written = 0
    with open(out, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["fdc_id", "ndb_number", "category", "description", "kcal", "protein_g", "carb_g", "fat_g"])
        for fdc_id in sorted(foods, key=int):
            v = values.get(fdc_id, {})
            kcal = v.get(ENERGY_KCAL)
            if kcal is None and ENERGY_KJ in v:
                kcal = v[ENERGY_KJ] / 4.184
            if kcal is None or not {PROTEIN, FAT, CARB} <= v.keys():
                continue
            category, description = foods[fdc_id]
            w.writerow([fdc_id, ndb[fdc_id], category, description, round(kcal), v[PROTEIN], v[CARB], v[FAT]])
            written += 1
    print(f"wrote {written} foods to {out}")


if __name__ == "__main__":
    main()

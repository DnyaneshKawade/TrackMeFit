"""Clean the Open Food Facts India export into a small macros table (ODbL).

Usage: python3 scripts/off_extract_india.py <openfoodfacts_export.csv> data/off/india_products.csv
Keeps products with a name, a barcode and full label macros (packaging or manufacturer
values, never OFF estimates), drops impossible values and calories that do not match macros."""
import csv, sys, re
from collections import Counter
csv.field_size_limit(10**9)
src, out = sys.argv[1], sys.argv[2]
P = 'nutrition.input_sets.'
SETS = [('packaging', 'as_sold', '100g'), ('packaging', 'as_sold', '100ml'), ('manufacturer', 'as_sold', '100g')]
NAME_COLS = ['product_name_en', 'product_name_xx', 'product_name_hi', 'product_name_in']
reasons = Counter(); rows = {}
r = csv.DictReader(open(src, newline='', encoding='utf-8'), delimiter='\t')
def num(v):
    try: return float(v)
    except (TypeError, ValueError): return None
for row in r:
    if 'en:india' not in (row.get('countries_tags') or ''): reasons['not India'] += 1; continue
    code = (row.get('code') or '').strip()
    if not code: reasons['no barcode'] += 1; continue
    name = next((row[c].strip() for c in NAME_COLS if row.get(c, '').strip()), '')
    if not name:
        name = next((v.strip() for k, v in row.items() if k.startswith('product_name_') and v and v.strip()), '')
    if not name: reasons['no name'] += 1; continue
    got = None
    for s, st, per in SETS:
        b = f'{P}{s}.{st}.{per}.nutrients.'
        vals = [num(row.get(b + n + '.value')) for n in ('energy-kcal', 'proteins', 'carbohydrates', 'fat')]
        if all(v is not None for v in vals): got = (vals, per, s); break
    if not got: reasons['no full macros'] += 1; continue
    (kcal, p, c, f), per, s = got
    if not (0 <= kcal <= 950) or min(p, c, f) < 0 or max(p, c, f) > 100 or p + c + f > 105:
        reasons['impossible values'] += 1; continue
    calc = p * 4 + c * 4 + f * 9
    gap = abs(calc - kcal) / kcal if kcal else (0 if calc == 0 else 1)
    if gap > 0.35 and abs(calc - kcal) > 20: reasons['calories do not match macros'] += 1; continue
    if code in rows: reasons['duplicate barcode'] += 1; continue
    rows[code] = [code, re.sub(r'\s+', ' ', name)[:120], (row.get('brands') or '').split(',')[0].strip()[:60],
                  (row.get('quantity') or '').strip()[:40], (row.get('serving_size') or '').strip()[:40], per,
                  round(kcal), round(p, 1), round(c, 1), round(f, 1)]
with open(out, 'w', newline='', encoding='utf-8') as fh:
    w = csv.writer(fh)
    w.writerow(['barcode', 'name', 'brand', 'pack_size', 'serving_size', 'per', 'kcal', 'protein_g', 'carb_g', 'fat_g'])
    w.writerows(rows.values())
print('kept', len(rows)); print(dict(reasons))

-- Food search in the database (T-038). Our foods and Open Food Facts products
-- (ODbL) are kept in separate tables (docs/food-data.md rule 2) and searched
-- together through a view. Search text is stored already normalized
-- (lowercase, letters and digits, single spaces) by the same code the app
-- uses, so both agree. Loaded from data/export/*.csv (see the spec).
create schema if not exists extensions;
create extension if not exists pg_trgm with schema extensions;
grant usage on schema extensions to anon, authenticated;

create table public.foods (
  id text primary key,
  name text not null,
  aliases text[] not null default '{}',
  brand text,
  source text not null check (source in ('usda', 'ifct', 'indb', 'trackMeFit', 'aiEstimate')),
  source_id text,
  barcode text,
  state text not null check (state in ('raw', 'cooked', 'asSold')),
  kcal numeric not null check (kcal >= 0),
  protein_g numeric not null check (protein_g >= 0),
  carb_g numeric not null check (carb_g >= 0),
  fat_g numeric not null check (fat_g >= 0),
  portions jsonb not null default '[]',
  tags text[] not null default '{}',
  tags_guessed boolean not null default false,
  search_name text not null,
  search_aliases text[] not null default '{}',
  search_terms text not null
);

-- Same shape, ODbL data only.
create table public.off_products (like public.foods including defaults);
alter table public.off_products add primary key (id);
alter table public.off_products add check (source = 'openFoodFacts');

-- Any word inside a name, alias or brand, found without scanning every row.
create index foods_search_terms on public.foods using gin (search_terms extensions.gin_trgm_ops);
create index off_products_search_terms on public.off_products using gin (search_terms extensions.gin_trgm_ops);

create view public.food_search with (security_invoker = true) as
  select f.*, case f.source when 'trackMeFit' then 1 else 2 end as source_rank from public.foods f
  union all
  select o.*, 3 as source_rank from public.off_products o;

alter table public.foods enable row level security;
alter table public.off_products enable row level security;
-- Food facts are public; nobody writes through the API (admin editing is T-042b).
create policy "anyone reads" on public.foods for select to anon, authenticated using (true);
create policy "anyone reads" on public.off_products for select to anon, authenticated using (true);
grant select on public.foods, public.off_products, public.food_search to anon, authenticated;

-- Best matches first, ranked like the app's own search (src/food/search.ts):
-- exact name or regional name, starts with, whole word, all words, prefix;
-- then a close
-- spelling for typos (a word at least 40% alike by trigrams). Ties: our dishes, raw foods, packaged, shorter names.
create function public.search_foods(q text, lim int default 30)
returns setof public.food_search
language sql stable
set search_path = public, extensions
set pg_trgm.word_similarity_threshold = 0.4
as $$
  with query as (
    select trim(regexp_replace(lower(coalesce(q, '')), '[^a-z0-9]+', ' ', 'g')) as q
  ), parts as (
    select q, string_to_array(q, ' ') as tokens from query where length(q) >= 2
  ), scored as (
    select f, p.q, case
      when f.search_name = p.q or p.q = any(f.search_aliases) then 100
      when f.search_name like p.q || ' %'
        or exists (select 1 from unnest(f.search_aliases) a where a like p.q || ' %') then 80
      when ' ' || f.search_name || ' ' like '% ' || p.q || ' %'
        or exists (select 1 from unnest(f.search_aliases) a where ' ' || a || ' ' like '% ' || p.q || ' %') then 65
      when (select bool_and(' ' || f.search_terms || ' ' like '% ' || t || ' %') from unnest(p.tokens) t) then 60
      when f.search_name like p.q || '%'
        or exists (select 1 from unnest(f.search_aliases) a where a like p.q || '%') then 50
      when (select bool_and(' ' || f.search_terms like '% ' || t || '%') from unnest(p.tokens) t) then 40
      when p.q <% f.search_terms then 20
      else 0
    end as score
    from public.food_search f, parts p
    where f.search_terms like '%' || p.tokens[1] || '%' or p.q <% f.search_terms
  )
  select (s.f).* from scored s
  where s.score > 0
  order by s.score desc, case when s.score = 20 then word_similarity(s.q, (s.f).search_terms) end desc nulls last, (s.f).source_rank, length((s.f).search_name), (s.f).id
  limit least(greatest(coalesce(lim, 30), 1), 50)
$$;

-- Foods by id, for recent entries in "Add food".
create function public.foods_by_id(ids text[])
returns setof public.food_search
language sql stable
set search_path = public
as $$
  select * from public.food_search where id = any(ids[1:100])
$$;

grant execute on function public.search_foods(text, int), public.foods_by_id(text[]) to anon, authenticated;

-- Foods imported from the first CSV export carry portions = {} when they have
-- none; the app expects a JSON array (fix: spec T-038). Safe to run again.
update public.foods set portions = '[]'::jsonb where jsonb_typeof(portions) <> 'array';
update public.off_products set portions = '[]'::jsonb where jsonb_typeof(portions) <> 'array';

-- kg or lb for gym weights (spec T-101). Sets are still saved in kg; this
-- only changes how the app shows and takes weights.

alter table public.profiles
  add column weight_unit text not null default 'kg' check (weight_unit in ('kg', 'lb'));

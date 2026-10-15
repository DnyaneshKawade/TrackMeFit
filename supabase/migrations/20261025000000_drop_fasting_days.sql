-- Fasting days in the food log were rolled back (DK, 15 Oct 2026: "better not
-- to include it for now"). Removes the table from 20261024000000_fasting_days.sql.
drop table if exists public.fasting_days;

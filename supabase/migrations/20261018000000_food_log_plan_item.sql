-- T-060: an entry logged by ticking the meal plan remembers which plan item
-- it came from ("<plan id>:<meal>:<position>"), so unticking removes only
-- that entry and the ticks show again after reload or on another phone.
-- Null for everything logged by hand. Row-level security is unchanged.
alter table public.food_logs
  add column plan_item text check (plan_item is null or length(plan_item) <= 200);

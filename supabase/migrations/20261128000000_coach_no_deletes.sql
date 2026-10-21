-- Coaches can't delete a client's plans, diet targets or meal plans (spec
-- T-125). The old rules were "for all", so an active coach could delete them
-- through the API. Coaches still add and change them; only the person deletes.
-- Plan days and exercises stay as they were: saving an edited plan deletes
-- and re-adds them, and coaches edit their clients' plans.

drop policy "person or coach plans" on public.workout_plans;
-- That rule was also the plans' only read rule.
create policy "person or coach reads plans" on public.workout_plans for select to authenticated
  using (public.can_see(user_id));
create policy "person or coach adds plans" on public.workout_plans for insert to authenticated
  with check (public.can_see(user_id));
create policy "person or coach changes plans" on public.workout_plans for update to authenticated
  using (public.can_see(user_id)) with check (public.can_see(user_id));
create policy "person deletes own plans" on public.workout_plans for delete to authenticated
  using (user_id = auth.uid());

drop policy "person or coach sets" on public.diet_targets;
create policy "person or coach adds targets" on public.diet_targets for insert to authenticated
  with check (public.can_see(user_id) and set_by = auth.uid());
create policy "person or coach changes targets" on public.diet_targets for update to authenticated
  using (public.can_see(user_id)) with check (public.can_see(user_id) and set_by = auth.uid());
create policy "person deletes own targets" on public.diet_targets for delete to authenticated
  using (user_id = auth.uid());

drop policy "person or coach saves" on public.meal_plans;
create policy "person or coach adds meal plans" on public.meal_plans for insert to authenticated
  with check (public.can_see(user_id) and created_by = auth.uid());
create policy "person or coach changes meal plans" on public.meal_plans for update to authenticated
  using (public.can_see(user_id)) with check (public.can_see(user_id) and created_by = auth.uid());
create policy "person deletes own meal plans" on public.meal_plans for delete to authenticated
  using (user_id = auth.uid());

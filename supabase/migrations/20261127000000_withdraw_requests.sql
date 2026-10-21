-- Withdraw a request (spec T-124). People can delete their own request,
-- a change or coach request, while nobody has answered it yet.
grant delete on public.data_requests to authenticated;
create policy "withdraw own open request" on public.data_requests for delete to authenticated
  using (person_id = auth.uid() and status = 'open');

-- 0006 covered select and insert on proposals but not update, so accepting
-- or declining a proposal would silently fail under RLS. This lets the
-- requirement's owner update proposals on their own requirement.
create policy "requirement owner updates its proposals" on proposals
  for update using (
    exists (select 1 from requirements r where r.id = requirement_id and r.customer_user_id = auth.uid())
  ) with check (
    exists (select 1 from requirements r where r.id = requirement_id and r.customer_user_id = auth.uid())
  );

grant update on proposals to authenticated;

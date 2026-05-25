alter table restaurants enable row level security;
alter table platforms enable row level security;
alter table restaurant_platform_links enable row level security;
alter table offers enable row level security;
alter table offer_history enable row level security;
alter table user_searches enable row level security;
alter table admin_users enable row level security;

create policy "Public can read active restaurants" on restaurants for select using (active = true);
create policy "Public can read active platforms" on platforms for select using (active = true);
create policy "Public can read active links" on restaurant_platform_links for select using (active = true);
create policy "Public can read active offers" on offers for select using (active = true);
create policy "Public can insert search analytics" on user_searches for insert with check (true);

create policy "Admins manage restaurants" on restaurants for all using (exists (select 1 from admin_users where auth_user_id = auth.uid() and role in ('admin','editor')));
create policy "Admins manage links" on restaurant_platform_links for all using (exists (select 1 from admin_users where auth_user_id = auth.uid() and role in ('admin','editor')));
create policy "Admins manage offers" on offers for all using (exists (select 1 from admin_users where auth_user_id = auth.uid() and role in ('admin','editor')));
create policy "Admins read history" on offer_history for select using (exists (select 1 from admin_users where auth_user_id = auth.uid()));

\i schema.sql

insert into platforms (name, slug, logo_url, base_url) values
  ('EazyDiner','eazydiner','/platforms/eazydiner.svg','https://www.eazydiner.com'),
  ('Swiggy Dineout','swiggy-dineout','/platforms/swiggy.svg','https://www.swiggy.com'),
  ('District','district','/platforms/district.svg','https://www.district.in'),
  ('Zomato Dining','zomato-dining','/platforms/zomato.svg','https://www.zomato.com'),
  ('Restaurant Direct','restaurant-direct','/platforms/direct.svg',null),
  ('Bank/Card Offer','bank-card','/platforms/bank.svg',null)
on conflict (slug) do nothing;

insert into restaurants (name, slug, area, address, cuisine, approx_cost_for_two, rating, image_url, google_maps_url) values
  ('Foo','foo-powai','Powai','Powai, Mumbai',array['Asian','Sushi'],2600,4.4,'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80','https://www.google.com/maps/search/?api=1&query=Foo%20Powai%20Mumbai'),
  ('Yauatcha','yauatcha-bkc','BKC','BKC, Mumbai',array['Chinese','Dim Sum'],4200,4.5,'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80','https://www.google.com/maps/search/?api=1&query=Yauatcha%20BKC%20Mumbai'),
  ('The Table','the-table-colaba','Colaba','Colaba, Mumbai',array['European','Global'],5000,4.6,'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80','https://www.google.com/maps/search/?api=1&query=The%20Table%20Colaba%20Mumbai'),
  ('Bastian','bastian-bandra','Bandra','Bandra, Mumbai',array['Seafood','Continental'],4800,4.4,'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=900&q=80','https://www.google.com/maps/search/?api=1&query=Bastian%20Bandra%20Mumbai'),
  ('Masala Library','masala-library-bkc','BKC','BKC, Mumbai',array['Modern Indian'],5200,4.5,'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=80','https://www.google.com/maps/search/?api=1&query=Masala%20Library%20BKC%20Mumbai')
on conflict (slug) do nothing;

insert into restaurants (name, slug, area, address, cuisine, approx_cost_for_two, rating, image_url, google_maps_url)
select
  'Seed Mumbai Restaurant ' || gs,
  'seed-mumbai-restaurant-' || gs,
  (array['Bandra','Powai','Andheri','BKC','Lower Parel','Juhu','Colaba','Churchgate','Worli','Dadar','Ghatkopar','Thane','Vashi','Malad','Borivali','Kurla','Fort','Marine Lines','Santacruz','Khar','Chembur','Mulund','Navi Mumbai'])[1 + ((gs - 1) % 23)],
  (array['Bandra','Powai','Andheri','BKC','Lower Parel','Juhu','Colaba','Churchgate','Worli','Dadar','Ghatkopar','Thane','Vashi','Malad','Borivali','Kurla','Fort','Marine Lines','Santacruz','Khar','Chembur','Mulund','Navi Mumbai'])[1 + ((gs - 1) % 23)] || ', Mumbai',
  array['North Indian','Continental'],
  1500 + ((gs % 10) * 300),
  3.8 + ((gs % 8)::numeric / 10),
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80',
  'https://www.google.com/maps/search/?api=1&query=' || replace('Seed Mumbai Restaurant ' || gs || ' Mumbai', ' ', '%20')
from generate_series(1, 95) gs
on conflict (slug) do nothing;

insert into offers (
  restaurant_id, platform_id, offer_text, discount_type, discount_percent, minimum_bill, maximum_discount_cap,
  cashback_or_instant, membership_required, payment_required, valid_days, valid_start_time, valid_end_time,
  valid_from, valid_until, meal_type, alcohol_included, service_charge_included, booking_required, terms_text,
  offer_url, source_url, source_platform, verification_status, confidence_score, active, last_checked_at, last_changed_at
)
select r.id, p.id, '25% off up to Rs 1,000', 'percentage', 25, 1500, 1000, 'instant', false, false,
array['monday','tuesday','wednesday','thursday','friday','saturday','sunday'], '11:00', '23:30',
'2026-01-01','2026-12-31','all_day', false, false, true, 'Seed demo offer. Admin must verify source before marking verified.',
coalesce(p.base_url,'https://example.com') || '/mumbai/' || r.slug, coalesce(p.base_url,'https://example.com') || '/mumbai/' || r.slug, p.name, 'needs_review', .55, true, now(), now()
from restaurants r cross join platforms p
where p.slug = 'eazydiner'
on conflict do nothing;

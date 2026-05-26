create extension if not exists pg_trgm;
create extension if not exists "uuid-ossp";

create table if not exists restaurants (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  city text default 'Mumbai',
  area text not null,
  address text,
  cuisine text[],
  approx_cost_for_two integer,
  rating numeric,
  image_url text,
  google_maps_url text,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists platforms (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  logo_url text,
  base_url text,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists restaurant_platform_links (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid references restaurants(id) on delete cascade,
  platform_id uuid references platforms(id) on delete cascade,
  platform_restaurant_url text,
  platform_restaurant_id text,
  active boolean default true,
  last_checked_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists restaurant_aliases (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid references restaurants(id) on delete cascade,
  alias_name text not null,
  source_platform text,
  created_at timestamptz default now()
);

create table if not exists offers (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid references restaurants(id) on delete cascade,
  platform_id uuid references platforms(id) on delete cascade,
  offer_text text not null,
  discount_type text check (discount_type in ('percentage','flat','cashback','bogo','custom')),
  discount_percent numeric,
  flat_discount numeric,
  minimum_bill numeric,
  maximum_discount_cap numeric,
  cashback_value numeric,
  cashback_or_instant text check (cashback_or_instant in ('instant','cashback','both','unknown')),
  membership_required boolean default false,
  membership_text text,
  payment_required boolean default false,
  payment_text text,
  valid_days text[],
  valid_start_time time,
  valid_end_time time,
  valid_from date,
  valid_until date,
  meal_type text check (meal_type in ('lunch','dinner','all_day','unknown')),
  alcohol_included boolean,
  service_charge_included boolean,
  booking_required boolean default true,
  terms_text text,
  offer_url text,
  source_url text,
  source_platform text,
  verification_status text check (verification_status in ('verified','needs_review','expired','uncertain')),
  confidence_score numeric,
  active boolean default true,
  last_checked_at timestamptz,
  last_changed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists offer_history (
  id uuid primary key default uuid_generate_v4(),
  offer_id uuid references offers(id) on delete cascade,
  old_offer_text text,
  new_offer_text text,
  old_discount_percent numeric,
  new_discount_percent numeric,
  old_cap numeric,
  new_cap numeric,
  old_minimum_bill numeric,
  new_minimum_bill numeric,
  change_reason text,
  changed_at timestamptz default now()
);

create table if not exists user_searches (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid references restaurants(id),
  bill_amount numeric,
  search_date date,
  search_time time,
  people_count integer,
  meal_type text,
  best_platform_id uuid references platforms(id),
  estimated_saving numeric,
  cashback_value numeric,
  final_payable numeric,
  created_at timestamptz default now()
);

create table if not exists admin_users (
  id uuid primary key default uuid_generate_v4(),
  auth_user_id uuid,
  name text,
  email text unique,
  role text check (role in ('admin','editor','viewer')),
  created_at timestamptz default now()
);

create index if not exists restaurants_slug_idx on restaurants(slug);
create index if not exists restaurants_area_idx on restaurants(area);
create index if not exists restaurants_cuisine_gin_idx on restaurants using gin(cuisine);
create index if not exists restaurants_name_trgm_idx on restaurants using gin(name gin_trgm_ops);
create index if not exists restaurants_area_trgm_idx on restaurants using gin(area gin_trgm_ops);
create index if not exists restaurant_aliases_alias_trgm_idx on restaurant_aliases using gin(alias_name gin_trgm_ops);
create index if not exists offers_restaurant_id_idx on offers(restaurant_id);
create index if not exists offers_platform_id_idx on offers(platform_id);
create index if not exists offers_active_idx on offers(active);
create index if not exists offers_verification_status_idx on offers(verification_status);
create index if not exists offers_last_checked_at_idx on offers(last_checked_at);

create or replace function search_restaurants(search_text text, result_limit int default 10)
returns table (
  id uuid,
  name text,
  slug text,
  city text,
  area text,
  address text,
  cuisine text[],
  approx_cost_for_two integer,
  rating numeric,
  image_url text,
  google_maps_url text,
  active boolean,
  created_at timestamptz,
  updated_at timestamptz,
  match_score numeric,
  match_reason text
)
language sql stable as $$
  with normalized as (
    select lower(regexp_replace(trim(search_text), '[^a-zA-Z0-9 ]', ' ', 'g')) as q
  ),
  alias_scores as (
    select restaurant_id, max(similarity(lower(alias_name), (select q from normalized))) as alias_similarity
    from restaurant_aliases
    group by restaurant_id
  ),
  scored as (
    select
      r.*,
      case
        when lower(r.name) = (select q from normalized) then 100
        when coalesce(a.alias_similarity, 0) > 0.92 then 95
        when lower(r.name) like (select q from normalized) || '%' then 80
        when lower(r.name) like '%' || (select q from normalized) || '%' then 60
        when lower(r.name || ' ' || r.area) like '%' || (select q from normalized) || '%' then 55
        when lower(r.area) = (select q from normalized) then 45
        when lower(r.area) like '%' || (select q from normalized) || '%' then 35
        when lower(array_to_string(r.cuisine, ' ')) like '%' || (select q from normalized) || '%' then 25
        else greatest(
          similarity(lower(r.name || ' ' || r.area), (select q from normalized)),
          similarity(lower(r.name), (select q from normalized)),
          similarity(lower(r.area), (select q from normalized)),
          similarity(lower(array_to_string(r.cuisine, ' ')), (select q from normalized)),
          coalesce(a.alias_similarity, 0)
        ) * 30
      end + coalesce(r.rating, 0) * 2 as score,
      case
        when lower(r.name) = (select q from normalized) then 'exact name match'
        when coalesce(a.alias_similarity, 0) > 0.92 then 'alias exact match'
        when lower(r.name) like (select q from normalized) || '%' then 'name starts with query'
        when lower(r.name) like '%' || (select q from normalized) || '%' then 'name includes query'
        when lower(r.name || ' ' || r.area) like '%' || (select q from normalized) || '%' then 'restaurant and area match'
        when lower(r.area) = (select q from normalized) then 'area exact match'
        when lower(r.area) like '%' || (select q from normalized) || '%' then 'area match'
        when lower(array_to_string(r.cuisine, ' ')) like '%' || (select q from normalized) || '%' then 'cuisine match'
        else 'fuzzy match'
      end as reason
    from restaurants r
    left join alias_scores a on a.restaurant_id = r.id
    where r.active = true
  )
  select id, name, slug, city, area, address, cuisine, approx_cost_for_two, rating, image_url, google_maps_url, active, created_at, updated_at, round(score, 2), reason
  from scored
  where score > 8
  order by score desc, rating desc nulls last, name
  limit result_limit;
$$;

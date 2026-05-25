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
create index if not exists offers_restaurant_id_idx on offers(restaurant_id);
create index if not exists offers_platform_id_idx on offers(platform_id);
create index if not exists offers_active_idx on offers(active);
create index if not exists offers_verification_status_idx on offers(verification_status);
create index if not exists offers_last_checked_at_idx on offers(last_checked_at);

create or replace function search_restaurants(search_text text, result_limit int default 10)
returns setof restaurants
language sql stable as $$
  select *
  from restaurants
  where active = true
    and (
      name ilike '%' || search_text || '%'
      or area ilike '%' || search_text || '%'
      or cuisine::text ilike '%' || search_text || '%'
      or similarity(name, search_text) > 0.25
    )
  order by greatest(similarity(name, search_text), similarity(area, search_text)) desc, name
  limit result_limit;
$$;

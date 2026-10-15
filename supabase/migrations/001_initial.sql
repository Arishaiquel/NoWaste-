create extension if not exists pgcrypto;

create table telegram_users (
  id uuid primary key default gen_random_uuid(),
  telegram_user_id bigint unique not null,
  telegram_chat_id bigint not null,
  username text,
  first_name text,
  timezone text not null default 'Asia/Singapore',
  created_at timestamptz not null default now()
);

create table receipts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references telegram_users(id) on delete cascade,
  telegram_message_id bigint not null,
  store_name text,
  purchase_date date not null,
  currency char(3),
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled')),
  extraction_json jsonb not null,
  created_at timestamptz not null default now(),
  unique (user_id, telegram_message_id)
);

create table pantry_items (
  id uuid primary key default gen_random_uuid(),
  receipt_id uuid references receipts(id) on delete set null,
  user_id uuid not null references telegram_users(id) on delete cascade,
  raw_name text not null,
  normalized_name text not null,
  food_category text not null,
  quantity numeric not null default 1,
  unit text,
  price numeric,
  purchase_date date not null,
  storage_method text not null default 'unknown' check (storage_method in ('refrigerator','freezer','pantry','counter','unknown')),
  perishable boolean not null,
  extraction_confidence numeric not null,
  needs_review boolean not null default false,
  shelf_life_min_days integer,
  shelf_life_max_days integer,
  freshness_risk integer,
  freshness_status text not null default 'No guidance',
  status text not null default 'active' check (status in ('active','consumed','discarded')),
  opened_at timestamptz,
  frozen_at timestamptz,
  consumed_at timestamptz,
  discarded_at timestamptz,
  last_alert_threshold integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (receipt_id, raw_name, normalized_name)
);

create table alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references telegram_users(id) on delete cascade,
  pantry_item_id uuid not null references pantry_items(id) on delete cascade,
  threshold integer not null,
  message text not null,
  sent_at timestamptz not null default now(),
  unique (pantry_item_id, threshold)
);

create table recipe_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references telegram_users(id) on delete cascade,
  recipe_json jsonb not null,
  created_at timestamptz not null default now()
);

create table processed_telegram_updates (
  update_id bigint primary key,
  processed_at timestamptz not null default now()
);

create table app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table telegram_users enable row level security;
alter table receipts enable row level security;
alter table pantry_items enable row level security;
alter table alerts enable row level security;
alter table recipe_generations enable row level security;
alter table processed_telegram_updates enable row level security;
alter table app_settings enable row level security;

create index pantry_active_risk_idx on pantry_items(status, freshness_risk desc);
create index pantry_user_idx on pantry_items(user_id);

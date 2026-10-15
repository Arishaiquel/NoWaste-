alter table telegram_users add column if not exists auth_user_id uuid unique references auth.users(id) on delete set null;
create index if not exists telegram_users_auth_user_idx on telegram_users(auth_user_id);

alter table receipts alter column telegram_message_id drop not null;

create table if not exists telegram_link_tokens (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  token_hash text unique not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
alter table telegram_link_tokens enable row level security;

create policy "Users read linked telegram identity" on telegram_users for select to authenticated using (auth_user_id = auth.uid());
create policy "Users read own receipts" on receipts for select to authenticated using (user_id in (select id from telegram_users where auth_user_id = auth.uid()));
create policy "Users read own pantry" on pantry_items for select to authenticated using (user_id in (select id from telegram_users where auth_user_id = auth.uid()));
create policy "Users update own pantry" on pantry_items for update to authenticated using (user_id in (select id from telegram_users where auth_user_id = auth.uid())) with check (user_id in (select id from telegram_users where auth_user_id = auth.uid()));
create policy "Users read own outcomes" on food_outcomes for select to authenticated using (user_id in (select id from telegram_users where auth_user_id = auth.uid()));


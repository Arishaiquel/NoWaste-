-- Append-only behavior history. Existing pantry state remains the source of truth for inventory.
create table if not exists food_outcomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references telegram_users(id) on delete cascade,
  pantry_item_id uuid not null references pantry_items(id) on delete cascade,
  normalized_name text not null,
  food_category text not null,
  action text not null check (action in ('consumed', 'discarded', 'frozen')),
  quantity numeric not null check (quantity >= 0),
  unit text,
  price_value numeric,
  discard_reason text check (
    discard_reason is null or discard_reason in (
      'forgot_about_it', 'bought_too_much', 'spoiled_before_use',
      'changed_plans', 'did_not_like', 'storage_issue', 'other'
    )
  ),
  freshness_risk_at_action integer check (freshness_risk_at_action between 0 and 100),
  action_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table food_outcomes enable row level security;
create index if not exists food_outcomes_user_food_idx on food_outcomes(user_id, normalized_name, action_at desc);
create index if not exists food_outcomes_pantry_item_idx on food_outcomes(pantry_item_id);

-- Remove the legacy constraint before canonicalizing values because it rejects
-- the new reason names during the update.
alter table pantry_items drop constraint if exists pantry_items_discard_reason_check;

-- Canonicalize legacy structured reasons without losing existing records.
update pantry_items set discard_reason = case discard_reason
  when 'forgot' then 'forgot_about_it'
  when 'spoiled' then 'spoiled_before_use'
  when 'disliked' then 'did_not_like'
  else discard_reason
end
where discard_reason in ('forgot', 'spoiled', 'disliked');

alter table pantry_items add constraint pantry_items_discard_reason_check check (
  discard_reason is null or discard_reason in (
    'forgot_about_it', 'bought_too_much', 'spoiled_before_use',
    'changed_plans', 'did_not_like', 'storage_issue', 'other'
  )
);

create or replace function log_pantry_outcome()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  outcome_action text;
  outcome_at timestamptz;
begin
  if new.status = 'consumed' and old.status is distinct from 'consumed' then
    outcome_action := 'consumed'; outcome_at := coalesce(new.consumed_at, now());
  elsif new.status = 'discarded' and old.status is distinct from 'discarded' then
    outcome_action := 'discarded'; outcome_at := coalesce(new.discarded_at, now());
  elsif new.frozen_at is not null and old.frozen_at is null then
    outcome_action := 'frozen'; outcome_at := new.frozen_at;
  else
    return new;
  end if;

  insert into food_outcomes (
    user_id, pantry_item_id, normalized_name, food_category, action, quantity,
    unit, price_value, discard_reason, freshness_risk_at_action, action_at
  ) values (
    new.user_id, new.id, new.normalized_name, new.food_category, outcome_action, new.quantity,
    new.unit, new.price, case when outcome_action = 'discarded' then new.discard_reason else null end,
    coalesce(new.action_risk, new.freshness_risk), outcome_at
  );
  return new;
end;
$$;

drop trigger if exists pantry_outcome_history on pantry_items;
create trigger pantry_outcome_history
after update on pantry_items
for each row execute function log_pantry_outcome();

-- Backfill past whole-item outcomes once. This preserves the MVP's whole-item semantics.
insert into food_outcomes (
  user_id, pantry_item_id, normalized_name, food_category, action, quantity,
  unit, price_value, discard_reason, freshness_risk_at_action, action_at
)
select p.user_id, p.id, p.normalized_name, p.food_category, outcome.action, p.quantity,
  p.unit, p.price, case when outcome.action = 'discarded' then p.discard_reason else null end,
  coalesce(p.action_risk, p.freshness_risk), outcome.action_at
from pantry_items p
cross join lateral (
  values
    ('consumed'::text, p.consumed_at),
    ('discarded'::text, p.discarded_at),
    ('frozen'::text, p.frozen_at)
) as outcome(action, action_at)
where outcome.action_at is not null
  and not exists (
    select 1 from food_outcomes f
    where f.pantry_item_id = p.id and f.action = outcome.action
  );

alter table pantry_items add column if not exists discard_reason text;
alter table pantry_items add column if not exists rescued_at timestamptz;
alter table pantry_items add column if not exists action_risk integer check (action_risk between 0 and 100);

alter table pantry_items drop constraint if exists pantry_items_discard_reason_check;
alter table pantry_items add constraint pantry_items_discard_reason_check check (
  discard_reason is null or discard_reason in (
    'forgot', 'bought_too_much', 'spoiled', 'disliked', 'changed_plans', 'other'
  )
);

create index if not exists pantry_rescue_outcomes_idx on pantry_items(rescued_at, action_risk);
create index if not exists pantry_discarded_at_idx on pantry_items(discarded_at);

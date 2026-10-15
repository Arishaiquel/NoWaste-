# NoWaste! waste intelligence

NoWaste! currently uses deterministic statistics. It does not claim to run a trained predictive model.

## Data flow

`pantry_items` remains backward-compatible inventory state. Migration `003_food_outcomes.sql` adds an append-only `food_outcomes` table and a trigger that records consumed, discarded, and frozen actions from existing dashboard and Telegram updates. The migration also backfills prior whole-item outcomes.

Structured discard reasons are: `forgot_about_it`, `bought_too_much`, `spoiled_before_use`, `changed_plans`, `did_not_like`, `storage_issue`, and `other`.

## Metrics

Waste rate uses `discarded quantity / purchased quantity` when units are convertible within one dimension. When units cannot be reliably compared, it returns the transparent event fallback `purchases with a discard / resolved purchases` and labels the result as event-based.

The analytics module also calculates average purchased, consumed, and discarded quantity; category and food waste rates; purchase frequency; top discard reason; and average days to consume or discard.

## Purchase recommendation

The production implementation of `PurchaseRecommendationModel` is `StatisticalPurchaseModel`.

For at least three resolved purchases, it calculates:

`weight = exp(-0.008 × age in days)`

`recommended quantity = sum(consumed quantity × weight) / sum(weight)`

The result is rounded to a practical increment: whole countable units, quarter litres/kilograms, or 50 grams/millilitres. With fewer than three resolved purchases, NoWaste! returns “Not enough history yet” and no quantity.

Confidence is a history-volume label: 3–5 Low, 6–10 Moderate, and more than 10 Higher. It is not a statistical confidence interval.

## Adaptive alerts

After at least three resolved purchases of a food and at least two `forgot_about_it` discards, NoWaste! may issue an additional reminder at freshness risk 55. The alert explicitly explains why it arrived earlier. Standard freshness calculations and alert bands remain deterministic.

## Demo isolation

The deployed Purchase Coach reads recorded outcomes from Supabase and does not mix synthetic history with real user records.

## Future ML boundary

A future `MLPurchaseModel` can implement `PurchaseRecommendationModel`, but it should not replace the statistical model until held-out evaluation shows an improvement. Any experiment must disclose its data source, split, baseline, metric, and limitations.

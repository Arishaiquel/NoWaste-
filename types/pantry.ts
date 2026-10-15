export type StorageMethod = "refrigerator" | "freezer" | "pantry" | "counter" | "unknown";
export type FreshnessStatus = "Fresh" | "Use soon" | "High priority" | "Check now" | "No guidance";

export interface PantryItem {
  id: string;
  user_id: string;
  normalized_name: string;
  food_category: string;
  quantity: number;
  unit: string | null;
  price: number | null;
  purchase_date: string;
  storage_method: StorageMethod;
  shelf_life_min_days: number | null;
  shelf_life_max_days: number | null;
  freshness_risk: number | null;
  freshness_status: FreshnessStatus;
  status: "active" | "consumed" | "discarded";
  last_alert_threshold: number | null;
}

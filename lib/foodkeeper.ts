import rulesJson from "@/data/food-storage-rules.json";
import type { StorageMethod } from "@/types/pantry";

export interface StorageRule { min_days: number; max_days: number; source: string; verified: boolean }
const rules = rulesJson as unknown as Record<string, Record<string, StorageRule>>;

export function defaultStorageFor(category: string): StorageMethod {
  if (["raw_poultry", "raw_meat", "fish", "leafy_vegetables", "vegetables", "dairy", "eggs"].includes(category)) return "refrigerator";
  if (category === "fruit") return "counter";
  if (["bread", "dry_goods"].includes(category)) return "pantry";
  return "unknown";
}

export function getStorageRule(category: string, storage: StorageMethod): StorageRule | null {
  return rules[category]?.[storage] ?? null;
}

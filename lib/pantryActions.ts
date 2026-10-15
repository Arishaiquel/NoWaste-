import type { StorageMethod } from "@/types/pantry";

export interface PantryActionResult { name: string; price: number | null; actionRisk: number | null }
export async function updatePantryItem(id: string, action: "consumed"|"frozen"|"discarded"|"storage", options?: { storageMethod?: StorageMethod; discardReason?: string }) {
  const response = await fetch("/api/pantry/item-action", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, action, ...options }) });
  const data = await response.json().catch(()=>({})) as { error?: string; item?: PantryActionResult };
  if (!response.ok) throw new Error(data.error ?? "Update failed");
  return data.item!;
}

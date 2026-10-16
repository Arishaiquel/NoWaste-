export interface EligibilityInput { foodCategory: string; condition: "unopened" | "opened"; storageMethod: string; refrigerationConfirmed?: boolean; }
export interface EligibilityResult { eligible: boolean; reason: string; }

const prohibited = new Set(["raw_meat", "raw_poultry", "fish", "cooked_food"]);
const refrigerated = new Set(["dairy", "eggs"]);
const lowRisk = new Set(["dry_goods", "bread", "fruit", "vegetables", "leafy_vegetables", "unknown"]);

export function checkListingEligibility(input: EligibilityInput): EligibilityResult {
  if (prohibited.has(input.foodCategory)) return { eligible: false, reason: "Raw meat, seafood, and homemade cooked meals cannot currently be shared." };
  if (refrigerated.has(input.foodCategory) && input.condition === "opened") return { eligible: false, reason: "Opened refrigerated products cannot currently be shared." };
  if (refrigerated.has(input.foodCategory) && (input.storageMethod !== "refrigerator" || !input.refrigerationConfirmed)) return { eligible: false, reason: "Please confirm this sealed item has remained refrigerated." };
  if (input.condition === "opened" && !lowRisk.has(input.foodCategory)) return { eligible: false, reason: "This opened item is outside the categories supported for the first release." };
  return { eligible: true, reason: "This item meets the current Community Rescue sharing rules." };
}

export const getEligibilityReason = (input: EligibilityInput) => checkListingEligibility(input).reason;

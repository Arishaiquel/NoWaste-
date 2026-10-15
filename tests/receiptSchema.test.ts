import { describe, expect, it } from "vitest";
import { receiptSchema } from "@/schemas/receipt";

describe("receipt structured output", () => {
  it("accepts valid grocery extraction", () => {
    expect(receiptSchema.parse({ store_name: "FairPrice", purchase_date: "2026-10-05", currency: "SGD", items: [{ raw_receipt_name: "CHKN BRST", normalized_name: "Chicken breast", brand: null, quantity: 1, unit: "500 g", price: 6.95, food_category: "raw_poultry", perishable: true, confidence: .94, needs_review: false }] }).items).toHaveLength(1);
  });
  it("rejects invented categories and invalid confidence", () => {
    expect(() => receiptSchema.parse({ store_name: null, purchase_date: null, currency: null, items: [{ raw_receipt_name: "?", normalized_name: "?", brand: null, quantity: 1, unit: null, price: null, food_category: "made_up", perishable: true, confidence: 2, needs_review: false }] })).toThrow();
  });
});

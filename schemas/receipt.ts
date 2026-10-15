import { z } from "zod";

export const foodCategories = [
  "raw_poultry", "raw_meat", "fish", "leafy_vegetables", "vegetables",
  "fruit", "dairy", "eggs", "bread", "cooked_food", "dry_goods", "unknown",
] as const;

export const receiptItemSchema = z.object({
  raw_receipt_name: z.string().min(1).max(200),
  normalized_name: z.string().min(1).max(120),
  brand: z.string().max(100).nullable(),
  quantity: z.number().positive().default(1),
  unit: z.string().max(40).nullable(),
  price: z.number().nonnegative().nullable(),
  food_category: z.enum(foodCategories),
  perishable: z.boolean(),
  confidence: z.number().min(0).max(1),
  needs_review: z.boolean(),
});

export const receiptSchema = z.object({
  store_name: z.string().max(120).nullable(),
  purchase_date: z.string().date().nullable(),
  currency: z.string().length(3).nullable(),
  items: z.array(receiptItemSchema).max(100),
});

export type ReceiptExtraction = z.infer<typeof receiptSchema>;

import { z } from "zod";

export const recipeSchema = z.object({
  name: z.string().min(1),
  ingredients_used: z.array(z.string()),
  additional_ingredients: z.array(z.string()),
  time_minutes: z.number().int().positive().max(240),
  instructions: z.array(z.string()).min(1),
});

export const recipesSchema = z.object({ recipes: z.array(recipeSchema).length(3) });
export type Recipe = z.infer<typeof recipeSchema> & { rescueScore?: number };

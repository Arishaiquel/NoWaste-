import { getOpenAI, openAIModel } from "@/lib/openai";
import { recipesSchema, type Recipe } from "@/schemas/recipe";
import { rankRecipes } from "@/lib/recipeRanker";

interface PantryRecipeItem { normalized_name: string; quantity: number; food_category: string; freshnessRisk: number; price: number | null }

export async function generateRecipes(items: PantryRecipeItem[]): Promise<Recipe[]> {
  const response = await getOpenAI().responses.create({
    model: openAIModel(),
    instructions: "Create exactly three realistic meal ideas. Prioritize the highest freshness-risk pantry foods. Never claim the user owns ingredients not listed. Only oil, salt, pepper, and water may be assumed; put every other missing ingredient in additional_ingredients. Return only the schema.",
    input: `Available pantry:\n${JSON.stringify(items)}`,
    text: { format: { type: "json_schema", name: "meal_rescue", strict: true, schema: {
      type: "object", additionalProperties: false, required: ["recipes"], properties: { recipes: { type: "array", minItems: 3, maxItems: 3, items: {
        type: "object", additionalProperties: false, required: ["name", "ingredients_used", "additional_ingredients", "time_minutes", "instructions"], properties: {
          name: { type: "string" }, ingredients_used: { type: "array", items: { type: "string" } }, additional_ingredients: { type: "array", items: { type: "string" } }, time_minutes: { type: "integer" }, instructions: { type: "array", items: { type: "string" } }
        }
      } } }
    } } },
  });
  const parsed = recipesSchema.parse(JSON.parse(response.output_text));
  return rankRecipes(parsed.recipes, items);
}

import type { Recipe } from "@/schemas/recipe";

interface Candidate { normalized_name: string; freshnessRisk: number; price: number | null }

export function rankRecipes(recipes: Recipe[], pantry: Candidate[]): Recipe[] {
  const items = new Map(pantry.map((item) => [item.normalized_name.toLowerCase(), item]));
  return recipes.map((recipe) => ({
    ...recipe,
    rescueScore: Math.round(recipe.ingredients_used.reduce((sum, name) => {
      const item = items.get(name.toLowerCase());
      if (!item) return sum;
      const value = item.price && item.price > 0 ? item.price : 1;
      return sum + (item.freshnessRisk / 100) * value;
    }, 0) * 100) / 100,
  })).sort((a, b) => (b.rescueScore ?? 0) - (a.rescueScore ?? 0));
}

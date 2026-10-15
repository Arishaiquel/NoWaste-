import { describe, expect, it } from "vitest";
import { rankRecipes } from "@/lib/recipeRanker";

describe("deterministic recipe ranking", () => {
  it("ranks recipes by rescued risk-weighted value", () => {
    const recipes = [
      { name: "Toast", ingredients_used: ["Bread"], additional_ingredients: [], time_minutes: 5, instructions: ["Toast"] },
      { name: "Chicken salad", ingredients_used: ["Chicken breast", "Spinach"], additional_ingredients: [], time_minutes: 20, instructions: ["Cook thoroughly"] },
    ];
    const ranked = rankRecipes(recipes, [
      { normalized_name: "Bread", freshnessRisk: 40, price: 2 },
      { normalized_name: "Chicken breast", freshnessRisk: 90, price: 7 },
      { normalized_name: "Spinach", freshnessRisk: 80, price: 3 },
    ]);
    expect(ranked[0].name).toBe("Chicken salad");
    expect(ranked[0].rescueScore).toBe(8.7);
  });
});

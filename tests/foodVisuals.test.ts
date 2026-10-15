import { describe, expect, it } from "vitest";
import { getFoodVisual } from "@/lib/foodVisuals";

describe("specific food visual mapping", () => {
  it("keeps visually similar fruits distinct", () => {
    const names = ["Apple", "Kiwi", "Watermelon", "Strawberry", "Blueberries", "Raspberries", "Grapes", "Lemon"];
    const keys = names.map((name) => getFoodVisual(name, "fruit").key);
    expect(new Set(keys).size).toBe(names.length);
  });

  it("uses name matches before category fallbacks", () => {
    expect(getFoodVisual("Broccoli florets", "vegetables").key).toBe("broccoli");
    expect(getFoodVisual("Chicken breast", "raw_poultry").key).toBe("chicken");
    expect(getFoodVisual("Mystery produce", "fruit").key).toBe("fruit");
  });
});

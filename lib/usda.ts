const BASE_URL = "https://api.nal.usda.gov/fdc/v1";
const cache = new Map<string, { expires: number; value: unknown }>();

async function request(path: string, init?: RequestInit) {
  const key = `${path}:${init?.body ?? ""}`;
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value;
  if (!process.env.USDA_FDC_API_KEY) throw new Error("USDA_FDC_API_KEY is not configured");
  const url = `${BASE_URL}${path}${path.includes("?") ? "&" : "?"}api_key=${encodeURIComponent(process.env.USDA_FDC_API_KEY)}`;
  const response = await fetch(url, init);
  if (!response.ok) throw new Error(`USDA FoodData Central failed: ${response.status}`);
  const value: unknown = await response.json();
  cache.set(key, { expires: Date.now() + 60 * 60 * 1000, value });
  return value;
}

export function searchFood(query: string) {
  return request("/foods/search", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ query, pageSize: 5 }) });
}

export function getFoodDetails(fdcId: number) { return request(`/food/${fdcId}`); }

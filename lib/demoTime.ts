import { addDays } from "date-fns";
import { getAdminSupabase } from "@/lib/supabase";

export function isDemoMode() { return process.env.NEXT_PUBLIC_DEMO_MODE === "true"; }

export async function effectiveNow(): Promise<Date> {
  if (!isDemoMode()) return new Date();
  const { data } = await getAdminSupabase().from("app_settings").select("value").eq("key", "simulated_date_offset").maybeSingle();
  const days = Number((data?.value as { days?: number } | null)?.days ?? 0);
  return addDays(new Date(), days);
}

export async function setDemoOffset(days: number) {
  if (!isDemoMode()) throw new Error("Demo mode is disabled");
  if (![0, 1, 3, 7].includes(days)) throw new Error("Invalid demo offset");
  return getAdminSupabase().from("app_settings").upsert({ key: "simulated_date_offset", value: { days }, updated_at: new Date().toISOString() });
}

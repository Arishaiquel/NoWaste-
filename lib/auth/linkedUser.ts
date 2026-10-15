import { getAdminSupabase } from "@/lib/supabase";

export async function linkedTelegramUserId(authUserId: string) {
  const { data, error } = await getAdminSupabase()
    .from("telegram_users")
    .select("id")
    .eq("auth_user_id", authUserId)
    .maybeSingle();
  if (error) throw error;
  return data?.id as string | undefined;
}


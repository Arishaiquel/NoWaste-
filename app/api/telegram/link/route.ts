import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth/server";
import { getAdminSupabase } from "@/lib/supabase";

export async function POST() {
  const user = await requireAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const token = randomBytes(24).toString("hex");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 15 * 60_000).toISOString();
  const db = getAdminSupabase();
  await db.from("telegram_link_tokens").delete().eq("auth_user_id", user.id).is("used_at", null);
  const { error } = await db.from("telegram_link_tokens").insert({ auth_user_id: user.id, token_hash: tokenHash, expires_at: expiresAt });
  if (error) return NextResponse.json({ error: "Could not create link" }, { status: 500 });
  return NextResponse.json({ url: `/api/telegram/open?command=link_${token}`, expiresAt });
}


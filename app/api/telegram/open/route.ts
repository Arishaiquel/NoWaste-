import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return NextResponse.redirect("https://t.me/");
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/getMe`, { cache: "force-cache" });
    const result = await response.json() as { ok: boolean; result?: { username?: string } };
    if (!result.ok || !result.result?.username) throw new Error("Bot username unavailable");
    const requested = request.nextUrl.searchParams.get("command") ?? "home";
    const command = requested === "rescue" || /^link_[a-f0-9]{48}$/.test(requested) ? requested : "home";
    return NextResponse.redirect(`https://t.me/${result.result.username}?start=${command}`);
  } catch {
    return NextResponse.redirect("https://t.me/");
  }
}

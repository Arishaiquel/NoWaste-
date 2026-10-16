import { NextRequest, NextResponse } from "next/server";
import { telegramBotUrl } from "@/lib/telegramBot";

export async function GET(request: NextRequest) {
  const command = request.nextUrl.searchParams.get("command") ?? "home";
  return NextResponse.redirect(telegramBotUrl(command));
}

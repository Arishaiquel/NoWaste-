import { NextRequest, NextResponse } from "next/server";
import { GUEST_DEMO_COOKIE } from "@/lib/guestDemo";

export function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  response.cookies.set(GUEST_DEMO_COOKIE, "1", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 4, path: "/" });
  return response;
}

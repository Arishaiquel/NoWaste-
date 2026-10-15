import { NextResponse } from "next/server";
import { createAuthClient } from "@/lib/auth/server";

export async function POST(request: Request) {
  const auth = await createAuthClient();
  await auth.auth.signOut();
  return NextResponse.redirect(new URL("/", request.url), 303);
}


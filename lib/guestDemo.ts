import { cookies } from "next/headers";

export const GUEST_DEMO_COOKIE = "nowaste_guest_demo";

export async function isGuestDemo() {
  return (await cookies()).get(GUEST_DEMO_COOKIE)?.value === "1";
}

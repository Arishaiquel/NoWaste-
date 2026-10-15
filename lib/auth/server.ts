import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createAuthClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (values) => {
          try { values.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); }
          catch { /* Server Components cannot write cookies; proxy refreshes them. */ }
        },
      },
    },
  );
}

export async function requireAuthUser() {
  const auth = await createAuthClient();
  const { data, error } = await auth.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}


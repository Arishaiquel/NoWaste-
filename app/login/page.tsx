import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { requireAuthUser } from "@/lib/auth/server";

export const dynamic = "force-dynamic";
export default async function LoginPage() {
  if (await requireAuthUser()) redirect("/dashboard");
  return <main className="mx-auto max-w-5xl px-5 py-16"><p className="eyebrow">Secure account</p><h1 className="mt-4 text-5xl font-black tracking-tight">Sign in to your kitchen.</h1><p className="mt-4 max-w-xl text-[#526259]">We&apos;ll send a password-free sign-in link to your email. Your pantry and recommendations remain scoped to your account.</p><AuthForm/></main>;
}


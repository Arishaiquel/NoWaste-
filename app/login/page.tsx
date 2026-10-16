import { redirect } from "next/navigation";
import Image from "next/image";
import { AuthForm } from "@/components/AuthForm";
import { requireAuthUser } from "@/lib/auth/server";

export const dynamic = "force-dynamic";
export default async function LoginPage() {
  if (await requireAuthUser()) redirect("/dashboard");
  return <main className="auth-page mx-auto max-w-5xl px-5 py-10 sm:py-14"><div className="mx-auto max-w-lg">
    <div className="flex flex-col items-center text-center">
      <span className="grid size-24 place-items-center overflow-hidden rounded-[1.75rem] bg-[#e8f3d2] shadow-[0_14px_35px_#164b3520] sm:size-28"><Image src="/nowaste-vegetable-logo.png" alt="NoWaste logo" width={112} height={112} className="size-full object-contain" priority/></span>
      <p className="mt-4 text-4xl font-black tracking-[-.045em] text-[#164b35] sm:text-5xl">NoWaste!</p>
      <h1 className="mt-7 text-3xl font-black tracking-tight sm:text-4xl">Your kitchen, kept private.</h1>
      <p className="mt-3 max-w-md text-base leading-7 text-[#526259]">Make a new account or sign in to an existing one. We use secure email links, so there is no password to remember.</p>
    </div>
    <AuthForm/>
  </div></main>;
}


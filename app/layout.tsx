import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requireAuthUser } from "@/lib/auth/server";
import "./globals.css";

export const metadata: Metadata = { title: "NoWaste!", description: "Receipt-to-pantry food waste prevention" };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireAuthUser();
  return <html lang="en"><body className="noise">
    <header className="site-header mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3 px-5 py-4 sm:flex-nowrap">
      <Link href="/" className="flex items-center gap-2 text-xl font-black"><span className="grid size-10 place-items-center overflow-hidden rounded-xl bg-[#e8f3d2]"><Image src="/nowaste-vegetable-logo.png" alt="" width={40} height={40} className="size-10 object-contain" priority/></span>NoWaste!</Link>
      <nav className="flex w-full shrink-0 items-center justify-between gap-2 text-xs font-bold sm:w-auto sm:justify-start sm:gap-4 sm:text-sm"><Link href="/dashboard">Kitchen</Link><Link href="/coach">Coach</Link><Link href="/upload">Upload</Link><Link href="/telegram"><span className="sm:hidden">Bot</span><span className="hidden sm:inline">Telegram Bot</span></Link><Link href="/responsible-ai"><span className="sm:hidden">AI</span><span className="hidden sm:inline">Responsible AI</span></Link>{user ? <form action="/auth/signout" method="post"><button className="font-bold">Sign out</button></form> : <Link href="/login" className="rounded-full bg-[#164b35] px-4 py-2 text-white">Sign in</Link>}</nav>
    </header>
    {children}
    <footer className="mx-auto mt-20 max-w-6xl border-t border-[#164b3530] px-5 py-8 text-sm text-[#567061]">NoWaste! predicts freshness priority, not food safety. Storage and handling conditions may change every estimate.</footer>
  </body></html>;
}

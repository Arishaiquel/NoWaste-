"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const primaryLinks = [
  { href: "/dashboard", label: "Kitchen" },
  { href: "/community", label: "Community" },
  { href: "/coach", label: "Coach" },
];

const moreLinks = [
  { href: "/upload", label: "Upload" },
  { href: "/telegram", label: "Telegram" },
  { href: "/responsible-ai", label: "Responsible AI" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNav({ guest, signedIn }: { guest: boolean; signedIn: boolean }) {
  const pathname = usePathname();
  const linkClass = (href: string) => `border-b-2 px-1 py-2 transition-colors ${isActive(pathname, href) ? "border-[#164b35] text-[#164b35]" : "border-transparent text-[#526259] hover:text-[#164b35]"}`;
  const moreActive = moreLinks.some(({ href }) => isActive(pathname, href));

  return <nav className="flex w-full min-w-0 items-center justify-between gap-2 text-sm font-bold sm:w-auto sm:justify-start sm:gap-5" aria-label="Main navigation">
    {primaryLinks.map(({ href, label }) => <Link key={href} href={href} className={linkClass(href)} aria-current={isActive(pathname, href) ? "page" : undefined}>{label}</Link>)}
    <details className="group relative">
      <summary className={`cursor-pointer list-none border-b-2 px-1 py-2 transition-colors [&::-webkit-details-marker]:hidden ${moreActive ? "border-[#164b35] text-[#164b35]" : "border-transparent text-[#526259] hover:text-[#164b35]"}`}>More <span aria-hidden="true" className="inline-block text-xs transition group-open:rotate-180">▾</span></summary>
      <div className="absolute right-0 z-50 mt-2 min-w-44 border border-[#164b3520] bg-[#fffdf7] py-2 shadow-[0_12px_30px_rgba(22,75,53,.12)]">
        {moreLinks.map(({ href, label }) => <Link key={href} href={href} className={`block px-4 py-2.5 ${isActive(pathname, href) ? "bg-[#edf5ef] text-[#164b35]" : "text-[#526259] hover:bg-[#f4f1e9] hover:text-[#164b35]"}`} aria-current={isActive(pathname, href) ? "page" : undefined}>{label}</Link>)}
      </div>
    </details>
    {guest && <span className="rounded-full border border-[#164b3520] bg-[#f4f1e9] px-2 py-1 text-[11px] font-bold text-[#68766e]">Demo</span>}
    {signedIn ? <form action="/auth/signout" method="post"><button className="text-[#526259] hover:text-[#164b35]">Sign out</button></form> : !guest && <Link href="/login" className="rounded-full bg-[#164b35] px-4 py-2 text-white">Sign in</Link>}
  </nav>;
}

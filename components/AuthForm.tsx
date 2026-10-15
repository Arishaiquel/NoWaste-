"use client";

import { useState } from "react";
import { createAuthBrowserClient } from "@/lib/auth/browser";

export function AuthForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    const auth = createAuthBrowserClient();
    const { error } = await auth.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard` } });
    setMessage(error ? error.message : "Check your email for your secure sign-in link."); setBusy(false);
  }
  return <form onSubmit={submit} className="card mt-8 max-w-md p-6">
    <label htmlFor="email" className="text-sm font-black">Email address</label>
    <input id="email" type="email" required value={email} onChange={(event)=>setEmail(event.target.value)} placeholder="you@example.com" className="mt-2 w-full rounded-xl border border-[#cad2cc] bg-white px-4 py-3"/>
    <button disabled={busy} className="button mt-4 w-full bg-[#164b35] text-white disabled:opacity-50">{busy ? "Sending…" : "Email me a sign-in link"}</button>
    {message && <p role="status" className="mt-4 text-sm text-[#526259]">{message}</p>}
  </form>;
}


"use client";

import { useState } from "react";
import { createAuthBrowserClient } from "@/lib/auth/browser";

type AuthMode = "signup" | "signin";

export function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("signup");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage(""); setIsError(false);
    const auth = createAuthBrowserClient();
    const { error } = await auth.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        shouldCreateUser: mode === "signup",
      },
    });
    setIsError(Boolean(error));
    setMessage(error ? (mode === "signin" ? "We couldn't sign you in. Check that this email already has an account." : error.message) : mode === "signup" ? "Check your email to finish making your NoWaste account." : "Check your email for your secure sign-in link.");
    setBusy(false);
  }
  function chooseMode(nextMode: AuthMode) {
    setMode(nextMode);
    setMessage("");
    setIsError(false);
  }
  return <div className="card mt-8 max-w-lg overflow-hidden p-2">
    <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#ece9df] p-1" role="tablist" aria-label="Account options">
      <button type="button" role="tab" aria-selected={mode === "signup"} onClick={() => chooseMode("signup")} className={`rounded-xl px-4 py-3 text-sm font-black transition ${mode === "signup" ? "bg-white text-[#164b35] shadow-sm" : "text-[#68766e]"}`}>Make account</button>
      <button type="button" role="tab" aria-selected={mode === "signin"} onClick={() => chooseMode("signin")} className={`rounded-xl px-4 py-3 text-sm font-black transition ${mode === "signin" ? "bg-white text-[#164b35] shadow-sm" : "text-[#68766e]"}`}>Sign in</button>
    </div>
    <form onSubmit={submit} className="p-5 sm:p-7">
      <h2 className="text-2xl font-black">{mode === "signup" ? "Make your account" : "Welcome back"}</h2>
      <p className="mt-2 text-sm leading-6 text-[#68766e]">{mode === "signup" ? "Enter your email and we'll send you a secure link to create your account." : "Enter the email used for your existing NoWaste account."}</p>
      <label htmlFor="email" className="mt-6 block text-sm font-black">Email address</label>
      <input id="email" type="email" autoComplete="email" required value={email} onChange={(event)=>setEmail(event.target.value)} placeholder="you@example.com" className="mt-2 w-full rounded-xl border border-[#cad2cc] bg-white px-4 py-3 outline-none focus:border-[#164b35] focus:ring-2 focus:ring-[#164b3530]"/>
      <button disabled={busy} className="button mt-5 w-full bg-[#164b35] text-white disabled:opacity-50">{busy ? "Sending…" : mode === "signup" ? "Make account with email" : "Sign in with email"}</button>
      <p className="mt-3 text-center text-xs leading-5 text-[#7a857e]">No password needed. We&apos;ll email you a secure, one-time link.</p>
      {message && <p role={isError ? "alert" : "status"} className={`mt-4 rounded-xl px-4 py-3 text-sm ${isError ? "bg-[#fff0ed] text-[#a63328]" : "bg-[#edf5ef] text-[#287557]"}`}>{message}</p>}
    </form>
    <div className="border-t border-[#164b3520] px-5 py-5 text-center sm:px-7"><p className="text-sm text-[#68766e]">Want to look around first?</p><a href="/api/demo/start" className="button mt-3 w-full border border-[#164b3540] bg-white text-[#164b35]">Try demo as guest →</a></div>
  </div>;
}


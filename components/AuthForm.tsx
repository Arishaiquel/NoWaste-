"use client";

import { useState } from "react";
import { createAuthBrowserClient } from "@/lib/auth/browser";

export function AuthForm() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function signInWithGoogle() {
    setBusy(true);
    setError("");

    const auth = createAuthBrowserClient();
    const { error: authError } = await auth.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    if (authError) {
      setError(authError.message);
      setBusy(false);
    }
  }

  return <div className="card mt-8 max-w-lg overflow-hidden p-2">
    <div className="p-5 sm:p-7">
      <h2 className="text-2xl font-black">Continue with Google</h2>
      <p className="mt-2 text-sm leading-6 text-[#68766e]">Use your Google account to make a NoWaste account or sign back in.</p>
      <button type="button" onClick={signInWithGoogle} disabled={busy} className="button mt-6 flex w-full items-center justify-center gap-3 border border-[#cad2cc] bg-white text-[#17221c] shadow-sm disabled:opacity-50">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
          <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z"/>
          <path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.63-2.36l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z"/>
          <path fill="#FBBC05" d="M6.39 13.93A6 6 0 0 1 6.08 12c0-.67.12-1.32.31-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.55l3.35-2.62Z"/>
          <path fill="#EA4335" d="M12 5.94c1.47 0 2.79.51 3.83 1.5l2.87-2.88A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z"/>
        </svg>
        {busy ? "Opening Google…" : "Continue with Google"}
      </button>
      <p className="mt-4 text-center text-xs leading-5 text-[#7a857e]">No password or email sign-in link required.</p>
      {error && <p role="alert" className="mt-4 rounded-xl bg-[#fff0ed] px-4 py-3 text-sm text-[#a63328]">{error}</p>}
    </div>
    <div className="border-t border-[#164b3520] px-5 py-5 text-center sm:px-7"><p className="text-sm text-[#68766e]">Want to look around first?</p><a href="/api/demo/start" className="button mt-3 w-full border border-[#164b3540] bg-white text-[#164b35]">Try demo as guest →</a></div>
  </div>;
}


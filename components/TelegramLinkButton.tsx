"use client";
import { useState } from "react";

export function TelegramLinkButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function link() {
    setBusy(true); setError("");
    const response = await fetch("/api/telegram/link", { method: "POST" });
    const data = await response.json().catch(()=>({})) as { url?: string; error?: string };
    if (response.ok && data.url) window.location.href = data.url;
    else { setError(data.error ?? "Could not start linking"); setBusy(false); }
  }
  return <div><button type="button" onClick={link} disabled={busy} className="button mt-4 bg-[#229ed9] text-white disabled:opacity-50">{busy ? "Opening Telegram…" : "Link my Telegram account"}</button>{error && <p role="alert" className="mt-2 text-sm text-[#a63328]">{error}</p>}</div>;
}

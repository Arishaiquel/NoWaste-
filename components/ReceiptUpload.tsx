"use client";
import { useState } from "react";
import type { ReceiptExtraction } from "@/schemas/receipt";

type Result = { receiptId: string; purchaseDate: string; extraction: ReceiptExtraction };
export function ReceiptUpload() {
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [result, setResult] = useState<Result|null>(null); const [done, setDone] = useState(false);
  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setDone(false);
    const response = await fetch("/api/receipts/upload", { method: "POST", body: new FormData(event.currentTarget) });
    const data = await response.json().catch(()=>({})) as Result & { error?: string };
    if (response.ok) setResult(data); else setError(data.error ?? "Upload failed"); setBusy(false);
  }
  async function confirm() {
    if (!result) return; setBusy(true); setError("");
    const response = await fetch("/api/receipts/confirm", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ receiptId: result.receiptId }) });
    const data = await response.json().catch(()=>({})) as { error?: string };
    if (response.ok) { setDone(true); setResult(null); } else setError(data.error ?? "Confirmation failed"); setBusy(false);
  }
  return <div className="mt-8 max-w-2xl">
    {!result && !done && <form onSubmit={upload} className="card p-6"><label htmlFor="receipt" className="block font-black">Receipt photo</label><p className="mt-1 text-sm text-[#68766e]">JPG, PNG, or WebP, up to 8 MB. Use a clear photo showing the full receipt.</p><input id="receipt" name="receipt" type="file" accept="image/jpeg,image/png,image/webp" required className="mt-5 block w-full rounded-xl border border-[#cad2cc] bg-white p-3"/><button disabled={busy} className="button mt-5 bg-[#164b35] text-white disabled:opacity-50">{busy ? "Reading receipt…" : "Review receipt"}</button></form>}
    {result && <div className="card p-6"><p className="eyebrow">Review before adding</p><h2 className="mt-2 text-2xl font-black">{result.extraction.items.length} groceries found</h2><p className="mt-2 text-sm text-[#68766e]">Purchase date: {result.purchaseDate}</p><ul className="mt-5 divide-y">{result.extraction.items.map((item,index)=><li key={`${item.raw_receipt_name}-${index}`} className="flex items-center justify-between gap-3 py-3"><span><b>{item.normalized_name}</b><small className="block text-[#68766e]">Receipt: {item.raw_receipt_name}</small></span>{(item.needs_review||item.confidence<.75)&&<span className="rounded-full bg-[#fff0d7] px-2 py-1 text-xs font-black">Review</span>}</li>)}</ul><div className="mt-5 flex gap-3"><button onClick={()=>setResult(null)} className="button border">Cancel</button><button onClick={confirm} disabled={busy} className="button bg-[#164b35] text-white disabled:opacity-50">{busy ? "Adding…" : "Add to pantry"}</button></div></div>}
    {done && <div className="card p-6"><h2 className="text-2xl font-black">Groceries added ✓</h2><p className="mt-2 text-[#526259]">Your receipt is now in your private kitchen.</p><a href="/dashboard" className="button mt-5 bg-[#164b35] text-white">Open kitchen</a></div>}
    {error && <p role="alert" className="mt-4 font-bold text-[#a63328]">{error}</p>}
  </div>;
}


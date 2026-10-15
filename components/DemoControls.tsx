"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function DemoControls() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  async function advance(days: number) { setBusy(true); setNote(""); const r = await fetch("/api/demo/advance-date", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ days }) }); setNote(r.ok ? `Simulated date set to +${days} days` : "Could not update date"); setBusy(false); router.refresh(); }
  async function run() { setBusy(true); const r = await fetch("/api/demo/run-freshness", { method: "POST" }); const j = await r.json(); setNote(r.ok ? `Checked ${j.checked} items · sent ${j.alertsSent} alerts` : "Freshness check failed"); setBusy(false); router.refresh(); }
  return <div className="card p-5"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="eyebrow">Simulated date</p><p className="mt-1 text-sm text-[#526259]">Advance time without changing production behavior.</p></div><div className="flex flex-wrap gap-2">{[[0,"Today"],[1,"+1 day"],[3,"+3 days"],[7,"+7 days"]] .map(([d,l])=><button disabled={busy} key={d} onClick={()=>advance(Number(d))} className="button border px-4 py-2 text-sm">{l}</button>)}<button disabled={busy} onClick={run} className="button bg-[#164b35] px-4 py-2 text-sm text-white">Run freshness check</button></div></div>{note && <p className="mt-3 text-sm font-bold text-[#287557]">{note}</p>}</div>;
}

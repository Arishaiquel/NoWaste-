"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function ItemActions({ id }: { id: string }) {
  const router = useRouter(); const [busy, setBusy] = useState(false);
  async function act(action: string) { setBusy(true); await fetch("/api/pantry/item-action", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, action }) }); setBusy(false); router.refresh(); }
  return <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold"><button disabled={busy} onClick={()=>act("consumed")} className="rounded-full bg-[#e3f2e9] px-3 py-2">✓ Consumed</button><button disabled={busy} onClick={()=>act("frozen")} className="rounded-full bg-[#e9eff8] px-3 py-2">❄ Frozen</button><button disabled={busy} onClick={()=>act("discarded")} className="rounded-full bg-[#f8e9e3] px-3 py-2">Discarded</button></div>;
}

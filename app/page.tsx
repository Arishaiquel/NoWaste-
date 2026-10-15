import Link from "next/link";

export default function Home() {
  return <main>
    <section className="mx-auto grid min-h-[72vh] max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-[1.12fr_.88fr]">
      <div><p className="eyebrow mb-5">Your groceries, remembered</p><h1 className="max-w-3xl text-6xl font-black leading-[.94] tracking-[-.055em] sm:text-7xl">Buy food.<br/><span className="text-[#287557]">Waste less.</span></h1>
        <p className="mt-7 max-w-xl text-lg leading-8 text-[#526259]">Send a grocery receipt to Telegram. NoWaste! turns it into a pantry, tracks what you use or waste, and learns how much you should consider buying next time.</p>
        <div className="mt-8 flex flex-wrap gap-3"><Link href="/dashboard" className="button bg-[#164b35] text-white">Open demo dashboard →</Link></div>
      </div>
      <div className="card relative overflow-hidden p-5 sm:p-8"><div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-[#d9f15b]"/><p className="eyebrow">Telegram conversation</p>
        <div className="mt-7 space-y-4 text-sm"><div className="ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-[#dff1e8] p-4">📸 <b>receipt.jpg</b></div><div className="max-w-[88%] rounded-2xl rounded-bl-sm bg-[#f0eee7] p-4"><b>🧾 I found 4 groceries</b><br/><br/>🥬 Baby spinach<br/>🍗 Chicken breast<br/>🥛 Full cream milk<br/>🍌 Bananas<br/><br/>Does this look right?</div><div className="grid grid-cols-2 gap-2"><span className="rounded-xl bg-[#164b35] p-3 text-center font-bold text-white">✅ Add to pantry</span><span className="rounded-xl border p-3 text-center font-bold">✏️ Review</span></div></div>
      </div>
    </section>
    <section className="bg-[#164b35] text-white"><div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 md:grid-cols-3">{[["01","AI reads the messy bits","Vision extracts products and turns receipt abbreviations into useful names."],["02","Your outcomes close the loop","Consumed, frozen, and discarded actions become an editable behavior history."],["03","Statistics coach the next shop","Explainable, recency-weighted consumption suggests a practical next quantity."]].map(([n,t,d])=><div key={n}><span className="text-sm font-black text-[#d9f15b]">{n}</span><h2 className="mt-5 text-2xl font-black">{t}</h2><p className="mt-3 leading-7 text-white/70">{d}</p></div>)}</div></section>
  </main>;
}

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return <main className="landing-page min-h-screen">
    <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
      <Link href="/" className="flex items-center gap-3 text-2xl font-black text-[#164b35]"><span className="grid size-12 place-items-center overflow-hidden rounded-2xl bg-[#e8f3d2]"><Image src="/nowaste-vegetable-logo.png" alt="" width={48} height={48} className="size-full object-contain" priority/></span>NoWaste!</Link>
      <Link href="/login" className="button border border-[#164b3540] bg-white px-5 py-2.5 text-[#164b35]">Sign in</Link>
    </header>
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-10 lg:grid-cols-[1.08fr_.92fr] lg:pt-16">
      <div><p className="eyebrow mb-5">A closed-loop food-waste intelligence system</p><h1 className="max-w-3xl text-5xl font-black leading-[.96] tracking-[-.055em] sm:text-7xl">Know what to use.<br/><span className="text-[#287557]">Learn what to buy.</span><br/>Rescue what&apos;s left.</h1>
        <p className="mt-7 max-w-xl text-lg leading-8 text-[#526259]">Turn grocery receipts into a living pantry that prioritizes food, learns what your household actually uses, and shares unavoidable surplus before disposal.</p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/login" className="button bg-[#164b35] px-7 text-white">Make account or sign in</Link><Link href="/api/demo/start" className="button border border-[#164b3540] bg-white px-7 text-[#164b35]">Try demo as guest →</Link></div>
        <p className="mt-4 text-sm text-[#68766e]">No password required. Explore the demo without creating an account.</p>
      </div>
      <div className="relative"><div className="absolute -inset-5 -z-10 rounded-[3rem] bg-[#d9f15b40] blur-2xl"/><div className="card relative overflow-hidden p-6 sm:p-8"><div className="absolute right-0 top-0 h-28 w-28 rounded-bl-full bg-[#d9f15b]"/><p className="eyebrow">Your kitchen learns</p>
        <div className="mt-7 space-y-4 text-sm"><div className="rounded-2xl bg-[#f0eee7] p-4"><b>🍌 Banana pattern</b><div className="mt-3 grid grid-cols-2 gap-3 text-[#526259]"><span>Usually buy<br/><b className="text-lg text-[#164b35]">7</b></span><span>Usually use<br/><b className="text-lg text-[#164b35]">4.5</b></span></div></div><div className="rounded-2xl bg-[#164b35] p-4 text-white"><span className="text-xs font-bold uppercase tracking-wider text-[#d9f15b]">Next shop</span><p className="mt-1 text-xl font-black">Buy around 5</p><p className="mt-1 text-white/70">Calculated from recent household outcomes.</p></div><div className="rounded-2xl border border-[#28755740] bg-[#edf5ef] p-4 text-[#287557]"><b>🥬 Surplus?</b> Share it nearby before discarding.</div></div>
      </div></div>
    </section>
    <section className="bg-[#164b35] text-white"><div className="mx-auto max-w-6xl px-5 py-16"><div className="max-w-2xl"><p className="eyebrow !text-[#d9f15b]">How it works</p><h2 className="mt-3 text-3xl font-black sm:text-4xl">A simple loop that gets smarter.</h2></div><div className="mt-10 grid gap-6 md:grid-cols-3">{[["01","Capture your shop","Send or upload a receipt and review the groceries found."],["02","Use food in time","See freshness priorities and move, freeze, cook, or consume items."],["03","Shop more wisely","Learn from what was consumed or discarded to guide the next shop."]].map(([n,t,d])=><article key={n} className="rounded-3xl border border-white/15 bg-white/5 p-6"><span className="text-sm font-black text-[#d9f15b]">{n}</span><h3 className="mt-5 text-xl font-black">{t}</h3><p className="mt-3 leading-7 text-white/70">{d}</p></article>)}</div></div></section>
  </main>;
}

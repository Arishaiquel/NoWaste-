import type { KitchenItemData } from "@/lib/foodVisuals";

export function KitchenSummary({ items }: { items: KitchenItemData[] }) {
  const soon = items.filter((x) => x.freshness.status === "Use soon").length;
  const high = items.filter((x) => ["High priority", "Check now"].includes(x.freshness.status)).length;
  const urgent = items.find((x) => (x.freshness.riskScore ?? 0) >= 40);
  return <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
    <span><b className="text-xl text-[#183e2d]">{items.length}</b> <span className="text-sm text-[#69786f]">items</span></span>
    <span className="h-6 w-px bg-[#163f2d24]" aria-hidden="true"/>
    <span><b className="text-xl text-[#a87b11]">{soon}</b> <span className="text-sm text-[#69786f]">use soon</span></span>
    <span><b className="text-xl text-[#c3532d]">{high}</b> <span className="text-sm text-[#69786f]">high priority</span></span>
    {urgent && <span className="ml-auto rounded-full bg-white/75 px-4 py-2 text-sm shadow-sm"><span className="text-[#7a867f]">Most urgent:</span> <b>{urgent.normalized_name}</b></span>}
  </div>;
}

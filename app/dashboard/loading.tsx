import { KitchenSkeleton } from "@/components/kitchen/KitchenView";

export default function DashboardLoading() {
  return <main className="mx-auto max-w-6xl px-5 py-12"><div className="h-14 w-72 animate-pulse rounded-2xl bg-[#dde2dc]"/><div className="mt-8"><KitchenSkeleton/></div></main>;
}

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { CommunityExperience } from "@/components/community/CommunityExperience";
import { communityDemoListings } from "@/lib/communityDemoData";
import { isGuestDemo } from "@/lib/guestDemo";
import { requireAuthUser } from "@/lib/auth/server";
import { getAdminSupabase } from "@/lib/supabase";
import type { CommunityListing } from "@/types/community";

export const dynamic = "force-dynamic";
export default async function CommunityPage() {
  const user=await requireAuthUser();const guest=!user&&await isGuestDemo();if(!user&&!guest)redirect("/login");
  let listings:CommunityListing[]=guest?communityDemoListings:[];
  if(user){try{const {data,error}=await getAdminSupabase().from("community_listings").select("id,food_name,food_category,quantity,unit,description,condition,storage_method,freshness_risk,public_latitude,public_longitude,pickup_area,pickup_location_name,pickup_start,pickup_end,status,created_at").in("status",["available","requested","reserved"]).gt("expires_at",new Date().toISOString()).limit(100);if(error)throw error;listings=(data??[]).map((x)=>({id:x.id,ownerId:"private",foodName:x.food_name,foodCategory:x.food_category,foodType:x.food_category==="fruit"||x.food_category.includes("vegetable")?"produce":x.food_category==="dry_goods"||x.food_category==="bread"?"pantry":"packaged",quantity:Number(x.quantity),unit:x.unit,description:x.description,condition:x.condition,storageMethod:x.storage_method,freshnessRisk:x.freshness_risk,publicLatitude:x.public_latitude,publicLongitude:x.public_longitude,pickupArea:x.pickup_area,pickupLocationName:x.pickup_location_name,pickupStart:x.pickup_start,pickupEnd:x.pickup_end,status:x.status,distanceKm:0,createdAt:x.created_at}));}catch{listings=[]}}
  return <main className="mx-auto max-w-[1500px] px-4 pb-12 pt-7 sm:px-5"><Suspense fallback={<div className="card p-8">Loading Community Rescue…</div>}><CommunityExperience initialListings={listings} guest={guest}/></Suspense></main>;
}

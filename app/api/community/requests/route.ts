import { NextRequest, NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth/server";
import { getAdminSupabase } from "@/lib/supabase";

export async function POST(request:NextRequest){
  const user=await requireAuthUser();if(!user)return NextResponse.json({error:"Sign in to request a pickup."},{status:401});
  const {listingId,message}=await request.json().catch(()=>({})) as {listingId?:string;message?:string};if(!listingId)return NextResponse.json({error:"Listing required."},{status:400});
  const db=getAdminSupabase();const {data:listing}=await db.from("community_listings").select("owner_id,status,expires_at").eq("id",listingId).maybeSingle();
  if(!listing||listing.status!=="available"||new Date(listing.expires_at)<=new Date())return NextResponse.json({error:"This listing is no longer available."},{status:409});
  if(listing.owner_id===user.id)return NextResponse.json({error:"You cannot request your own listing."},{status:400});
  const {error}=await db.from("community_rescue_requests").insert({listing_id:listingId,requester_id:user.id,message:message?.slice(0,300)||null,status:"pending"});
  if(error?.code==="23505")return NextResponse.json({error:"You already requested this listing."},{status:409});
  if(error)return NextResponse.json({error:"Could not send the request."},{status:500});
  await db.from("community_listings").update({status:"requested",updated_at:new Date().toISOString()}).eq("id",listingId).eq("status","available");
  return NextResponse.json({ok:true});
}

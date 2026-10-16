import { NextRequest, NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth/server";
import { getAdminSupabase } from "@/lib/supabase";
import { checkListingEligibility } from "@/lib/communityEligibility";
import { privacySafeCoordinates } from "@/lib/locationPrivacy";

export async function POST(request:NextRequest){
  const user=await requireAuthUser();if(!user)return NextResponse.json({error:"Sign in to publish a listing."},{status:401});
  const body=await request.json().catch(()=>null) as Record<string,unknown>|null;if(!body)return NextResponse.json({error:"Invalid listing."},{status:400});
  const eligibility=checkListingEligibility({foodCategory:String(body.foodCategory),condition:body.condition==="opened"?"opened":"unopened",storageMethod:String(body.storageMethod),refrigerationConfirmed:body.refrigerationConfirmed===true});
  if(!eligibility.eligible)return NextResponse.json({error:eligibility.reason},{status:422});
  const start=new Date(String(body.pickupStart));const end=new Date(String(body.pickupEnd));if(!Number.isFinite(start.getTime())||!Number.isFinite(end.getTime())||end<=start)return NextResponse.json({error:"Choose a valid pickup window."},{status:400});
  const baseLat=Number(body.latitude)||1.3048;const baseLng=Number(body.longitude)||103.8318;const location=privacySafeCoordinates(baseLat,baseLng,`${user.id}:${Date.now()}`);
  const {data,error}=await getAdminSupabase().from("community_listings").insert({owner_id:user.id,pantry_item_id:body.pantryItemId||null,food_name:String(body.foodName).slice(0,120),food_category:String(body.foodCategory),quantity:Number(body.quantity),unit:body.unit?String(body.unit).slice(0,40):null,description:body.description?String(body.description).slice(0,500):null,condition:body.condition,opened_status:body.condition,storage_method:body.storageMethod,freshness_risk:body.freshnessRisk===null?null:Number(body.freshnessRisk),public_latitude:location.publicLatitude,public_longitude:location.publicLongitude,pickup_area:String(body.pickupArea).slice(0,120),pickup_location_name:String(body.pickupLocationName).slice(0,160),pickup_start:start.toISOString(),pickup_end:end.toISOString(),expires_at:end.toISOString(),status:"available"}).select("id").single();
  return error?NextResponse.json({error:"Could not publish this listing."},{status:500}):NextResponse.json({ok:true,id:data.id});
}

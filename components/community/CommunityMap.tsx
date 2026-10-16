"use client";
import { divIcon } from "leaflet";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import type { CommunityListing } from "@/types/community";

const emoji = (category: string) => category.includes("leafy") ? "🥬" : category === "bread" ? "🍞" : category === "fruit" ? "🍌" : category === "dairy" ? "🥛" : category === "dry_goods" ? "🥫" : "🍎";
function Recenter({ listing }: { listing?: CommunityListing }) { const map=useMap();if(listing)map.flyTo([listing.publicLatitude,listing.publicLongitude],14,{duration:.5});return null; }

export default function CommunityMap({ listings, selected, onSelect }: { listings: CommunityListing[]; selected: CommunityListing|null; onSelect:(listing:CommunityListing)=>void }) {
  return <MapContainer center={[1.3048,103.8318]} zoom={13} scrollWheelZoom className="h-full min-h-[32rem] w-full" aria-label="Approximate Community Rescue listing locations">
    <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
    <Recenter listing={selected??undefined}/>
    {listings.map((listing)=><Marker key={listing.id} position={[listing.publicLatitude,listing.publicLongitude]} eventHandlers={{click:()=>onSelect(listing)}} icon={divIcon({className:"community-map-marker",html:`<span class="${listing.status==='reserved'?'reserved':''} ${Number(listing.freshnessRisk)>=70?'urgent':''}">${emoji(listing.foodCategory)}</span>`,iconSize:[46,46],iconAnchor:[23,23]})}/>) }
  </MapContainer>;
}

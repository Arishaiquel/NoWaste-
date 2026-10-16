import { describe, expect, it } from "vitest";
import { checkListingEligibility } from "@/lib/communityEligibility";
import { communityRescuePriority } from "@/lib/communityPriority";
import { privacySafeCoordinates } from "@/lib/locationPrivacy";

describe("Community Rescue safeguards",()=>{
  it("blocks high-risk raw categories deterministically",()=>{expect(checkListingEligibility({foodCategory:"raw_poultry",condition:"unopened",storageMethod:"refrigerator",refrigerationConfirmed:true}).eligible).toBe(false)});
  it("requires refrigeration confirmation for sealed dairy",()=>{expect(checkListingEligibility({foodCategory:"dairy",condition:"unopened",storageMethod:"refrigerator"}).eligible).toBe(false);expect(checkListingEligibility({foodCategory:"dairy",condition:"unopened",storageMethod:"refrigerator",refrigerationConfirmed:true}).eligible).toBe(true)});
  it("prioritizes urgent nearby food",()=>{expect(communityRescuePriority({freshnessRisk:90,distanceKm:.5,hoursUntilPickupEnds:2})).toBeGreaterThan(communityRescuePriority({freshnessRisk:20,distanceKm:8,hoursUntilPickupEnds:30}))});
  it("never returns the supplied exact coordinates",()=>{const result=privacySafeCoordinates(1.3,103.8,"listing-seed");expect(result).not.toEqual({publicLatitude:1.3,publicLongitude:103.8})});
});

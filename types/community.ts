export type CommunityListingStatus = "available" | "requested" | "reserved" | "collected" | "cancelled" | "expired";
export type RescueRequestStatus = "pending" | "accepted" | "declined" | "collected" | "cancelled";
export type CommunityFoodType = "produce" | "pantry" | "packaged" | "drinks" | "other";

export interface CommunityListing {
  id: string; ownerId: string; pantryItemId?: string | null; foodName: string; foodCategory: string; foodType: CommunityFoodType;
  quantity: number; unit: string | null; description: string | null; condition: "unopened" | "opened"; storageMethod: string;
  freshnessRisk: number | null; publicLatitude: number; publicLongitude: number; pickupArea: string; pickupLocationName: string | null;
  pickupStart: string; pickupEnd: string; status: CommunityListingStatus; distanceKm: number; createdAt: string; demo?: boolean;
}

export interface CommunityRescueRequest { id: string; listingId: string; requesterId: string; message: string | null; status: RescueRequestStatus; createdAt: string; }

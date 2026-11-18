export type AUCTION_STATUS =
  | "DRAFT"
  | "SCHEDULED"
  | "ACTIVE"
  | "ENDED"
  | "SUSPENDED"
  | "UNSOLD"
  | "PENDING_PAYMENT"
  | "COMPLETED"
  | "CANCELLED"
  | "DISPUTED"
  | "REFUNDED";
export type AUCTION_CATEGORY = "ELECTRONICS" | "ART" | "VEHICLES" | "COLLECTIBLES" | "OTHER";

export interface CreateAuctionInput {
  title: string;
  description: string;
  category: AUCTION_CATEGORY;
  images: string[];
  isFeatured?: boolean;
  status: AUCTION_STATUS;
  ownerId: string;
  startingPrice: number;
  bidStep?: number;
  reservePrice?: number | null;
  startTime: Date;
  endTime: Date;
  extensionWindowSecs?: number;
  extensionSecs?: number;
}

// What placeBid() produces, so the repository can persist it as a Bid row
export interface PlacedBid {
  auctionId: string;
  bidderId: string;
  amount: number;
  placedAt: Date;
}

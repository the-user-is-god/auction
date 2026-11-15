import { AUCTION_CATEGORY, AUCTION_STATUS } from "./auction.types.js";

export interface AuctionEntity {
  id: string;
  title: string;
  description: string | null;
  category: AUCTION_CATEGORY;
  images: string[];

  isFeatured: boolean;
  status: AUCTION_STATUS;

  startingPrice: number;
  bidStep: number;
  reservePrice: number | null;
  currentBid: number | null;
  bidCount: number;

  startTime: Date;
  endTime: Date;

  extensionWindowSecs: number;
  extensionSecs: number;

  winnerId: string | null;
  ownerId: string;

  version: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

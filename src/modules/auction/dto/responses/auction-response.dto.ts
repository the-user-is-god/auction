import { AUCTION_CATEGORY, AUCTION_STATUS } from "@modules/auction/domain/auction.types.js";

export interface AuctionResponseDto {
  id: string;
  title: string;
  description: string | null;
  category: AUCTION_CATEGORY;
  images: string[];

  isFeatured: boolean;
  status: AUCTION_STATUS;

  startingPrice: number;
  bidStep: number;
  currentBid: number | null;
  bidCount: number;
  hasReserve: boolean; // Computed boolean replacing raw reservePrice

  startTime: Date;
  endTime: Date;

  extensionWindowSecs: number;
  extensionSecs: number;

  ownerId: string;
  winnerId: string | null;

  createdAt: Date;
}

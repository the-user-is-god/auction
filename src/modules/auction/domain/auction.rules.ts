import { AuctionEntity } from "./auction.entity.js";

export function getMinimumBid(auction: AuctionEntity): number {
  return auction.currentBid === null ? auction.startingPrice : auction.currentBid + auction.bidStep;
}

export function validateBid(
  auction: AuctionEntity,
  bidderId: string,
  amount: number,
  now: Date,
): void {
  if (auction.status !== "ACTIVE") {
    throw new Error("Auction is not active");
  }

  if (now < auction.startTime || now >= auction.endTime) {
    throw new Error("Auction is not open");
  }

  if (bidderId === auction.ownerId) {
    throw new Error("Owner cannot bid on their auction");
  }

  const minimumBid = getMinimumBid(auction);

  if (amount < minimumBid) {
    throw new Error(`Minimum bid is ${minimumBid}`);
  }
}

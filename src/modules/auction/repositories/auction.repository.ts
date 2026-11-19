import { AuctionEntity } from "../domain/auction.entity.js";
import { CreateAuctionInput } from "../domain/auction.types.js";

export interface AuctionRepository {
  create(data: CreateAuctionInput): Promise<AuctionEntity>;

  findById(id: string): Promise<AuctionEntity | null>;

  updateBid(
    auction: AuctionEntity,
    bidderId: string,
    amount: number,
    now: Date,
  ): Promise<AuctionEntity | null>;
}

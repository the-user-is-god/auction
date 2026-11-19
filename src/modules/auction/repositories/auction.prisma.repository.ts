import { PrismaClient } from "@generated/prisma/client.js";
import { AuctionRepository } from "./auction.repository.js";
import { CreateAuctionInput } from "../domain/auction.types.js";
import { AuctionEntity } from "../domain/auction.entity.js";
import { AuctionMapper } from "../mappers/auction.mapper.js";

export class PrismaAuctionRepository implements AuctionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateAuctionInput): Promise<AuctionEntity> {
    const auction = await this.prisma.auction.create({
      data: AuctionMapper.toPersistence(data),
    });

    return AuctionMapper.toDomainEntity(auction);
  }

  async findById(id: string): Promise<AuctionEntity | null> {
    const auction = await this.prisma.auction.findUnique({
      where: { id },
    });

    return auction ? AuctionMapper.toDomainEntity(auction) : null;
  }

  async updateBid(
    auction: AuctionEntity,
    bidderId: string,
    amount: number,
    now: Date,
  ): Promise<AuctionEntity | null> {
    const result = await this.prisma.auction.updateMany({
      where: {
        id: auction.id,
        status: "ACTIVE",
        currentBid: auction.currentBid,
        startTime: { lte: now },
        endTime: { gt: now },
      },

      data: {
        currentBid: amount,
        highestBidderId: bidderId,
      },
    });

    // Another bidder may have updated it first.
    if (result.count === 0) {
      return null;
    }

    return this.findById(auction.id);
  }
}

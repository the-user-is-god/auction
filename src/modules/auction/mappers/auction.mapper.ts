import { Auction as PrismaAuction } from "@generated/prisma/client.js";
import { AuctionEntity } from "../domain/auction.entity.js";

export class AuctionMapper {
  static toDomainEntity(prismaAuction: PrismaAuction): AuctionEntity {
    return {
      id: prismaAuction.id,
      title: prismaAuction.title,
      description: prismaAuction.description,
      category: prismaAuction.category,
      images: prismaAuction.images,

      isFeatured: prismaAuction.isFeatured,
      status: prismaAuction.status,

      startingPrice: prismaAuction.startingPrice,
      bidStep: prismaAuction.bidStep,
      reservePrice: prismaAuction.reservePrice,
      currentBid: prismaAuction.currentBid,
      bidCount: prismaAuction.bidCount,

      startTime: new Date(prismaAuction.startTime),
      endTime: new Date(prismaAuction.endTime),

      extensionWindowSecs: prismaAuction.extensionWindowSecs,
      extensionSecs: prismaAuction.extensionSecs,

      winnerId: prismaAuction.winnerId,
      ownerId: prismaAuction.ownerId,

      version: prismaAuction.version,
      createdAt: new Date(prismaAuction.createdAt),
      updatedAt: new Date(prismaAuction.updatedAt),
      deletedAt: prismaAuction.deletedAt ? new Date(prismaAuction.deletedAt) : null,
    };
  }
}

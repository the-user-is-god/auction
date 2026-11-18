import { Prisma, Auction as PrismaAuction } from "@generated/prisma/client.js";
import { AuctionEntity } from "../domain/auction.entity.js";
import { CreateAuctionInput } from "../domain/auction.types.js";
import { AuctionResponseDto } from "../dto/responses/auction-response.dto.js";

export class AuctionMapper {
  // Database -> Domain
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

  // Domain -> Database
  static toPersistence(data: CreateAuctionInput): Prisma.AuctionUncheckedCreateInput {
    return {
      title: data.title,
      description: data.description ?? null,
      category: data.category,
      images: data.images ?? [],

      isFeatured: data.isFeatured ?? false,
      status: data.status,

      startingPrice: data.startingPrice,
      bidStep: data.bidStep,
      reservePrice: data.reservePrice ?? null,

      startTime: data.startTime,
      endTime: data.endTime,

      extensionWindowSecs: data.extensionWindowSecs,
      extensionSecs: data.extensionSecs,

      ownerId: data.ownerId,
    };
  }

  // Domain -> API Response
  static toResponse(auction: AuctionEntity): AuctionResponseDto {
    return {
      id: auction.id,
      title: auction.title,
      description: auction.description,
      category: auction.category,
      images: auction.images,

      isFeatured: auction.isFeatured,
      status: auction.status,

      startingPrice: auction.startingPrice,
      bidStep: auction.bidStep,
      currentBid: auction.currentBid,
      bidCount: auction.bidCount,
      hasReserve: auction.reservePrice !== null,

      startTime: auction.startTime,
      endTime: auction.endTime,

      extensionWindowSecs: auction.extensionWindowSecs,
      extensionSecs: auction.extensionSecs,

      ownerId: auction.ownerId,
      winnerId: auction.winnerId,

      createdAt: auction.createdAt,
    };
  }

  // Batch helper for list endpoints
  static toResponseList(auctions: AuctionEntity[]): AuctionResponseDto[] {
    return auctions.map((auction) => this.toResponse(auction));
  }
}

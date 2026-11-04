/*
  Warnings:

  - You are about to drop the column `refreshToken` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AuctionStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'SUSPENDED', 'UNSOLD', 'PENDING_PAYMENT', 'COMPLETED', 'CANCELLED', 'DISPUTED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "AuctionCategory" AS ENUM ('ELECTRONICS', 'ART', 'VEHICLES', 'COLLECTIBLES', 'OTHER');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "refreshToken";

-- CreateTable
CREATE TABLE "Auction" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "AuctionCategory" NOT NULL,
    "images" TEXT[],
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "status" "AuctionStatus" NOT NULL DEFAULT 'DRAFT',
    "startingPrice" INTEGER NOT NULL,
    "bidStep" INTEGER NOT NULL DEFAULT 100,
    "reservePrice" INTEGER,
    "currentBid" INTEGER,
    "bidCount" INTEGER NOT NULL DEFAULT 0,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "extensionWindowSecs" INTEGER NOT NULL DEFAULT 0,
    "extensionSecs" INTEGER NOT NULL DEFAULT 0,
    "ownerId" TEXT NOT NULL,
    "winnerId" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Auction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Auction_status_endTime_idx" ON "Auction"("status", "endTime");

-- CreateIndex
CREATE INDEX "Auction_category_status_idx" ON "Auction"("category", "status");

-- CreateIndex
CREATE INDEX "Auction_ownerId_idx" ON "Auction"("ownerId");

-- CreateIndex
CREATE INDEX "Auction_isFeatured_status_idx" ON "Auction"("isFeatured", "status");

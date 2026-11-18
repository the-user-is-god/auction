import { AUCTION_CATEGORY } from "@modules/auction/domain/auction.types.js";
import { z } from "zod";

const AUCTION_CATEGORIES = [
  "ELECTRONICS",
  "ART",
  "VEHICLES",
  "COLLECTIBLES",
  "OTHER",
] as const satisfies readonly AUCTION_CATEGORY[];
export const createAuctionSchema = z
  .object({
    title: z.string().min(3).max(100),
    description: z.string().min(10).max(2000),
    category: z.enum(AUCTION_CATEGORIES),
    images: z.array(z.url()).min(1),
    ownerId: z.string().min(1), // Or z.string().uuid() if using UUIDs
    startingPrice: z.number().positive(),
    bidStep: z.number().positive().optional(),
    reservePrice: z.number().positive().nullable().optional(),
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
    extensionWindowSecs: z.number().int().nonnegative().optional(),
    extensionSecs: z.number().int().nonnegative().optional(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  })
  .refine((data) => data.reservePrice == null || data.reservePrice >= data.startingPrice, {
    message: "Reserve price must be greater than or equal to starting price",
    path: ["reservePrice"],
  });

export type CreateAuctionDto = z.infer<typeof createAuctionSchema>;

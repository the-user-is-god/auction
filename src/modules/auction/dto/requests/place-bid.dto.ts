import { z } from "zod";

export const placeBidSchema = z.object({
  auctionId: z.string().min(1, "Auction ID is required"),
  bidderId: z.string().min(1, "Bidder ID is required"),
  amount: z.number().positive("Bid amount must be greater than zero"),
  placedAt: z.coerce.date(),
});

export type PlaceBidDto = z.infer<typeof placeBidSchema>;

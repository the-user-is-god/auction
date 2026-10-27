import z from "zod";

export const profileUpdateSchema = z.object({
  name: z.string().min(2),
});

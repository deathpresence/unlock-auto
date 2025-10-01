import { z } from "zod";

export const BRANCH_MAX = {
  NAME: 200,
  SLUG: 200,
  ADDRESS: 400,
} as const;

export const BranchSchema = z.object({
  name: z.string().min(1, "Name is required").max(BRANCH_MAX.NAME),
  slug: z.string().trim().min(1).max(BRANCH_MAX.SLUG).nullable().optional(),
  address: z
    .string()
    .trim()
    .min(1)
    .max(BRANCH_MAX.ADDRESS)
    .nullable()
    .optional(),
});

export type BranchInput = z.infer<typeof BranchSchema>;
export type BranchUpdateInput = Partial<BranchInput>;

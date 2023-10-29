import z from 'zod';

export const CoverageType = z.union([
  z.literal('coInsurance'),
  z.literal('coPayment'),
]);

export type CoverageType = z.infer<typeof CoverageType>;

export const CoverageValue = z.object({
  type: CoverageType,
  value: z.number().min(0),
});

export type CoverageValue = z.infer<typeof CoverageValue>;

export const CoverageSchema = z.object({
  id: z.string().ulid(),
  planId: z.string().ulid(),
  categoryId: z.string().ulid(),
  beforeDeductible: CoverageValue,
  afterDeductible: CoverageValue,
});

export type CoverageSchema = z.infer<typeof CoverageSchema>;
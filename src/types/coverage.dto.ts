import z from 'zod';
import { TableNames } from '../providers/db';

export const CoverageType = z.union([
  z.literal('copay'),
  z.literal('percent'),
]);

export type CoverageType = z.infer<typeof CoverageType>;

export const CoverageValue = z.object({
  type: CoverageType,
  amount: z.number().min(0),
});

export type CoverageValue = z.infer<typeof CoverageValue>;

export const CoverageSchema = z.object({
  id: z.string().ulid(),
  planId: z.string().ulid(),
  categoryId: z.string().ulid(),
  beforeDeductible: CoverageValue,
  afterDeductible: CoverageValue,
  type: z.literal(TableNames.COVERAGES),
});

export type CoverageSchema = z.infer<typeof CoverageSchema>;
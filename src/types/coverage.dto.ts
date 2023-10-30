import z from 'zod';
import { TableNames } from '../providers/db';

export const CoverageType = z.union([
  z.literal('copay'),
  z.literal('percent'),
]);

export type CoverageType = z.infer<typeof CoverageType>;

export const CoverageValue = z.object({
  type: CoverageType.default('percent'),
  amount: z.number().min(0).default(100),
});

export type CoverageValue = z.infer<typeof CoverageValue>;

export const CoverageSchema = z.object({
  id: z.string().default(''),
  planId: z.string().ulid(),
  categoryId: z.string().ulid(),
  beforeDeductible: CoverageValue.default(CoverageValue.parse({})),
  afterDeductible: CoverageValue.default(CoverageValue.parse({})),
  type: z.literal(TableNames.COVERAGES).default(TableNames.COVERAGES),
});

export type CoverageSchema = z.infer<typeof CoverageSchema>;
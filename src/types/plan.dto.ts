import z from 'zod';
import { BaseSchema } from './base.dto';
import { TableNames } from '../providers/db';

export const PlanCoverageSchema = z.object({
  coverageId: z.string().ulid(),
  coInsurance: z.number().min(0).max(100),
}).or(z.object({
  coverageId: z.string().ulid(),
  coPayment: z.number().min(0),
}));

export const PlanLimitSchema = z.object({
  deductible: z.number({ description: 'Amount of deductible in dollars' }).min(0),
  familyDeductible: z.number({ description: 'Amount of family deductible in dollars' }).min(0),
  outOfPocketMax: z.number({ description: 'Amount of out of pocket max in dollars' }).min(0),
  familyOutOfPocketMax: z.number({ description: 'Amount of family out of pocket max in dollars' }).min(0),
});

export type PlanLimitSchema = z.infer<typeof PlanLimitSchema>;

export const PlanSchema = BaseSchema.extend({
  type: z.literal(TableNames.PLANS),
  monthlyPremium: z.number({ description: 'Monthly cost of plan' }).min(0),
  isFamilyPlan: z.boolean().default(false).optional(),
  isCombinedDeductible: z.boolean().default(false).optional(),
  inNetworkLimt: PlanLimitSchema,
  outOfNetworkLimit: PlanLimitSchema,
  discount: z.number({ description: 'Amount of discount in dollars' }).min(0).optional(),
});

export type PlanSchema = z.infer<typeof PlanSchema>;

export function isPlanSchema(data: unknown): data is PlanSchema {
  try {
    PlanSchema.parse(data);
    return true;
  } catch {
    return false;
  }
}
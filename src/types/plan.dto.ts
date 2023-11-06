import z from 'zod';
import { NamedSchema } from './base.dto';

export const PlanLimitSchema = z.object({
  deductible: z.number({ description: 'Amount of deductible in dollars' }).min(0),
  familyDeductible: z.number({ description: 'Amount of family deductible in dollars' }).min(0),
  outOfPocketMax: z.number({ description: 'Amount of out of pocket max in dollars' }).min(0),
  familyOutOfPocketMax: z.number({ description: 'Amount of family out of pocket max in dollars' }).min(0),
});

export type PlanLimitSchema = z.infer<typeof PlanLimitSchema>;

export const PlanSchema = NamedSchema.extend({
  type: z.literal('plan'),
  monthlyPremium: z.number({ description: 'Monthly cost of plan' }).min(0).default(0),
  isFamilyPlan: z.boolean().default(false),
  isCombinedDeductible: z.boolean().default(false),
  inNetworkLimt: PlanLimitSchema,
  outOfNetworkLimit: PlanLimitSchema,
  discount: z.number({ description: 'Amount of discount in dollars' }).min(0).default(0),
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
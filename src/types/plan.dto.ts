import z from 'zod';
import { BaseSchema } from './base.dto';

export const PlanCoverageSchema = z.object({
  coverageId: z.string().ulid(),
  coInsurance: z.number().min(0).max(100),
}).or(z.object({
  coverageId: z.string().ulid(),
  coPayment: z.number().min(0),
}));

export const PlanSchema = BaseSchema.extend({
  name: z.string().min(3).max(255),
  description: z.string().min(3).max(255),
  premium: z.number({ description: 'Monthly cost of plan' }).min(0),
  deductible: z.number({ description: 'Amount of deductible in dollars' }).min(0),
  familyDeductible: z.number({ description: 'Amount of family deductible in dollars' }).min(0),
  outOfPocketMax: z.number({ description: 'Amount of out of pocket max in dollars' }).min(0),
  familyOutOfPocketMax: z.number({ description: 'Amount of family out of pocket max in dollars' }).min(0),
  isFamilyPlan: z.boolean().default(false),
  discount: z.number({ description: 'Amount of discount in dollars' }).min(0).optional(),
  coverages: z.array(PlanCoverageSchema),
});

export type PlanSchema = z.infer<typeof PlanSchema>;
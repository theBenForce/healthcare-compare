import z from 'zod';

export const PlanCoverageSchema = z.object({
  coverageId: z.string().ulid(),
  coInsurance: z.number().min(0).max(100),
}).or(z.object({
  coverageId: z.string().ulid(),
  coPayment: z.number().min(0),
}));

export const PlanSchema = z.object({
  id: z.string().ulid(),
  name: z.string().min(3).max(255),
  description: z.string().min(3).max(255),
  premium: z.number({ description: 'Monthly cost of plan' }).min(0),
  discount: z.number({ description: 'Amount of discount in dollars' }).min(0).optional(),
  coverages: z.array(PlanCoverageSchema),
});

export type PlanSchema = z.infer<typeof PlanSchema>;
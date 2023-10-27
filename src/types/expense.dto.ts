import { z } from 'zod';
import { BaseSchema } from './base.dto';

export const ExpenseSchema = BaseSchema.extend({
  amount: z.number().min(0),
  months: z.array(z.number().min(1).max(12)),
  categoryId: z.string().ulid(),
  personId: z.string().ulid(),
});

export type ExpenseSchema = z.infer<typeof ExpenseSchema>;
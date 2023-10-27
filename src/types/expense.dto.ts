import { z } from 'zod';
import { BaseSchema } from './base.dto';

export const MonthValueSchema = z.number().min(0).max(11);
export type MonthValueSchema = z.infer<typeof MonthValueSchema>;

export const ExpenseSchema = BaseSchema.extend({
  amount: z.number().min(0),
  months: z.array(MonthValueSchema).max(12).min(0),
  categoryId: z.string().ulid(),
  personId: z.string().ulid(),
});

export type ExpenseSchema = z.infer<typeof ExpenseSchema>;
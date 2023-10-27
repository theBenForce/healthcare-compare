import { z } from 'zod';
import { BaseSchema } from './base.dto';

export const MonthValueSchema = z.number().min(0).max(11);
export type MonthValueSchema = 0|1|2|3|4|5|6|7|8|9|10|11;

export const ExpenseSchema = BaseSchema.extend({
  amount: z.number().min(0),
  months: z.array(MonthValueSchema).max(12).min(0),
  categoryId: z.string().ulid(),
  personId: z.string().ulid(),
});

export type ExpenseSchema = z.infer<typeof ExpenseSchema>;
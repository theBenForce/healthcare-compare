import { z } from 'zod';
import { ulid } from 'ulidx';

export const TableNames = z.enum(['plan', 'person', 'category', 'expense', 'coverage']);

export type TableNames = z.infer<typeof TableNames>;

export const BaseSchema = z.object({
  id: z.string().ulid().default(() => ulid()),
  name: z.string().min(3).max(255),
  description: z.string().min(3).max(255).optional(),
  type: TableNames,
  updatedAt: z.date().optional().default(() => new Date()),
}).passthrough();

export type BaseSchema = z.infer<typeof BaseSchema>;
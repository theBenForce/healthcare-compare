import z from 'zod';
import { BaseSchema } from './base.dto';

export const CategorySchema = BaseSchema.extend({
  name: z.string().min(3).max(255),
  description: z.string().min(3).max(255),
});

export type CategorySchema = z.infer<typeof CategorySchema>;
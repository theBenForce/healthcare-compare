import z from 'zod';
import { BaseSchema } from './base.dto';
import { TableNames } from '../providers/db';

export const CategorySchema = BaseSchema.extend({
  type: z.literal(TableNames.CATEGORIES),
});

export type CategorySchema = z.infer<typeof CategorySchema>;



export function isCategorySchema(data: unknown): data is CategorySchema {
  try {
    CategorySchema.parse(data);
    return true;
  } catch {
    return false;
  }
}
import z from 'zod';
import { NamedSchema } from './base.dto';

export const CategorySchema = NamedSchema.extend({
  type: z.literal("category"),
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
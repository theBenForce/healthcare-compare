import z from 'zod';
import { BaseSchema } from './base.dto';

export const CategorySchema = BaseSchema.extend({
});

export type CategorySchema = z.infer<typeof CategorySchema>;
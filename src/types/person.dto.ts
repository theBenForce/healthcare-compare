import z from 'zod';
import { BaseSchema } from './base.dto';

export const PersonSchema = BaseSchema.extend({
});

export type PersonSchema = z.infer<typeof PersonSchema>;
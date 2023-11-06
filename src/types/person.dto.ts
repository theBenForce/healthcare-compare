import z from 'zod';
import { BaseSchema } from './base.dto';

export const PersonSchema = BaseSchema.extend({
  type: z.literal("person"),
});

export type PersonSchema = z.infer<typeof PersonSchema>;

export function isPersonSchema(data: unknown): data is PersonSchema {
  try {
    PersonSchema.parse(data);
    return true;
  } catch {
    return false;
  }
}
import z from 'zod';
import { BaseSchema } from './base.dto';
import { TableNames } from '../providers/db';

export const PersonSchema = BaseSchema.extend({
  type: z.literal(TableNames.PEOPLE),
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
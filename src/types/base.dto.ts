import { z } from 'zod';
import { TableNames } from '../providers/db';

export const BaseSchema = z.object({
  id: z.string().ulid(),
  name: z.string().min(3).max(255),
  description: z.string().min(3).max(255).optional(),
  type: z.nativeEnum(TableNames),
});

export type BaseSchema = z.infer<typeof BaseSchema>;
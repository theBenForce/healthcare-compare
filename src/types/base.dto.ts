import { z } from 'zod';

export const BaseSchema = z.object({
  id: z.string().ulid(),
});

export type BaseSchema = z.infer<typeof BaseSchema>;
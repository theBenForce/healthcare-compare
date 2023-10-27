import { z } from 'zod';

export const BaseSchema = z.object({
  id: z.string().ulid(),
  name: z.string().min(3).max(255),
  description: z.string().min(3).max(255).optional(),
});

export type BaseSchema = z.infer<typeof BaseSchema>;
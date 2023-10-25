import z from 'zod';

export const CategorySchema = z.object({
  id: z.string().ulid(),
  name: z.string().min(3).max(255),
  description: z.string().min(3).max(255),
});

export type CategorySchema = z.infer<typeof CategorySchema>;
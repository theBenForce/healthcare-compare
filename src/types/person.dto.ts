import z from 'zod';

export const PersonSchema = z.object({
  name: z.string().min(3).max(255),
  expenses: z.array(z.object({
    coverageId: z.string().ulid(),
    amount: z.number().min(0)
  }))
});

export type PersonSchema = z.infer<typeof PersonSchema>;
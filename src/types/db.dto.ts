import z from 'zod';
import { PlanSchema } from './plan.dto';
import { PersonSchema } from './person.dto';
import { CategorySchema } from './category.dto';

export const DBRoot = z.object({
  plans: z.array(PlanSchema),
  people: z.array(PersonSchema),
  categories: z.array(CategorySchema),
});

export type DBRoot = z.infer<typeof DBRoot>;
import z from 'zod';
import { CoverageSchema } from './coverage.dto';
import { PlanSchema } from './plan.dto';
import { PersonSchema } from './person.dto';
import { CategorySchema } from './category.dto';
import { ExpenseSchema } from './expense.dto';
import { BaseSchema, TableNames } from './base.dto';


export const AllDbTypes = z.union([
  CoverageSchema,
  PlanSchema,
  PersonSchema,
  CategorySchema,
  ExpenseSchema
]);

export type AllDbTypes = z.infer<typeof AllDbTypes>;

export function isBaseEntity(data: unknown): data is BaseSchema {
  try {
    BaseSchema.parse(data);
    return true;
  } catch {
    return false;
  }
}

export const BackupV1Schema = z.record(
  TableNames,
  z.array(AllDbTypes)
);

export type BackupV1Schema = z.infer<typeof BackupV1Schema>;

export const BackupV2Schema = z.object({
  version: z.literal(2, {required_error: 'Backup version is required'}).default(2),
  tables: z.record(
    TableNames,
    z.record(z.string().ulid(), z.array(AllDbTypes)),
    { required_error: 'Backup tables are required' }
  ).default(() => ({})),
});

export type BackupV2Schema = z.infer<typeof BackupV2Schema>;

export const BackupLatestSchema = BackupV2Schema;

export type BackupLatestSchema = z.infer<typeof BackupLatestSchema>;

export const BackupSchema = z.union([BackupV1Schema, BackupV2Schema]);

export type BackupSchema = z.infer<typeof BackupSchema>;

export const convertBackupToLatest = (backup: BackupSchema): BackupLatestSchema => {
  console.info(`Converting backup to latest version`);

  const result = BackupLatestSchema.parse({});

  if ('version' in backup) {
    result.tables = backup.tables;
  } else {
    console.info(`Legacy backup detected, converting to latest version`);
    for (const [tableName, tableValues] of Object.entries(backup)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      result.tables[tableName as TableNames] = Object.fromEntries(tableValues.map(v => [v.id, v]));
    }
  }

  return result;
};
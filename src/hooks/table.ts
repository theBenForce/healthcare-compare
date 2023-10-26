import React from 'react';
import { TableNames, useDB } from '../providers/db';
import { BaseSchema } from '../types/base.dto';


export interface TableContextInterface<SchemaType extends BaseSchema> {
  list: () => Promise<SchemaType[]>;
  create: (value: SchemaType) => Promise<string>;
  get: (planId: string) => Promise<SchemaType | null>;
  save: (plan: SchemaType) => Promise<void>;
  remove: (planId: string) => Promise<void>;
  values: SchemaType[];
}

export const useTable = <TableSchema extends BaseSchema>(tableName: TableNames): TableContextInterface<TableSchema> => {
  const { db } = useDB();
  const [values, setValues] = React.useState<TableSchema[]>([]);

  const list = React.useCallback(async () => {
    const result = (await db?.getAll(tableName)) ?? [];
    setValues(result);
    return result as Array<TableSchema>;
  }, [db, tableName]);

  const create = async (newValue: TableSchema) => {
    await db?.add(tableName, newValue);

    await list();

    return newValue.id;
  };

  const remove = React.useCallback(async (planId: string) => {
    await db?.delete(tableName, planId);
    await list();
  }, [db, list, tableName]);

  const get = React.useCallback(async (planId: string) => db?.get(tableName, planId), [db, tableName]);
  const save = React.useCallback(async (plan: TableSchema) => { await db?.put(tableName, plan); await list(); }, [db, list, tableName]);

  React.useEffect(() => {
    list();
  }, [list]);

  return { list, create, get, save, remove, values };
};
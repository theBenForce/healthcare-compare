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

interface UseTableParams {
  tableName: TableNames;
  filter?: Record<string, string | undefined>;
}

export const useTable = <TableSchema extends BaseSchema>({ tableName, filter }: UseTableParams): TableContextInterface<TableSchema> => {
  const { db } = useDB();
  const [values, setValues] = React.useState<TableSchema[]>([]);

  const list = React.useCallback(async () => {
    if (!db) return [];

    let result;
    if (filter) {
      const filterEntries = Object.entries(filter).filter(([, value]) => value);

      if (filterEntries.length > 0) {
        const [index, value] = filterEntries[0];
        result = await db.getAllFromIndex(tableName, index, value);
      }
    }
    
    if(!result) {
      result = await db?.getAll(tableName);
    }
    
    setValues(result);
    return result as Array<TableSchema>;
  }, [db, tableName, filter]);

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
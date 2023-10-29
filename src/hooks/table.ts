import React from 'react';
import { TableNames, useDB } from '../providers/db';
import { BaseSchema } from '../types/base.dto';


export interface TableContextInterface<SchemaType extends BaseSchema> {
  list: () => Promise<SchemaType[]>;
  create: (value: SchemaType) => Promise<string>;
  get: (id: string) => Promise<SchemaType | null>;
  save: (value: SchemaType) => Promise<void>;
  remove: (id: string) => Promise<void>;
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
      result = await db?.getAll(tableName).then((values) => values.map(v => ({...v, type: tableName})) || []);
    }
    
    setValues(result);
    return result as Array<TableSchema>;
  }, [db, tableName, filter]);

  const create = async (value: TableSchema) => {
    await db?.add(tableName, value);

    await list();

    return value.id;
  };

  const remove = React.useCallback(async (id: string) => {
    await db?.delete(tableName, id);
    await list();
  }, [db, list, tableName]);

  const get = React.useCallback(async (id: string) => {
    console.info(`get ${tableName} ${id}`);
    return db?.get(tableName, id)?.then((value) => ({...value, type: tableName}) || null);
  }, [db, tableName]);
  const save = React.useCallback(async (entity: TableSchema) => { await db?.put(tableName, entity); await list(); }, [db, list, tableName]);

  React.useEffect(() => {
    list();
  }, [list]);

  return { list, create, get, save, remove, values };
};
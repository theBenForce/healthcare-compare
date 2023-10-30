import React from 'react';
import { TableNames, useDB } from '../providers/db';
import { BaseSchema } from '../types/base.dto';
import { CoverageSchema } from '../types/coverage.dto';

type RecordFilter = Record<string, string | undefined>;

export interface TableContextInterface<SchemaType extends BaseSchema | CoverageSchema> {
  list: (filter?: RecordFilter) => Promise<SchemaType[]>;
  get: (id: string) => Promise<SchemaType | null>;
  save: (value: SchemaType) => Promise<void>;
  remove: (id: string) => Promise<void>;
  values: SchemaType[];
}

interface UseTableParams {
  tableName: TableNames;
  filter?: RecordFilter;
  autoRefresh?: boolean;
}

export const useTable = <TableSchema extends BaseSchema | CoverageSchema>({ tableName, filter: baseFilter, autoRefresh }: UseTableParams): TableContextInterface<TableSchema> => {
  const { db } = useDB();
  const [values, setValues] = React.useState<TableSchema[]>([]);

  const list = React.useCallback(async (filter: RecordFilter | undefined = baseFilter) => {
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
  }, [db, tableName, baseFilter]);

  const remove = React.useCallback(async (id: string) => {
    await db?.delete(tableName, id);
    if(autoRefresh) await list();
  }, [db, list, tableName, autoRefresh]);

  const get = React.useCallback(async (id: string) => {
    console.info(`get ${tableName} ${id}`);
    return db?.get(tableName, id)?.then((value) => ({...value, type: tableName}) || null);
  }, [db, tableName]);
  const save = React.useCallback(async (entity: TableSchema) => {
    if (!db) return;

    const existing = await db.getKey(tableName, entity.id);

    if (existing) {
      await db?.put(tableName, entity);
    } else {
      await db?.add(tableName, entity);
    }
    
    if(autoRefresh) await list();
  }, [db, list, tableName, autoRefresh]);

  React.useEffect(() => {
    list();
  }, [list]);

  return { list, get, save, remove, values };
};
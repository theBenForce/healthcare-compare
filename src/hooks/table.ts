import React from 'react';
import { TableNames, useDB } from '../providers/db';
import { BaseSchema } from '../types/base.dto';
import { CoverageSchema } from '../types/coverage.dto';
import { useAppContext } from '../providers/state';

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
}

export const useTable = <TableSchema extends BaseSchema | CoverageSchema>({ tableName, filter }: UseTableParams): TableContextInterface<TableSchema> => {
  const { db } = useDB();
  const [values, setValues] = React.useState<TableSchema[]>([]);
  const [baseFilter] = React.useState<RecordFilter | null>(filter ?? null);
  const { setIsModified } = useAppContext();

  const list = React.useCallback(async (filterOverride?: RecordFilter) => {
    console.info(`Listing ${tableName}`);
    
    let result: TableSchema[] | undefined = undefined;
    if (db) {
      console.info(`Listing ${tableName} from db`);
      filterOverride = filterOverride ?? baseFilter ?? undefined;
      if (filterOverride) {
        const filterEntries = Object.entries(filterOverride).filter(([, value]) => value);

        if (filterEntries.length > 0) {
          console.info(`Listing ${tableName} from db with filter ${JSON.stringify(filterEntries[0])}`);
          const [index, value] = filterEntries[0];
          result = await db.getAllFromIndex(tableName, index, value);
        }
      }
    
      if (!result) {
        console.info(`Listing ${tableName} from db without filter`);
        result = await db?.getAll(tableName).then((values) => values.map(v => ({ ...v, type: tableName })) || []);
      }
    }
    
    setValues(result ?? []);
    return (result ?? []) as Array<TableSchema>;
  }, [db, tableName, baseFilter]);

  const remove = React.useCallback(async (id: string) => {
    await db?.delete(tableName, id);
    setValues(values.filter(v => v.id !== id));
    setIsModified(true);
  }, [db, tableName, values, setIsModified]);

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

    setIsModified(true);

    
    setValues([...values.filter(x => x.id !== entity.id), entity]);

  }, [db, tableName, setIsModified, values]);

  React.useEffect(() => {
    if(!tableName) return;
    console.info(`Initial listing ${JSON.stringify({tableName, filter: baseFilter})}`);
    list();
  }, [list, tableName, baseFilter]);

  return { list, get, save, remove, values };
};
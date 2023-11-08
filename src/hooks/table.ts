/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import { useDB } from '../providers/db';
import { useAppContext } from '../providers/state';
import { TableNames } from '../types/base.dto';
import { AllDbTypes, DeletedEntry } from '../types/db.dto';
import { Logger } from '../util/logger';

type RecordFilter = Record<string, string | undefined>;

export interface TableContextInterface<SchemaType extends AllDbTypes> {
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

export const useTable = <TableSchema extends AllDbTypes>({ tableName, filter }: UseTableParams): TableContextInterface<TableSchema> => {
  const { db } = useDB();
  const [values, setValues] = React.useState<TableSchema[]>([]);
  const [baseFilter] = React.useState<RecordFilter | null>(filter ?? null);
  const { setIsModified } = useAppContext();

  const setType = React.useCallback((value: TableSchema) => {
    if (tableName === 'expense') {
      value = {
        ...value,
        // @ts-ignore
        months: (value.months ?? []).filter(month => month < 12).reduce((acc, month) => {
          if (!acc.includes(month)) acc.push(month);
          return acc;
        }, [])
      }
    }
    return AllDbTypes.parse({ ...value, type: value.type ?? tableName }) as TableSchema;
  }, [tableName]);

  const list = React.useCallback(async (filterOverride?: RecordFilter): Promise<Array<TableSchema>> => {
    Logger.info(`Listing ${tableName}`);
    
    let result: TableSchema[] | undefined = undefined;
    if (db) {
      Logger.verbose(`Listing ${tableName} from db`);
      filterOverride = filterOverride ?? baseFilter ?? undefined;
      if (filterOverride) {
        const filterEntries = Object.entries(filterOverride).filter(([, value]) => value);

        if (filterEntries.length > 0) {
          Logger.verbose(`Listing ${tableName} from db with filter ${JSON.stringify(filterEntries[0])}`);
          const [index, value] = filterEntries[0];
          result = await db.getAllFromIndex(tableName, index, value);
        }
      }
    
      if (!result) {
        Logger.verbose(`Listing ${tableName} from db without filter`);
        result = await db?.getAll(tableName).then((values) => values.map(setType) || []);
      }
    }

    const allRecords = (result ?? []).filter(x => !x.isDeleted);
    
    setValues(allRecords);
    return (result ?? []).map(setType);
  }, [tableName, db, baseFilter, setType]);

  const remove = React.useCallback(async (id: string) => {
    if (!db) return;

    Logger.info(`remove ${tableName} ${id}`);
    await db?.put(tableName, DeletedEntry.parse({ id, type: 'deleted' }));
    setValues(values => values.filter(v => v.id !== id));
    setIsModified(true);
  }, [db, tableName, setIsModified]);

  const get = React.useCallback(async (id: string): Promise<TableSchema | null> => {
    Logger.info(`get ${tableName} ${id}`);
    const result = await db?.get(tableName, id)?.then((value) => AllDbTypes.parse({ ...value, type: tableName }) as TableSchema);
    
    return result ?? null;
  }, [db, tableName]);

  const save = React.useCallback(async (entity: TableSchema) => {
    if (!db) return;

    const existing = await db.getKey(tableName, entity.id);

    const record = AllDbTypes.parse({
      ...entity,
      updatedAt: new Date(),
      type: tableName
    }) as TableSchema;

    if (existing) {
      await db?.put(tableName, record);
    } else {
      await db?.add(tableName, record);
    }

    setIsModified(true);

    setValues([...values.filter(x => x.id !== record.id), record]);

  }, [db, tableName, setIsModified, values]);

  React.useEffect(() => {
    if(!tableName) return;
    Logger.info(`Initial listing ${JSON.stringify({tableName, filter: baseFilter})}`);
    list();
  }, [list, tableName, baseFilter]);

  return { list, get, save, remove, values };
};
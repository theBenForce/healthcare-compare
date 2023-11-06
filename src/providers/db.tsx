/* eslint-disable @typescript-eslint/ban-ts-comment */
import { IDBPDatabase, openDB } from 'idb';
import merge from 'lodash.merge';
import React from 'react';
import { TableNames } from '../types/base.dto';
import { BackupLatestSchema, BackupSchema, convertBackupToLatest } from '../types/db.dto';
import { Logger } from '../util/logger';


interface DBContextInterface {
  db: IDBPDatabase | null;
  createBackup: () => Promise<BackupLatestSchema>;
  mergeStates: (backup: BackupSchema) => Promise<BackupLatestSchema>;
}

export const DBContext = React.createContext<DBContextInterface>({
  db: null,
  createBackup: async () => ({} as BackupLatestSchema),
  mergeStates: async () => ({} as BackupLatestSchema),
});

export const useDB = () => React.useContext(DBContext);

export const WithDB = ({ children }: { children: React.ReactNode }) => {
  const [db, setDB] = React.useState<IDBPDatabase | null>(null);

  React.useEffect(() => {
    Logger.info(`Initializing DB`);
    openDB('healthcare-compare', 3, {
      async upgrade(database, oldVersion, _newVersion, transaction) {
        Logger.info(`Upgrading DB`)
        for (const tableName of Object.values(TableNames)) {
          if (!database.objectStoreNames.contains(tableName)) {
            const table = database.createObjectStore(tableName, { keyPath: 'id' });

            if (tableName === 'expense') {
              table.createIndex('personId', 'personId');
              table.createIndex('categoryId', 'categoryId');
            } else if (tableName === 'coverage') {
              table.createIndex('planId', 'planId');
              table.createIndex('categoryId', 'categoryId');
            }
          }
        }

        if (oldVersion < 2) {
          const plans = transaction.objectStore('plan');
          const allPlans = await plans.getAll();

          for (const plan of allPlans) {
            plan.monthlyPremium = plan.premium;
            delete plan.premium;
            await plans.put(plan);
          }
        }
      },
    }).then((db) => {
      setDB(db);
    });
  }, []);

  const createBackup = React.useCallback(async () => {
    Logger.info(`Creating backup`);
    const storeNames = Object.values(TableNames.enum);
    const backup = BackupLatestSchema.parse({});

    for (const storeName of storeNames) {
      if (!db?.objectStoreNames.contains(storeName)) continue;

      const data = await db?.getAll(storeName);
      backup.tables[storeName] = Object.fromEntries(data.map(entry => [entry.id, entry]));
    }

    return backup;
  }, [db]);

  const mergeStates = React.useCallback(async (backupValues: BackupSchema): Promise<BackupLatestSchema> => {
    const result = await createBackup();
    const backup = convertBackupToLatest(backupValues);

    const allKeys = new Set(Object.keys(result.tables).concat(Object.keys(backup.tables))) as Set<TableNames>;

    for (const storeName of allKeys) {
      const itemIds = new Set(Object.keys(result.tables[storeName] ?? {}).concat(Object.keys(backup.tables[storeName] ?? {})));

      for (const itemId of itemIds) {
        const resultItem = result.tables[storeName]?.[itemId];
        const backupItem = backup.tables[storeName]?.[itemId];

        // @ts-ignore
        result.tables[storeName]![itemId] = merge(resultItem ?? {}, backupItem ?? {});
      }
    }

    const transaction = db?.transaction(Object.keys(result.tables), 'readwrite');
    const storeNames = Object.values(TableNames.enum);

    if (transaction) {
      for (const storeName of storeNames) {
        const store = transaction.objectStore(storeName);
        const data = Object.values(result.tables[storeName] ?? {});

        for (const item of data) {
          await store.put(item);
        }
      }

      await transaction.done;
    }

    return result;
  }, [db, createBackup]);

  return (
    <DBContext.Provider value={{ db, createBackup, mergeStates }}>
      {children}
    </DBContext.Provider>
  );
};
import React from 'react';
import { IDBPDatabase, openDB } from 'idb';
import merge from 'lodash.merge';



export enum TableNames {
  PLANS = 'plan',
  PEOPLE = 'person',
  CATEGORIES = 'category',
  EXPENSES = 'expense',
  COVERAGES = 'coverage',
}

export type DbBackup = Record<`${TableNames}`, Array<unknown>>;

interface DBContextInterface {
  db: IDBPDatabase | null;
  createBackup: () => Promise<DbBackup>;
  mergeStates: (backup: DbBackup) => Promise<DbBackup>;
}

export const DBContext = React.createContext<DBContextInterface>({
  db: null,
  createBackup: async () => ({} as DbBackup),
  mergeStates: async () => ({} as DbBackup),
});

export const useDB = () => React.useContext(DBContext);

export const WithDB = ({ children }: { children: React.ReactNode }) => {
  const [db, setDB] = React.useState<IDBPDatabase | null>(null);

  React.useEffect(() => {
    console.info(`Initializing DB`);
    openDB('healthcare-compare', 3, {
      async upgrade(database, oldVersion, _newVersion, transaction) {
        console.info(`Upgrading DB`)
        for (const tableName of Object.values(TableNames)) {
          if (!database.objectStoreNames.contains(tableName)) {
            const table = database.createObjectStore(tableName, { keyPath: 'id' });

            if (tableName === TableNames.EXPENSES) {
              table.createIndex('personId', 'personId');
              table.createIndex('categoryId', 'categoryId');
            } else if (tableName === TableNames.COVERAGES) {
              table.createIndex('planId', 'planId');
              table.createIndex('categoryId', 'categoryId');
            }
          }
        }

        if (oldVersion < 2) {
          const plans = transaction.objectStore(TableNames.PLANS);
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
    const storeNames = Object.values(TableNames);
    const backup = {} as DbBackup;

    for (const storeName of storeNames) {
      if (!db?.objectStoreNames.contains(storeName)) continue;

      const data = await db?.getAll(storeName);
      backup[storeName] = data ?? [];
    }

    return backup;
  }, [db]);

  const mergeStates = React.useCallback(async (backupValues: DbBackup): Promise<DbBackup> => {
    const existingData = await createBackup();
    const backup = merge(existingData, backupValues);
    const transaction = db?.transaction(Object.keys(backup), 'readwrite');
    const storeNames = Object.values(TableNames);

    if (transaction) {
      for (const storeName of storeNames) {
        const store = transaction.objectStore(storeName);
        const data = backup[storeName] as Array<unknown>;

        for (const item of data) {
          await store.put(item);
        }
      }

      await transaction.done;
    }

    return backup;
  }, [db, createBackup]);

  return (
    <DBContext.Provider value={{ db, createBackup, mergeStates }}>
      {children}
    </DBContext.Provider>
  );
};
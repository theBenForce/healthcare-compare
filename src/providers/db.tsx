import React from 'react';
import { IDBPDatabase, openDB } from 'idb';

interface DBContextInterface {
  db: IDBPDatabase | null;
}

export const DBContext = React.createContext<DBContextInterface>({
  db: null
});

export enum TableNames {
  PLANS = 'plan',
  PEOPLE = 'person',
  CATEGORIES = 'category',
  EXPENSES = 'expense',
  COVERAGES = 'coverage',
}

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

  return (
    <DBContext.Provider value={{ db }}>
      {children}
    </DBContext.Provider>
  );
};
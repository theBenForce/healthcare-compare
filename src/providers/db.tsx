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
}

export const useDB = () => React.useContext(DBContext);

export const WithDB = ({ children }: { children: React.ReactNode }) => {
  const [db, setDB] = React.useState<IDBPDatabase | null>(null);

  React.useEffect(() => {
    console.info(`Initializing DB`);
    openDB('healthcare-compare', 1, {
      upgrade(database) {
        console.info(`Upgrading DB`)
        for (const tableName of Object.values(TableNames)) {
          if (!database.objectStoreNames.contains(tableName)) {
            const table = database.createObjectStore(tableName, { keyPath: 'id' });

            if (tableName === TableNames.EXPENSES) {
              table.createIndex('personId', 'personId');
              table.createIndex('categoryId', 'categoryId');
            }
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
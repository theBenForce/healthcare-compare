import React from 'react';
import { IDBPDatabase, openDB } from 'idb';

interface DBContextInterface {
  db: IDBPDatabase | null;
}

export const DBContext = React.createContext<DBContextInterface>({
  db: null
});

export enum TableNames {
  PLANS = 'plans',
  PEOPLE = 'people',
  CATEGORIES = 'categories'
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
            database.createObjectStore(tableName, { keyPath: 'id' });
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
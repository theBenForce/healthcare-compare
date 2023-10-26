import React from 'react';
import { IDBPDatabase, openDB } from 'idb';

interface DBContextInterface {
  db: IDBPDatabase | null;
}

export const DBContext = React.createContext<DBContextInterface>({
  db: null
});


export const useDB = () => React.useContext(DBContext);

export const WithDB = ({ children }: { children: React.ReactNode }) => {
  const [db, setDB] = React.useState<IDBPDatabase | null>(null);

  React.useEffect(() => {
    console.info(`Initializing DB`);
    openDB('healthcare-compare', 1, {
      upgrade(database) {
        console.info(`Upgrading DB`)
        if (!database.objectStoreNames.contains('plans')) {
          database.createObjectStore('plans', { keyPath: 'id' });
        }

        if (!database.objectStoreNames.contains('people')) {
          database.createObjectStore('people', { keyPath: 'id' });
        }

        if (!database.objectStoreNames.contains('categories')) {
          database.createObjectStore('categories', { keyPath: 'id' });
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
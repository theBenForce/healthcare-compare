import React from 'react';
import { DBRoot } from '../types/db.dto';

interface DBContextInterface {
  db: DBRoot;
  saveDb: (db: DBRoot) => void;
}

export const DBContext = React.createContext<DBContextInterface>({
  db: {
    plans: [],
    people: [],
    categories: [],
  },
  saveDb: () => { },
});


export const useDB = () => React.useContext(DBContext);

export const WithDB = ({ children }: { children: React.ReactNode }) => {
  const [db, setDB] = React.useState<DBRoot>({
    plans: [],
    people: [],
    categories: [],
  });

  React.useEffect(() => {
    const dbString = localStorage.getItem('db');
    if (dbString) {
      setDB(JSON.parse(dbString));
    }
  }, []);

  const saveDb = (db: DBRoot) => {
    localStorage.setItem('db', JSON.stringify(db));
    setDB(db);
  };

  return (
    <DBContext.Provider value={{ db, saveDb }}>
      {children}
    </DBContext.Provider>
  );
};
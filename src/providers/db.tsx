import React from 'react';
import { DBRoot } from '../types/db.dto';

interface DBContextInterface {
  db: DBRoot;
  setDB: React.Dispatch<React.SetStateAction<DBRoot>>;
}

export const DBContext = React.createContext<DBContextInterface>({
  db: {
    plans: [],
    people: [],
    categories: [],
  },
  setDB: () => { },
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

  return (
    <DBContext.Provider value={{ db, setDB }}>
      {children}
    </DBContext.Provider>
  );
};
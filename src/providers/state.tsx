import React from 'react';

interface AppContextInterface {
  title: string;
  setTitle: (title: string) => void;
}

const AppContext = React.createContext<AppContextInterface>({
  title: 'Healthcare Compare',
  setTitle: () => { },
});

export const useAppContext = () => React.useContext(AppContext);

export const WithAppContext = ({ children }: { children: React.ReactNode }) => {
  const [title, setTitle] = React.useState('Healthcare Compare');

  return (
    <AppContext.Provider value={{ title, setTitle }}>
      {children}
    </AppContext.Provider>
  );
};
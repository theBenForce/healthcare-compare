import React from 'react';

interface AppContextInterface {
  title: string;
  setTitle: (title: string) => void;
  isModified: boolean;
  setIsModified: (isModified: boolean) => void;
}

const AppContext = React.createContext<AppContextInterface>({
  title: 'Healthcare Compare',
  setTitle: () => { },
  isModified: false,
  setIsModified: () => { },
});

export const useAppContext = () => React.useContext(AppContext);

export const WithAppContext = ({ children }: { children: React.ReactNode }) => {
  const [title, setTitle] = React.useState('Healthcare Compare');
  const [isModified, setIsModified] = React.useState(false);

  return (
    <AppContext.Provider value={{ title, setTitle, isModified, setIsModified }}>
      {children}
    </AppContext.Provider>
  );
};
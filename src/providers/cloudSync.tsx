import React from 'react';
import { useCloudAuth } from './cloudAuth';
import { useDB } from './db';
import Axios from 'axios';

interface CloudSyncContextInterface {
  resetSync: () => void;
  sync: () => void;
  isSyncing: boolean;
}

const cloudSyncContext = React.createContext<CloudSyncContextInterface>({
  resetSync: () => { },
  sync: () => { },
  isSyncing: false,
});

export const useCloudSync = () => React.useContext(cloudSyncContext);

export const WithCloudSync: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [isSyncing, setIsSyncing] = React.useState(false);
  const { authToken } = useCloudAuth();
  const [syncInterval, setSyncInterval] = React.useState<NodeJS.Timeout | null>(null);
  const { db } = useDB();

  const sync = React.useCallback(() => {
    console.info(`Syncing...`);
    if (!db || !authToken) return;
    setIsSyncing(true);

    const handler = async () => {
      console.info(`Using token ${authToken}`);
      const storeNames = db?.objectStoreNames ?? [];
      const config = {} as Record<string, Array<unknown>>;

      for (const storeName of storeNames) {
        const data = await db?.getAll(storeName);
        config[storeName] = data ?? [];
      }

      const configBlob = new Blob([JSON.stringify(config)], { type: 'application/json' });

      const metadata = {
        'name': 'backup.json', // Filename at Google Drive
        'mimeType': 'application/json', // mimeType at Google Drive
        'parents': ['appDataFolder'], // Folder ID at Google Drive
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', configBlob);

      const result = await Axios.post('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', form, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: 'application/json'
        }
      });

      return result;
    };

    handler().then((result) => {
      console.info(`Sync complete`);

      console.dir({ result });
    }).finally(() => {
      setIsSyncing(false);
    });
  }, [db, authToken]);

  const resetSync = React.useCallback(() => {
    if (isSyncing) return;
    if (syncInterval) clearInterval(syncInterval);
    setSyncInterval(setTimeout(sync, 1000 * 10));
  }, [isSyncing, sync, syncInterval]);

  return (
    <cloudSyncContext.Provider value={{ sync, resetSync, isSyncing }}>
      {children}
    </cloudSyncContext.Provider>
  );
};
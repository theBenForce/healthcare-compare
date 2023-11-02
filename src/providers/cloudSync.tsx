import React from 'react';
import { useCloudAuth } from './cloudAuth';
import { useDB } from './db';
import Axios from 'axios';
import { ResetTvOutlined } from '@mui/icons-material';

interface CloudSyncContextInterface {
  resetSync: () => void;
  sync: () => void;
  isSyncing: boolean;
  isSyncEnabled: boolean;
}

const cloudSyncContext = React.createContext<CloudSyncContextInterface>({
  resetSync: () => { },
  sync: () => { },
  isSyncing: false,
  isSyncEnabled: false,
});

export const useCloudSync = () => React.useContext(cloudSyncContext);

export const WithCloudSync: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [isSyncing, setIsSyncing] = React.useState(false);
  const { authToken, drive } = useCloudAuth();
  const [syncInterval, setSyncInterval] = React.useState<NodeJS.Timeout | null>(null);
  const { db } = useDB();

  const isSyncEnabled = React.useMemo(() => {
    const result = Boolean(authToken?.access_token) && Boolean(drive);
    console.info(`Calculating sync enabled: ${result}`);
    return result;
  }, [authToken?.access_token, drive]);

  const sync = React.useCallback(() => {
    console.info(`Syncing...`);
    if (!db || !authToken || !drive) return;
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


      const existingFiles = await drive.files.list({
        access_token: authToken.access_token,
        spaces: 'appDataFolder',
        fields: 'nextPageToken, files(id, name)',
      });



      const metadata = {
        'name': 'backup.json', // Filename at Google Drive
        'mimeType': 'application/json', // mimeType at Google Drive
        'parents': ['appDataFolder'], // Folder ID at Google Drive
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', configBlob);

      const existingFile = existingFiles.result.files?.find(x => x.name === 'backup.json');

      if (existingFile) {
        console.info(`Updating existing file ${existingFile.id}`);

        const result = await Axios.patch(`https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}`, configBlob, {
          headers: {
            Authorization: `Bearer ${authToken.access_token}`,
            Accept: 'application/json'
          },
          params: {
            uploadType: 'media',
            fields: 'id'
          }
        });

        return result;
      }


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
  }, [db, authToken, drive]);

  const resetSync = React.useCallback(() => {
    if (isSyncing) return;
    if (syncInterval) clearInterval(syncInterval);
    setSyncInterval(setTimeout(sync, 1000 * 10));
  }, [isSyncing, sync, syncInterval]);

  return (
    <cloudSyncContext.Provider value={{ sync, resetSync, isSyncing, isSyncEnabled }}>
      {children}
    </cloudSyncContext.Provider>
  );
};
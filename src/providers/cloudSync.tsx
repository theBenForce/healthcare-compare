/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useCloudAuth } from './cloudAuth';
import { DbBackup, useDB } from './db';
import Axios from 'axios';
import { useAppContext } from './state';

interface CloudSyncContextInterface {
  sync: () => void;
  isSyncing: boolean;
  isSyncEnabled: boolean;
}

const cloudSyncContext = React.createContext<CloudSyncContextInterface>({
  sync: () => { },
  isSyncing: false,
  isSyncEnabled: false,
});

export const useCloudSync = () => React.useContext(cloudSyncContext);

export const WithCloudSync: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [isSyncing, setIsSyncing] = React.useState(false);
  const { authToken } = useCloudAuth();
  const [syncInterval, setSyncInterval] = React.useState<NodeJS.Timeout | null>(null);
  const { mergeStates } = useDB();
  const { isModified } = useAppContext();

  const isSyncEnabled = React.useMemo(() => Boolean(authToken?.access_token), [authToken?.access_token]);

  const drive = React.useMemo(() => {
    return Axios.create({
      baseURL: 'https://www.googleapis.com/drive/v3',
      headers: {
        Authorization: `Bearer ${authToken?.access_token}`,
        Accept: 'application/json'
      }
    });
  }, [authToken?.access_token]);

  const sync = React.useCallback(() => {
    console.info(`Syncing...`);
    if (!authToken) return;
    setIsSyncing(true);

    const handler = async () => {
      console.info(`Using token ${authToken}`);

      const existingFiles = await drive.get('/files', {
        params: {
          spaces: 'appDataFolder',
        }
      });

      const existingFile = existingFiles.data.files?.find((x: any) => x.name === 'backup.json');

      let existingBackup = {} as DbBackup;

      if (existingFile?.id) {
        const fileContent = await drive.get<DbBackup>(`/files/${existingFile.id}`, {
          params: {
            alt: 'media'
          },
        });

        existingBackup = fileContent.data;

        console.info(`Existing backup loaded`);
        console.dir(existingBackup);
      }


      const backup = await mergeStates(existingBackup);
      console.info(`Backup created`);
      console.dir(backup);

      const backupBlob = new Blob([JSON.stringify(backup)], { type: 'application/json' });

      let result = null;

      if (existingFile) {
        console.info(`Updating existing file ${existingFile.id}`);

        result = await drive.patch(`/files/${existingFile.id}`, backupBlob, {
          params: {
            uploadType: 'media',
            fields: 'id'
          }
        });
      } else {
        console.info(`Creating new file`);
        const metadata = {
          'name': 'backup.json', // Filename at Google Drive
          'mimeType': 'application/json', // mimeType at Google Drive
          'parents': ['appDataFolder'], // Folder ID at Google Drive
        };

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', backupBlob);

        result = await drive.post('/files', form, {
          params: {
            uploadType: 'multipart',
            fields: 'id'
          }
        });
      }

      return result;
    };

    handler().then((result) => {
      console.info(`Sync complete`);

      console.dir({ result });
    }).finally(() => {
      setIsSyncing(false);
    });
  }, [mergeStates, authToken, drive]);

  React.useEffect(() => {
    if (!isSyncEnabled) return;

    if (syncInterval) {
      clearTimeout(syncInterval);
    }

    if (!isModified) return;

    const timeout = setTimeout(() => {
      sync();
    }, 10_000);

    setSyncInterval(timeout);

  }, [isModified, isSyncEnabled, sync, syncInterval]);

  return (
    <cloudSyncContext.Provider value={{ sync, isSyncing, isSyncEnabled }}>
      {children}
    </cloudSyncContext.Provider>
  );
};
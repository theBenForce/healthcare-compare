/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useCloudAuth } from './cloudAuth';
import { useDB } from './db';
import Axios from 'axios';
import { useAppContext } from './state';
import { BackupSchema, BackupV1Schema, BackupV2Schema } from '../types/db.dto';

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

const BACKUP_FILENAME = 'backup.json';

export const useCloudSync = () => React.useContext(cloudSyncContext);

export const WithCloudSync: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [isSyncing, setIsSyncing] = React.useState(false);
  const { authToken } = useCloudAuth();
  const [syncInterval, setSyncInterval] = React.useState<NodeJS.Timeout | null>(null);
  const { mergeStates } = useDB();
  const { isModified, setIsModified } = useAppContext();

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

      console.info(`Found ${existingFiles.data.files?.length} files`);

      const existingFile = existingFiles.data.files?.find((x: any) => x.name === BACKUP_FILENAME);

      let existingBackup = {} as BackupSchema;

      if (existingFile?.id) {
        const fileContent = await drive.get(`/files/${existingFile.id}`, {
          params: {
            alt: 'media'
          },
        });

        console.info(`Parsing data ${JSON.stringify(fileContent.data, null, 2)}`)

        if ('version' in fileContent.data) {
          console.info(`Found backup version ${fileContent.data.version}`);
          existingBackup = BackupV2Schema.parse(fileContent.data);
        } else {
          console.info(`Found legacy backup`);
          existingBackup = BackupV1Schema.parse(fileContent.data);
        }

        console.info(`Existing backup loaded`);
        console.dir(existingBackup);
      }


      const backup = await mergeStates(existingBackup);
      console.info(`Backup created`);
      console.dir(backup);

      const backupBlob = new Blob([JSON.stringify(backup)], { type: 'application/json' });

      let result = null;

      if (existingFile) {
        console.info(`Deleting existing file ${existingFile.id}`);

        await drive.delete(`/files/${existingFile.id}`);
      }

      console.info(`Creating new file`);
      const metadata = {
        'name': BACKUP_FILENAME, // Filename at Google Drive
        'mimeType': 'application/json', // mimeType at Google Drive
        'parents': ['appDataFolder'], // Folder ID at Google Drive
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', backupBlob);

      result = await drive.post('https://www.googleapis.com/upload/drive/v3/files', form, {
        params: {
          uploadType: 'multipart',
          fields: 'id'
        }
      });

      return result;
    };

    handler().then((result) => {

      setIsModified(false);
      console.info(`Sync complete`);

      console.dir({ result });
    }).finally(() => {
      setIsSyncing(false);
    });
  }, [mergeStates, authToken, drive, setIsModified]);

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
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
  const { authToken, drive } = useCloudAuth();
  const [syncInterval, setSyncInterval] = React.useState<NodeJS.Timeout | null>(null);
  const { mergeStates } = useDB();
  const { isModified } = useAppContext();

  const isSyncEnabled = React.useMemo(() => Boolean(authToken?.access_token) && Boolean(drive), [authToken?.access_token, drive]);

  const sync = React.useCallback(() => {
    console.info(`Syncing...`);
    if (!authToken || !drive) return;
    setIsSyncing(true);

    const handler = async () => {
      console.info(`Using token ${authToken}`);

      const existingFiles = await drive.files.list({
        access_token: authToken.access_token,
        spaces: 'appDataFolder',
        fields: 'nextPageToken, files(id, name)',
      });
      const existingFile = existingFiles.result.files?.find(x => x.name === 'backup.json');

      let existingBackup = {} as DbBackup;

      if (existingFile?.id) {
        const fileContent = await drive.files.get({
          fileId: existingFile.id,
          alt: 'media',
          access_token: authToken.access_token,
        });

        existingBackup = JSON.parse(fileContent.body) as DbBackup;

        console.info(`Existing backup loaded`);
        console.dir(existingBackup);
      }


      const backup = await mergeStates(existingBackup);
      const backupBlob = new Blob([JSON.stringify(backup)], { type: 'application/json' });

      const metadata = {
        'name': 'backup.json', // Filename at Google Drive
        'mimeType': 'application/json', // mimeType at Google Drive
        'parents': ['appDataFolder'], // Folder ID at Google Drive
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', backupBlob);


      if (existingFile) {
        console.info(`Updating existing file ${existingFile.id}`);

        const result = await Axios.patch(`https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}`, backupBlob, {
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
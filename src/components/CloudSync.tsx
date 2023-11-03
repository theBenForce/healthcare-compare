import CloudIcon from '@mui/icons-material/CloudDoneRounded';
import ModifiedIcon from '@mui/icons-material/CloudQueueRounded';
import SyncIcon from '@mui/icons-material/CloudSyncRounded';
import IconButton from '@mui/material/IconButton';

import Icon from '@mui/material/Icon';
import React from 'react';
import { useCloudSync } from '../providers/cloudSync';
import { useAppContext } from '../providers/state';

export const CloudSyncStatus: React.FC = () => {
  const { sync, isSyncing, isSyncEnabled } = useCloudSync();
  const { isModified } = useAppContext();

  const onSync = React.useCallback(() => {
    sync();
  }, [sync]);

  return <IconButton onClick={onSync} disabled={isSyncing || !isSyncEnabled} color='secondary'>
    <Icon color='inherit'>
      {isSyncing ? <SyncIcon /> : isModified ? <ModifiedIcon /> : <CloudIcon />}
    </Icon>
  </IconButton>
}

export default CloudSyncStatus;
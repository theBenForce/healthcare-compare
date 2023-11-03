import IconButton from '@mui/material/IconButton';
import CloudIcon from '@mui/icons-material/CloudRounded';

import React from 'react';
import { useCloudSync } from '../providers/cloudSync';
import { CircularProgress } from '@mui/material';

export const CloudSyncStatus: React.FC = () => {
  const { sync, isSyncing, isSyncEnabled } = useCloudSync();

  if (!isSyncEnabled) return null;

  return <IconButton onClick={sync} disabled={isSyncing} color='info'>
    {isSyncing ? <CircularProgress /> : <CloudIcon />}
  </IconButton>
}
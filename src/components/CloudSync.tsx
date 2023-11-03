import CloudIcon from '@mui/icons-material/CloudRounded';
import CloudUploadIcon from '@mui/icons-material/CloudUploadRounded';
import IconButton from '@mui/material/IconButton';

import React from 'react';
import { useCloudSync } from '../providers/cloudSync';
import { useAppContext } from '../providers/state';

export const CloudSyncStatus: React.FC = () => {
  const { sync, isSyncing, isSyncEnabled } = useCloudSync();
  const { isModified } = useAppContext();

  if (!isSyncEnabled) return null;

  return <IconButton onClick={sync} disabled={isSyncing} color={isModified ? 'warning' : 'inherit'}>
    {isSyncing ? <CloudUploadIcon /> : <CloudIcon />}
  </IconButton>
}
import { Avatar } from '@mui/material';
import React from 'react';
import { useCloudAuth } from '../providers/cloudAuth';

export const UserAvatar: React.FC = () => {
  const { profile } = useCloudAuth();
  if (!profile) return null;

  const backupDisplay = profile.name.split(/\s+/).map(word => word[0].toUpperCase()).join('');

  return <Avatar alt={profile.name} src={profile.picture}>{backupDisplay}</Avatar>
}
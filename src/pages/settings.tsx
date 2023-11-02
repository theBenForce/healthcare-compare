import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListSubheader from '@mui/material/ListSubheader';
import React from 'react';
import { useCloudAuth } from '../providers/cloudAuth';

export const SettingsPage: React.FC = () => {
  const { signIn } = useCloudAuth();

  return <List>
    <ListSubheader>Authentication</ListSubheader>
    <ListItemButton onClick={signIn}>Sign in with Google</ListItemButton>
  </List>
}
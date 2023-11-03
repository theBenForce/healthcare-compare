import ListItemText from '@mui/material/ListItemText';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import React from 'react';
import Switch from '@mui/material/Switch';
import { FeatureFlags, useFeatureFlags, useFlag } from '../providers/featureFlags';

export const SettingsPage: React.FC = () => {
  const { setFlagState } = useFeatureFlags();

  const onFeatureToggle = React.useCallback((feature: `${FeatureFlags}`) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFlagState(feature, e.target.checked);
  }, [setFlagState]);


  return <List>
    <ListItem>
      <ListItemText primary="Cloud Sync" secondary="Sync your data to the cloud" />
      <Switch edge="end" onChange={onFeatureToggle('CLOUD_SYNC')} checked={useFlag('CLOUD_SYNC')} />
    </ListItem>
  </List>
}

export default SettingsPage;
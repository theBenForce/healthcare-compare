import React from 'react';
import { useAppContext } from '../providers/state';
import { Stack } from '@mui/material';

export const SummaryPage: React.FC = () => {
  const { setTitle } = useAppContext();
  React.useEffect(() => {
    setTitle('Healthcare Compare');
  }, [setTitle]);

  return <Stack spacing={2}></Stack>;
};
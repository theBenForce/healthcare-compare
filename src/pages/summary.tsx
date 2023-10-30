import React from 'react';
import { useAppContext } from '../providers/state';
import { Stack, Typography } from '@mui/material';
import { useCostReport } from '../hooks/costReport';
import { BarChart } from '@mui/x-charts/BarChart';

export const SummaryPage: React.FC = () => {
  const { setTitle } = useAppContext();
  const report = useCostReport();

  React.useEffect(() => {
    setTitle('Healthcare Compare');
  }, [setTitle]);

  return <Stack spacing={2}>
    <Typography variant="h6">Summary</Typography>
    <BarChart
      xAxis={[{ scaleType: 'band', data: report?.map(({ name }) => name) ?? [] }]}
      series={[{ data: report?.map(({ premiums }) => premiums) ?? [] }]}
      height={500}
    />
  </Stack>;
};
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
    {Boolean(report.length) && <><Typography variant="h6">Summary</Typography>
      <BarChart
        xAxis={[{ scaleType: 'band', data: report?.map(({ name }) => name) ?? [] }]}
        series={[{ data: report?.map(({ premiums }) => premiums) ?? [] }]}
        height={500}
      /></>}
    <Typography variant="h6">About</Typography>
    <Typography variant="body1">Welcome to Healthcare Compared. This site was built to provide a simple
      way to compare insurance plans each year.</Typography>
  </Stack>;
};
import React from 'react';
import { useAppContext } from '../providers/state';
import { Stack, Typography } from '@mui/material';
import { useCostReport } from '../hooks/costReport';
import { BarChart } from '@mui/x-charts/BarChart';
import { useTranslation } from 'react-i18next';

export const SummaryPage: React.FC = () => {
  const { setTitle } = useAppContext();
  const report = useCostReport();
  const { t } = useTranslation();

  React.useEffect(() => {
    setTitle(t('summary.title'));
  }, [setTitle, t]);

  return <Stack spacing={2}>
    {Boolean(report.length) && <><Typography variant="h6">Summary</Typography>
      <BarChart
        xAxis={[{ scaleType: 'band', data: report?.map(({ name }) => name) ?? [] }]}
        series={[{ data: report?.map(({ premiums }) => premiums) ?? [] }]}
        height={500}
      /></>}
    <Typography variant="h6">{t('summary.about.title')}</Typography>
    <Typography variant="body1">{t('summary.about.content')}</Typography>
  </Stack>;
};

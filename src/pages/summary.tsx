import React from 'react';
import { useAppContext } from '../providers/state';
import { useCostReport } from '../hooks/costReport';
import { BarChart } from '@mui/x-charts/BarChart';
import { useTranslation } from 'react-i18next';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import useTheme from '@mui/material/styles/useTheme';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { BuyMeACoffee } from '../components/BuyMeACoffee';

export const SummaryPage: React.FC = () => {
  const { setTitle } = useAppContext();
  const report = useCostReport();
  const { t } = useTranslation();
  const theme = useTheme();

  const columns = React.useMemo<Array<GridColDef>>(() => [
    {
      field: 'name',
      headerName: 'Plan',
      flex: 3,
    },
    {
      field: 'premiums',
      headerName: 'Premiums',
      flex: 1,
      type: 'number',
      valueFormatter: params => `$` + params.value.toFixed(2),
    },
    {
      field: 'expenses',
      headerName: 'Expenses',
      flex: 1,
      type: 'number',
      valueFormatter: params => `$` + params.value.toFixed(2),
    },
    {
      field: 'discount',
      headerName: 'Discount',
      flex: 1,
      type: 'number',
      valueFormatter: params => `$` + params.value.toFixed(2),
    },
    {
      field: 'total',
      headerName: 'Total',
      flex: 1,
      type: 'number',
      valueFormatter: params => `$` + params.value.toFixed(2),
    },
  ], []);

  React.useEffect(() => {
    setTitle(t('summary.title'));
  }, [setTitle, t]);

  return <Stack spacing={2} sx={{ paddingBottom: 8 }}>
    {Boolean(report.length) && <>
      <BarChart
        xAxis={[{ scaleType: 'band', data: report?.map(({ name }) => name) ?? [] }]}
        series={[{ data: report?.map(({ total }) => total) ?? [], color: theme.palette.secondary.main }]}
        height={500}
      />
      <DataGrid
        rows={report}
        getRowId={row => row.planId}
        columns={columns}
      />
    </>}
    <Typography variant="h6">{t('summary.about.title')}</Typography>
    <Typography variant="body1">{t('summary.about.content')}</Typography>
    <Typography variant="h6">{t('summary.disclaimer.title')}</Typography>
    <Typography variant="h6">{t('summary.disclaimer.content')}</Typography>

    {Boolean(report.length) && <BuyMeACoffee />}
  </Stack>;
};

export default SummaryPage;
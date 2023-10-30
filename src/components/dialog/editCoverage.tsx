import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, LinearProgress, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import React from 'react';
import { EntitySelector } from '../EntitySelector';
import { TableNames } from '../../providers/db';
import { useTable } from '../../hooks/table';
import { CoverageSchema, CoverageValue } from '../../types/coverage.dto';


interface EditCoverageDialogProps {
  coverageId: string;
  planId?: string;
  categoryId?: string;
  onClose: (value?: CoverageSchema) => void;
}

interface CoverageEditorProps {
  value: CoverageValue;
  onChange: (value: CoverageValue) => void;
}

export const CoverageEditor: React.FC<CoverageEditorProps> = ({ value, onChange }) => {
  return <Stack spacing={2} direction='row'>
    <FormControl sx={{ flex: 1 }}>
      <InputLabel id="type-select-label">Type</InputLabel>
      <Select
        labelId="type-select-label"
        id="type-select"
        value={value.type}
        label="Type"
        onChange={(event) => onChange({ ...value, type: event.target.value as CoverageValue['type'] })}
      >
        <MenuItem value='copay'>Copay</MenuItem>
        <MenuItem value='percent'>Percent</MenuItem>
      </Select>
    </FormControl>

    <TextField sx={{ flex: 1 }} label="Amount" type="number" value={value.amount} onChange={(event) => onChange({ ...value, amount: parseFloat(event.target.value) })} />
  </Stack>;
};

export const EditCoverageDialog: React.FC<EditCoverageDialogProps> = ({ coverageId, planId, categoryId, onClose }) => {
  const { get: getCoverage } = useTable<CoverageSchema>({ tableName: TableNames.COVERAGES });
  const [coverage, setCoverage] = React.useState<CoverageSchema | null>(null);

  React.useEffect(() => {
    if (!coverageId) return;
    getCoverage(coverageId)
      .then(value => setCoverage(value));
  }, [coverageId, getCoverage]);

  const onSave = async () => {
    if (coverage)
      onClose(coverage);
  };

  return <Dialog open={!!coverageId} onClose={() => onClose()} fullWidth maxWidth='md'>
    <DialogTitle>Edit Coverage</DialogTitle>
    <DialogContent>
      {!coverage && <Stack spacing={2}>
        <LinearProgress />
      </Stack>}
      {coverage && <Stack spacing={2} sx={{ my: 2 }}>
        {planId && <EntitySelector table={TableNames.CATEGORIES} value={coverage.categoryId} onChange={(categoryId) => setCoverage((value) => ({ ...value!, categoryId: categoryId! }))} label={'Category'} />}
        {categoryId && <EntitySelector table={TableNames.PLANS} value={coverage.planId} onChange={(planId) => setCoverage((value) => ({ ...value!, planId: planId! }))} label={'Plan'} />}
        <Typography variant='h6'>Before Deductible</Typography>
        <CoverageEditor value={coverage.beforeDeductible} onChange={(beforeDeductible) => setCoverage((value) => ({ ...value!, beforeDeductible }))} />

        <Typography variant='h6'>After Deductible</Typography>
        <CoverageEditor value={coverage.afterDeductible} onChange={(afterDeductible) => setCoverage((value) => ({ ...value!, afterDeductible }))} />
      </Stack>}
    </DialogContent>
    <DialogActions>
      <Button onClick={() => onClose()}>Cancel</Button>
      <Button onClick={onSave} variant='contained'>Save</Button>
    </DialogActions>
  </Dialog>;
}
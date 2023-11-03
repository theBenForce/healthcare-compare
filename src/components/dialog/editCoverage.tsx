
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import LinearProgress from '@mui/material/LinearProgress';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React from 'react';
import { useTable } from '../../hooks/table';
import { TableNames } from '../../providers/db';
import { CoverageSchema, CoverageValue } from '../../types/coverage.dto';
import { EntitySelector } from '../EntitySelector';


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
        <MenuItem value='percent'>Co-Insurance</MenuItem>
      </Select>
    </FormControl>

    <TextField
      sx={{ flex: 1 }}
      label="Amount"
      type="number"
      value={value.amount}
      InputProps={{
        startAdornment: value.type === 'copay' && <InputAdornment position='start'>$</InputAdornment>,
        endAdornment: value.type === 'percent' && <InputAdornment position='end'>%</InputAdornment>,
      }}
      onChange={(event) => onChange({ ...value, amount: parseFloat(event.target.value) })} />
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

        <Stack direction='row' spacing={2}>
          {planId && <EntitySelector sx={{ flex: 3 }} table={TableNames.CATEGORIES} value={coverage.categoryId} onChange={(categoryId) => setCoverage((value) => ({ ...value!, categoryId: categoryId! }))} label={'Category'} />}
          {categoryId && <EntitySelector sx={{ flex: 3 }} table={TableNames.PLANS} value={coverage.planId} onChange={(planId) => setCoverage((value) => ({ ...value!, planId: planId! }))} label={'Plan'} />}

          <FormControlLabel control={<Switch checked={coverage.isInNetwork} onChange={(event) => setCoverage((value) => ({ ...value!, isInNetwork: event.target.checked }))} />} label="In Network" />

        </Stack>

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
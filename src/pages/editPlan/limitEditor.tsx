import Stack from '@mui/material/Stack';
import React from 'react';
import { DollarField } from '../../components/DollarField';
import { PlanLimitSchema } from '../../types/plan.dto';

interface PlanLimitEditorParams {
  value?: PlanLimitSchema;
  isFamilyPlan: boolean;
  onChange: (value: PlanLimitSchema) => void;
}

export const PlanLimitEditor: React.FC<PlanLimitEditorParams> = ({ value: initialValue, onChange, isFamilyPlan }) => {

  const value = React.useMemo(() => initialValue ?? PlanLimitSchema.parse({
    deductible: 0,
    familyDeductible: 0,
    outOfPocketMax: 0,
    familyOutOfPocketMax: 0
  }), [initialValue]);

  return <Stack spacing={2}>
    <Stack direction="row" spacing={2}>
      <DollarField sx={{ flex: 1 }} label="Deductible" value={value.deductible} onChange={(deductible) => onChange({ ...value, deductible })} />
      {isFamilyPlan && <DollarField sx={{ flex: 1 }} label="Family Deductible" value={value.familyDeductible} onChange={(familyDeductible) => onChange({ ...value, familyDeductible })} />}
    </Stack>

    <Stack direction="row" spacing={2}>
      <DollarField sx={{ flex: 1 }} label="Out of Pocket Max" value={value.outOfPocketMax} onChange={(outOfPocketMax) => onChange({ ...value, outOfPocketMax })} />
      {isFamilyPlan && <DollarField sx={{ flex: 1 }} label="Family Out of Pocket Max" value={value.familyOutOfPocketMax} onChange={(familyOutOfPocketMax) => onChange({ ...value, familyOutOfPocketMax })} />}
    </Stack>
  </Stack>;
}
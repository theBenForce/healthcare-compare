import { Checkbox, FormControlLabel, Stack } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import React from 'react';
import { MonthValueSchema } from '../types/expense.dto';

interface MonthSelectorProps {
  value: MonthValueSchema[];
  onChange: (value: number[]) => void;
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const MonthSelector: React.FC<MonthSelectorProps> = ({ value, onChange }) => {
  const onToggle = (month: MonthValueSchema) => {
    if (value.includes(month)) {
      onChange(value.filter(x => x !== month));
    } else {
      onChange([...value, month]);
    }
  };

  return <Grid container spacing={2}>
    {months.map((label, i) => <Grid key={label} xs={2}>
      <FormControlLabel
        control={<Checkbox
          value={value.includes(i as MonthValueSchema)}
          onChange={() => onToggle(i)} />} label={label} /></Grid>)}
  </Grid>;
};
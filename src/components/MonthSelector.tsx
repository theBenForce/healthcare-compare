import { Checkbox, FormControlLabel } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import React from 'react';
import { MonthValueSchema } from '../types/expense.dto';

interface MonthSelectorProps {
  value: MonthValueSchema[];
  onChange: (value: number[]) => void;
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const MonthSelector: React.FC<MonthSelectorProps> = ({ value, onChange }) => {
  const setValue = (month: number, isSelected: boolean) => {
    if (!isSelected) {
      onChange(value.filter(x => x !== month));
    } else {
      onChange([...value.filter(x => x !== month), month]);
    }
  };

  return <Grid container spacing={2}>
    {months.map((label, i) => <Grid key={label} xs={2}>
      <FormControlLabel
        control={<Checkbox
          inputProps={{ 'aria-label': 'controlled' }}
          checked={value.includes(i)}
          onChange={(event) => setValue(i, event.target.checked)} />} label={label} /></Grid>)}
  </Grid>;
};
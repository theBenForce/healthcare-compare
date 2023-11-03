import type { SxProps } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import React from 'react';

interface DollarFieldParams {
  label: string;
  value: number;
  onChange: (value: number) => void;
  sx?: SxProps;
}

export const DollarField: React.FC<DollarFieldParams> = ({ label, value, onChange, sx }) => {
  return <TextField
    sx={sx}
    label={label}
    type='number'
    InputProps={{
      startAdornment: <InputAdornment position="start">$</InputAdornment>,
    }}
    value={value}
    onChange={(event) => onChange(Number(event.target.value))} />;
}
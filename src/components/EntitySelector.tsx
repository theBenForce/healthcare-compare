import React from 'react';
import { TableNames } from '../providers/db';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { useTable } from '../hooks/table';
import { BaseSchema } from '../types/base.dto';

interface EntitySelectorParams {
  value: string;
  onChange: (value: string | null) => void;
  table: TableNames;
  label: string;
}


export const EntitySelector: React.FC<EntitySelectorParams> = ({ value, onChange, table, label }) => {
  const { values } = useTable<BaseSchema>({ tableName: table });

  return <Autocomplete
    renderInput={(params) => <TextField {...params} label={label} />}
    value={value}
    options={values.map(x => x.id)}
    getOptionLabel={entityId => values.find(x => x.id === entityId)?.name ?? ''}
    onChange={(_event, entityId) => onChange(entityId)} />;
}
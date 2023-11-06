import React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { useTable } from '../hooks/table';
import { TableNames } from '../types/base.dto';
import type { SxProps } from '@mui/material';
import { AllDbTypes, isBaseEntity } from '../types/db.dto';

interface EntitySelectorParams {
  value: string | null;
  onChange: (value: string | null) => void;
  table: TableNames;
  label: string;
  sx?: SxProps;
}


export const EntitySelector: React.FC<EntitySelectorParams> = ({ value, onChange, table, label, sx }) => {
  const { values } = useTable<AllDbTypes>({ tableName: table });

  return <Autocomplete
    sx={sx}
    renderInput={(params) => <TextField {...params} label={label} />}
    value={value}
    options={values.map(x => x.id)}
    getOptionLabel={entityId => {
      const entry = values.find(x => x.id === entityId);
      if (isBaseEntity(entry)) {
        return entry.name;
      }

      return entityId;
    }}
    onChange={(_event, entityId) => onChange(entityId)} />;
}
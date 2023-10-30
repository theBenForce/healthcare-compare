import AddIcon from '@mui/icons-material/AddRounded';
import { useTheme } from '@mui/material';
import Fab from '@mui/material/Fab';
import Grid from '@mui/material/Unstable_Grid2';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ulid } from 'ulidx';
import { useTable } from '../hooks/table';
import { TableNames } from '../providers/db';
import { useAppContext } from '../providers/state';
import { BaseSchema } from '../types/base.dto';
import { EntityCard } from './EntityCard';

interface EntityListParams {
  table: TableNames;
  title: string;
}

export const EntityList: React.FC<EntityListParams> = ({ table, title }) => {
  const { values, save } = useTable<BaseSchema>({ tableName: table });
  const theme = useTheme();
  const navigate = useNavigate();
  const { setTitle } = useAppContext();

  React.useEffect(() => {
    setTitle(title);
  }, [setTitle, title]);

  const onCreate = async () => {
    const id = ulid();
    await save({
      id,
      name: `New ${table}`,
      type: table,
    });
    navigate(`/${table}/${id}`);
  };


  return <Grid container spacing={2}>
    {values.map(value => <EntityCard key={value.id} table={table} entityId={value.id} />)}

    <Fab onClick={onCreate} sx={{ position: 'fixed', bottom: theme.spacing(2), right: theme.spacing(2) }}>
      <AddIcon />
    </Fab>
  </Grid>;
}
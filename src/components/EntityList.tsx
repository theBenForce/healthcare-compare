import React from 'react';
import { Card, CardActions, CardHeader, IconButton, Stack, useTheme } from '@mui/material';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/AddRounded';
import EditIcon from '@mui/icons-material/EditRounded';
import DeleteIcon from '@mui/icons-material/DeleteRounded';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../providers/state';
import { useTable } from '../hooks/table';
import { TableNames } from '../providers/db';
import { ulid } from 'ulidx';
import { BaseSchema } from '../types/base.dto';

interface EntityListParams {
  table: TableNames;
  title: string;
}

export const EntityList: React.FC<EntityListParams> = ({ table, title }) => {
  const { values, create, remove } = useTable<BaseSchema>(table);
  const theme = useTheme();
  const navigate = useNavigate();
  const { setTitle } = useAppContext();

  React.useEffect(() => {
    setTitle(title);
  }, [setTitle, title]);

  const onCreate = async () => {
    const id = await create(BaseSchema.parse({
      id: ulid(),
      name: `New ${title}`
    }));
    navigate(`/${table}/${id}`);
  };

  const onDelete = (id: string) => {
    remove(id);
  }

  return <Stack spacing={2}>
    {values.map(value => (<Card key={value.id}>
      <CardHeader title={value.name} content={value.description} />
      <CardActions>
        <IconButton onClick={() => navigate(`/${table}/${value.id}`)}>
          <EditIcon />
        </IconButton>
        <IconButton onClick={() => onDelete(value.id)}>
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>))}

    <Fab onClick={onCreate} sx={{ position: 'fixed', bottom: theme.spacing(2), right: theme.spacing(2) }}>
      <AddIcon />
    </Fab>
  </Stack>;
}
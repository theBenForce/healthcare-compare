import AddIcon from '@mui/icons-material/AddRounded';
import EditIcon from '@mui/icons-material/EditRounded';
import { Card, CardActions, CardHeader, IconButton, Stack, useTheme } from '@mui/material';
import Fab from '@mui/material/Fab';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ulid } from 'ulidx';
import { useTable } from '../hooks/table';
import { TableNames } from '../providers/db';
import { useAppContext } from '../providers/state';
import { CategorySchema } from '../types/category.dto';

export const CategoryListPage: React.FC = () => {
  const { values, create } = useTable<CategorySchema>(TableNames.CATEGORIES);
  const theme = useTheme();
  const navigate = useNavigate();
  const { setTitle } = useAppContext();

  React.useEffect(() => {
    setTitle('Expense Categories');
  }, [setTitle]);

  const onCreate = async () => {
    const id = ulid();
    await create({
      id,
      name: '',
      description: '',
    });
    navigate(`/category/${id}`);
  };

  return <Stack spacing={2}>
    {values.map(value => (<Card key={value.id}>
      <CardHeader title={value.name} />
      <CardActions>
        <IconButton onClick={() => navigate(`/category/${value.id}`)}>
          <EditIcon />
        </IconButton>
        {/* <IconButton onClick={() => onDeletePlan(plan.id)}>
          <DeleteIcon />
        </IconButton> */}
      </CardActions>
    </Card>))}

    <Fab onClick={onCreate} sx={{ position: 'fixed', bottom: theme.spacing(2), right: theme.spacing(2) }}>
      <AddIcon />
    </Fab>
  </Stack>;
}
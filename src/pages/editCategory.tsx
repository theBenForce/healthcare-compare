import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Fab, LinearProgress, Stack, TextField, Typography, useTheme } from '@mui/material';
import { useAppContext } from '../providers/state';

import SaveIcon from "@mui/icons-material/SaveRounded";
import { useTable } from '../hooks/table';
import { CategorySchema } from '../types/category.dto';
import { TableNames } from '../providers/db';

export const EditCategoryPage: React.FC = () => {
  const { get, save } = useTable<CategorySchema>({ tableName: TableNames.CATEGORIES });
  const { id } = useParams();
  const [category, setCategory] = React.useState<CategorySchema | null>(null);
  const { setTitle } = useAppContext();
  const theme = useTheme();
  const navigate = useNavigate();

  React.useEffect(() => {
    setTitle('Edit Person');
  }, [setTitle]);

  React.useEffect(() => {
    if (!id) return;

    get(id)
      .then(person => setCategory(person));
  }, [get, id]);

  if (!category) {
    return <Stack spacing={2}>
      <Typography variant="h6">Loading...</Typography>
      <LinearProgress />
    </Stack>;
  }

  const onSave = async () => {
    await save(category);
    navigate('/category');
  };

  return <Stack spacing={2}>
    <TextField fullWidth label="Name" value={category?.name} onChange={(event) => setCategory(value => ({ ...value, name: event.target.value }))} />


    <Fab onClick={onSave} sx={{ position: 'fixed', bottom: theme.spacing(2), right: theme.spacing(2) }}>
      <SaveIcon />
    </Fab>
  </Stack>;
}
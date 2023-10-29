import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Accordion, AccordionDetails, AccordionSummary, Fab, FormControlLabel, LinearProgress, Stack, Switch, TextField, Typography, useTheme } from '@mui/material';
import { useAppContext } from '../providers/state';

import SaveIcon from "@mui/icons-material/SaveRounded";
import { useTable } from '../hooks/table';
import { CategorySchema } from '../types/category.dto';
import { TableNames } from '../providers/db';
import { ExpandCircleDownRounded } from '@mui/icons-material';
import { ExpenseList } from './personEdit/expenseList';
import { ulid } from 'ulidx';
import { ExpenseSchema } from '../types/expense.dto';
import ExpenseIcon from "@mui/icons-material/AttachMoneyRounded";
import { CoverageList } from '../components/CoverageList';

export const EditCategoryPage: React.FC = () => {
  const { get, save } = useTable<CategorySchema>({ tableName: TableNames.CATEGORIES });
  const { id } = useParams();
  const [category, setCategory] = React.useState<CategorySchema | null>(null);
  const { setTitle } = useAppContext();
  const theme = useTheme();
  const navigate = useNavigate();
  const { create: createExpense } = useTable<ExpenseSchema>({ tableName: TableNames.EXPENSES });

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

  const onAddExpense = async () => {
    // TODO: Use an edit dialog instead of creating a new expense
    createExpense({
      id: ulid(),
      name: 'New Expense',
      months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      amount: 0,
      personId: '',
      categoryId: id!,
      type: TableNames.EXPENSES,
    });
  };

  return <Stack spacing={2}>
    <TextField fullWidth label="Name" value={category.name} onChange={(event) => setCategory(value => ({ ...value!, name: event.target.value }))} />

    <FormControlLabel control={<Switch checked={category?.isInNetwork} onChange={(event) => setCategory(value => ({ ...value!, isInNetwork: event.target.checked }))} />} label="In-Network" />

    <Stack>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandCircleDownRounded />}>Expenses</AccordionSummary>
        <AccordionDetails>
          <ExpenseList categoryId={category.id!} />
        </AccordionDetails>
      </Accordion>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandCircleDownRounded />}>Coverages</AccordionSummary>
        <AccordionDetails>
          <CoverageList categoryId={category.id} />
        </AccordionDetails>
      </Accordion>
    </Stack>

    <Stack spacing={2} sx={{ position: 'fixed', bottom: theme.spacing(2), right: theme.spacing(2), alignItems: 'center' }}>
      <Fab size='small' onClick={onAddExpense}>
        <ExpenseIcon />
      </Fab>
      <Fab onClick={onSave}>
        <SaveIcon />
      </Fab>
    </Stack>
  </Stack>;
}
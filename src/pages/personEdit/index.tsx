import { Accordion, AccordionDetails, AccordionSummary, Fab, LinearProgress, Stack, TextField, Typography, useTheme } from '@mui/material';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../../providers/state';
import { PersonSchema } from '../../types/person.dto';

import ExpenseIcon from "@mui/icons-material/AttachMoneyRounded";
import SaveIcon from "@mui/icons-material/SaveRounded";
import { ulid } from 'ulidx';
import { useTable } from '../../hooks/table';
import { TableNames } from '../../providers/db';
import { ExpenseSchema } from '../../types/expense.dto';
import { ExpenseList } from './expenseList';
import { ExpandCircleDownRounded } from '@mui/icons-material';



export const EditPersonPage: React.FC = () => {
  const { get, save } = useTable<PersonSchema>({ tableName: TableNames.PEOPLE });
  const { personId } = useParams();
  const { create: createExpense } = useTable<ExpenseSchema>({ tableName: TableNames.EXPENSES });

  const [person, setPerson] = React.useState<PersonSchema | null>(null);
  const { setTitle } = useAppContext();
  const theme = useTheme();
  const navigate = useNavigate();

  React.useEffect(() => {
    setTitle('Edit Person');
  }, [setTitle]);

  React.useEffect(() => {
    if (!personId) return;

    get(personId)
      .then(person => setPerson(person));
  }, [get, personId]);

  if (!person) {
    return <Stack spacing={2}>
      <Typography variant="h6">Loading...</Typography>
      <LinearProgress />
    </Stack>;
  }

  const onSave = async () => {
    await save(person);
    navigate('/person');
  };

  const onAddExpense = async () => {
    // TODO: Use an edit dialog instead of creating a new expense
    createExpense({
      id: ulid(),
      name: 'New Expense',
      months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      amount: 0,
      personId: personId!,
      categoryId: '',
    });
  };

  return <Stack spacing={2}>
    <TextField fullWidth label="Name" value={person?.name} onChange={(event) => setPerson(person => ({ ...person, name: event.target.value }))} />

    <Accordion>
      <AccordionSummary expandIcon={<ExpandCircleDownRounded />}>Expenses</AccordionSummary>
      <AccordionDetails>
        <ExpenseList personId={personId!} />
      </AccordionDetails>
    </Accordion>

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
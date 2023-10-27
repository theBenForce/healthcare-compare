import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PersonSchema } from '../types/person.dto';
import { Card, CardHeader, Fab, LinearProgress, Stack, TextField, Typography, useTheme } from '@mui/material';
import { useAppContext } from '../providers/state';

import SaveIcon from "@mui/icons-material/SaveRounded";
import ExpenseIcon from "@mui/icons-material/AttachMoneyRounded";
import { useTable } from '../hooks/table';
import { TableNames } from '../providers/db';
import { ExpenseSchema } from '../types/expense.dto';
import { ulid } from 'ulidx';

const ExpenseList: React.FC<{ personId: string }> = ({ personId }) => {
  const { values } = useTable<ExpenseSchema>({ tableName: TableNames.EXPENSES, filter: { field: 'personId', value: personId! } });

  return <>
    <Typography variant="h6">Expenses</Typography>
    <Stack spacing={2}>
      {values.map(expense => <Card key={expense.id}>
        <CardHeader title={expense.name} />
      </Card>)}
    </Stack>
  </>
};

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

    <ExpenseList personId={personId!} />

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
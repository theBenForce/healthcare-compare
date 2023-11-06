import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../../providers/state';
import { PersonSchema } from '../../types/person.dto';

import ExpenseIcon from "@mui/icons-material/AttachMoneyRounded";
import SaveIcon from "@mui/icons-material/SaveRounded";
import { useTable } from '../../hooks/table';
import { ExpenseSchema } from '../../types/expense.dto';
import { ExpenseList } from './expenseList';
import { ExpandCircleDownRounded } from '@mui/icons-material';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import useTheme from '@mui/material/styles/useTheme';
import TextField from '@mui/material/TextField';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Fab from '@mui/material/Fab';



export const EditPersonPage: React.FC = () => {
  const { get, save } = useTable<PersonSchema>({ tableName: 'person' });
  const { personId } = useParams();
  const { save: saveExpense } = useTable<ExpenseSchema>({ tableName: 'expense' });

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
    saveExpense(ExpenseSchema.parse({
      name: 'New Expense',
      personId: personId!,
    }));
  };

  return <Stack spacing={2}>
    <TextField fullWidth label="Name" value={person?.name} onChange={(event) => setPerson(person => ({ ...person!, name: event.target.value }))} />

    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandCircleDownRounded />}>Expenses</AccordionSummary>
      <AccordionDetails>
        <ExpenseList personId={personId!} />
      </AccordionDetails>
    </Accordion>

    <Stack spacing={2} sx={{ position: 'fixed', bottom: theme.spacing(2), right: theme.spacing(2), alignItems: 'center' }}>
      <Fab color='secondary' size='small' onClick={onAddExpense}>
        <ExpenseIcon />
      </Fab>
      <Fab color='primary' onClick={onSave}>
        <SaveIcon />
      </Fab>
    </Stack>
  </Stack>;
}

export default EditPersonPage;
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../providers/state';

import { ExpandCircleDownRounded } from '@mui/icons-material';
import ExpenseIcon from "@mui/icons-material/AttachMoneyRounded";
import SaveIcon from "@mui/icons-material/SaveRounded";
import { CoverageList } from '../components/CoverageList';
import { useTable } from '../hooks/table';
import { CategorySchema } from '../types/category.dto';
import { ExpenseSchema } from '../types/expense.dto';
import { ExpenseList } from './personEdit/expenseList';

import { useTranslation } from 'react-i18next';
import useTheme from '@mui/material/styles/useTheme';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import TextField from '@mui/material/TextField';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Fab from '@mui/material/Fab';

export const EditCategoryPage: React.FC = () => {
  const { get, save } = useTable<CategorySchema>({ tableName: 'category' });
  const { id } = useParams();
  const [category, setCategory] = React.useState<CategorySchema | null>(null);
  const { setTitle } = useAppContext();
  const theme = useTheme();
  const navigate = useNavigate();
  const { save: saveExpense } = useTable<ExpenseSchema>({ tableName: 'expense' });
  const { t } = useTranslation();

  React.useEffect(() => {
    setTitle(t('editCategory.title'));
  }, [setTitle, t]);

  React.useEffect(() => {
    if (!id) return;

    get(id)
      .then(person => setCategory(person));
  }, [get, id]);

  if (!category) {
    return <Stack spacing={2}>
      <Typography variant="h6">{`${t('loading')}...`}</Typography>
      <LinearProgress />
    </Stack>;
  }

  const onSave = async () => {
    await save(category);
    navigate('/category');
  };

  const onAddExpense = async () => {
    // TODO: Use an edit dialog instead of creating a new expense
    saveExpense(ExpenseSchema.parse({
      name: 'New Expense',
      categoryId: id!,
    }));
  };

  return <Stack spacing={2}>
    <TextField fullWidth label="Name" value={category.name} onChange={(event) => setCategory(value => ({ ...value!, name: event.target.value }))} />
    <TextField fullWidth label="Description" value={category.description} onChange={(event) => setCategory(value => ({ ...value!, description: event.target.value }))} />

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
      <Fab color='secondary' size='small' onClick={onAddExpense}>
        <ExpenseIcon />
      </Fab>
      <Fab color='primary' onClick={onSave}>
        <SaveIcon />
      </Fab>
    </Stack>
  </Stack>;
}

export default EditCategoryPage;
import React from 'react';

import { useTable } from '../../hooks/table';
import { TableNames } from '../../providers/db';
import Dialog from '@mui/material/Dialog';
import { ExpenseSchema } from '../../types/expense.dto';
import { Autocomplete, Button, DialogActions, DialogContent, DialogTitle, InputAdornment, Stack, TextField } from '@mui/material';
import { MonthSelector } from '../MonthSelector';


interface EditExpenseDialogProps {
  expense?: ExpenseSchema | null;
  onClose: () => void;
}

export const EditExpenseDialog: React.FC<EditExpenseDialogProps> = ({ expense: initialExpense, onClose }) => {
  const [expense, setExpense] = React.useState<ExpenseSchema | null>(null);
  const { values: categories } = useTable({ tableName: TableNames.CATEGORIES });
  const { save } = useTable<ExpenseSchema>({ tableName: TableNames.EXPENSES });

  React.useEffect(() => {
    setExpense(initialExpense ?? null);
  }, [initialExpense]);
  if (!expense) return null;

  const onSave = async () => {
    console.info(`Saving expense`, expense);
    await save(expense);
    onClose();
  };

  return <Dialog open={Boolean(expense)} onClose={onClose} maxWidth='md' fullWidth>
    <DialogTitle>{expense?.name}</DialogTitle>
    <DialogContent>
      <Stack spacing={2} sx={{ my: 2 }}>
        <TextField label="Name" value={expense?.name} onChange={(event) => setExpense(value => ({ ...value, name: event.target.value }))} />
        <Autocomplete
          renderInput={(params) => <TextField {...params} label="Category" />}
          value={expense?.categoryId}
          options={categories.map(x => x.id)}
          getOptionLabel={categoryId => categories.find(x => x.id === categoryId)?.name ?? ''}
          onChange={(event, categoryId) => setExpense(value => ({ ...value, categoryId: categoryId ?? '' }))} />
        <TextField
          label="Amount"
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
          value={expense?.amount}
          type='number'
          onChange={(event) => setExpense(value => ({ ...value, amount: Number(event.target.value) }))}
        />
        <MonthSelector value={expense.months} onChange={months => setExpense(expense => ({ ...expense, months }))} />
      </Stack>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button onClick={onSave} variant='contained'>Save</Button>
    </DialogActions>
  </Dialog>;
};
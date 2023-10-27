import { Card, CardActions, CardHeader, IconButton, Stack, Typography } from '@mui/material';
import React from 'react';

import { useTable } from '../../hooks/table';
import { TableNames } from '../../providers/db';
import { ExpenseSchema } from '../../types/expense.dto';
import { EditExpenseDialog } from '../../components/dialog/editExpense';
import EditIcon from '@mui/icons-material/EditRounded';


export const ExpenseList: React.FC<{ personId: string }> = ({ personId }) => {
  const { values } = useTable<ExpenseSchema>({ tableName: TableNames.EXPENSES, filter: { field: 'personId', value: personId! } });
  const [selectedExpense, setSelectedExpense] = React.useState<ExpenseSchema | null>(null);

  return <>
    <Typography variant="h6">Expenses</Typography>
    <Stack spacing={2}>
      {values.map(expense => <Card key={expense.id}>
        <CardHeader title={expense.name} />
        <CardActions>
          <IconButton onClick={() => setSelectedExpense(expense)}>
            <EditIcon />
          </IconButton>
        </CardActions>
      </Card>)}
    </Stack>

    <EditExpenseDialog expense={selectedExpense} onClose={() => setSelectedExpense(null)} />
  </>
};
import { Accordion, AccordionSummary, Avatar, Card, CardActions, CardContent, CardHeader, Chip, IconButton, Stack, Typography } from '@mui/material';
import React from 'react';
import Grid from '@mui/material/Unstable_Grid2';

import { useTable } from '../../hooks/table';
import { TableNames } from '../../providers/db';
import { ExpenseSchema } from '../../types/expense.dto';
import { EditExpenseDialog } from '../../components/dialog/editExpense';
import EditIcon from '@mui/icons-material/EditRounded';
import DeleteIcon from '@mui/icons-material/DeleteRounded';


export const ExpenseList: React.FC<{ personId: string }> = ({ personId }) => {
  const { values, remove } = useTable<ExpenseSchema>({ tableName: TableNames.EXPENSES, filter: { field: 'personId', value: personId! } });
  const { values: categories } = useTable({ tableName: TableNames.CATEGORIES });
  const [selectedExpense, setSelectedExpense] = React.useState<string | null>(null);

  const onDelete = (expenseId: string) => () => {
    remove(expenseId);
  };

  return <><Grid container spacing={2}>
    {values.map(expense => {
      const totalCost = expense.months.length * expense.amount;
      const categoryName = categories.find(x => x.id === expense.categoryId)?.name ?? 'Unknown';

      return <Grid key={expense.id} xs={3}><Card>
        <CardHeader
          title={expense.name}
          subheader={`Total Cost: $${totalCost.toFixed(2)}`} />
        <CardContent>
          <Chip label={categoryName} />
        </CardContent>
        <CardActions>
          <IconButton onClick={() => setSelectedExpense(expense.id)}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={onDelete(expense.id)}>
            <DeleteIcon />
          </IconButton>
        </CardActions>
      </Card>
      </Grid>;
    })}
  </Grid>

    <EditExpenseDialog expenseId={selectedExpense} onClose={() => setSelectedExpense(null)} />
  </>
};
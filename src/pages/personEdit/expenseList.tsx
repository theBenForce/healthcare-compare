import { Card, CardActions, CardContent, CardHeader, Chip, IconButton } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import React from 'react';

import DeleteIcon from '@mui/icons-material/DeleteRounded';
import EditIcon from '@mui/icons-material/EditRounded';
import { EditExpenseDialog } from '../../components/dialog/editExpense';
import { useTable } from '../../hooks/table';
import { TableNames } from '../../providers/db';
import { ExpenseSchema } from '../../types/expense.dto';


export const ExpenseList: React.FC<{ personId?: string; categoryId?: string }> = ({ personId, categoryId }) => {
  const { values, remove } = useTable<ExpenseSchema>({ tableName: TableNames.EXPENSES, filter: { personId, categoryId } });
  const { values: categories } = useTable({ tableName: TableNames.CATEGORIES });
  const { values: people } = useTable({ tableName: TableNames.PEOPLE });
  const [selectedExpense, setSelectedExpense] = React.useState<string | null>(null);

  const onDelete = (expenseId: string) => () => {
    remove(expenseId);
  };

  return <><Grid container spacing={2}>
    {values.map(expense => {
      const totalCost = expense.months.length * expense.amount;
      const categoryName = categories.find(x => x.id === expense.categoryId)?.name ?? 'Unknown';
      const personName = people.find(x => x.id === expense.personId)?.name ?? 'Unknown';

      return <Grid key={expense.id} xs={3}><Card>
        <CardHeader
          title={expense.name}
          subheader={`Total Cost: $${totalCost.toFixed(2)}`} />
        <CardContent>
          {personId && <Chip label={categoryName} />}
          {categoryId && <Chip label={personName} />}
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

    <EditExpenseDialog
      personId={personId}
      categoryId={categoryId}
      expenseId={selectedExpense}
      onClose={() => setSelectedExpense(null)} />
  </>
};
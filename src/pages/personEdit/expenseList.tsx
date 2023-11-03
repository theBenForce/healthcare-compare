import Grid from '@mui/material/Unstable_Grid2';
import React from 'react';

import DeleteIcon from '@mui/icons-material/DeleteRounded';
import EditIcon from '@mui/icons-material/EditRounded';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import { useNavigate } from 'react-router-dom';
import { EditExpenseDialog } from '../../components/dialog/editExpense';
import { useTable } from '../../hooks/table';
import { TableNames } from '../../providers/db';
import { CategorySchema } from '../../types/category.dto';
import { ExpenseSchema } from '../../types/expense.dto';
import { PersonSchema } from '../../types/person.dto';


export const ExpenseList: React.FC<{ personId?: string; categoryId?: string }> = ({ personId, categoryId }) => {
  const { values, remove } = useTable<ExpenseSchema>({ tableName: TableNames.EXPENSES, filter: { personId, categoryId } });
  const { values: categories } = useTable<CategorySchema>({ tableName: TableNames.CATEGORIES });
  const { values: people } = useTable<PersonSchema>({ tableName: TableNames.PEOPLE });
  const [selectedExpense, setSelectedExpense] = React.useState<string | null>(null);
  const navigate = useNavigate();

  const onDelete = (expenseId: string) => () => {
    remove(expenseId);
  };

  return <><Grid container spacing={2}>
    {values.map(expense => {
      const totalCost = expense.months.length * expense.amount;
      const category = categories.find(x => x.id === expense.categoryId);
      const person = people.find(x => x.id === expense.personId);

      return <Grid key={expense.id} xs={3}><Card>
        <CardHeader
          title={expense.name}
          subheader={`Total Cost: $${totalCost.toFixed(2)}`} />
        <CardContent>
          {personId && <Chip clickable onClick={() => navigate(`/category/${category?.id}`)} label={category?.name ?? 'Unknown'} />}
          {categoryId && <Chip clickable onClick={() => navigate(`/person/${person?.id}`)} label={person?.name ?? 'Unknown'} />}
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
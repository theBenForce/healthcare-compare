import DeleteIcon from '@mui/icons-material/DeleteRounded';
import EditIcon from '@mui/icons-material/EditRounded';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Unstable_Grid2';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTable } from '../hooks/table';
import { CategorySchema, isCategorySchema } from '../types/category.dto';
import { AllDbTypes, isBaseEntity } from '../types/db.dto';
import { ExpenseSchema } from '../types/expense.dto';
import { PersonSchema, isPersonSchema } from '../types/person.dto';
import { PlanSchema, isPlanSchema } from '../types/plan.dto';
import { TableNames } from '../types/base.dto';

interface EntityCardParams {
  table: TableNames;
  entityId: string;
}

const PlanOverview: React.FC<{ plan: PlanSchema }> = ({ plan }) => {
  const totalPremiums = plan.monthlyPremium * 12;
  const oom = plan.isFamilyPlan ? plan.inNetworkLimt.familyOutOfPocketMax : plan.inNetworkLimt.outOfPocketMax;
  const discount = plan.discount ?? 0;
  const maxCost = totalPremiums + oom - discount;

  return <Paper elevation={0} sx={{ flexWrap: 'wrap' }}>
    <Chip label={`Network Max Total: ${maxCost.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`} />
  </Paper>;
};

const CategoryOverview: React.FC<{ category: CategorySchema }> = ({ category }) => {
  const { values: expenses } = useTable<ExpenseSchema>({ tableName: 'expense', filter: { categoryId: category.id } });

  const total = expenses.reduce((acc, expense) => acc + expense.amount, 0);

  return <Paper elevation={0} sx={{ flexWrap: 'wrap' }}>
    <Chip label={`Expenses: ${total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`} />
  </Paper>;
};

const usePersonExpenses = (personId: string) => {
  const { values: expenses } = useTable<ExpenseSchema>({ tableName: 'expense', filter: { personId } });

  const total = React.useMemo(() => expenses.reduce((acc, expense) => acc + expense.amount, 0), [expenses]);

  return { total, expenses };
}

const PersonOverview: React.FC<{ person: PersonSchema }> = ({ person }) => {
  const { total } = usePersonExpenses(person.id);

  return <Paper elevation={0} sx={{ flexWrap: 'wrap' }}>
    <Chip label={`Expenses: ${total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`} />
  </Paper>;
};

const useEntity = (table: TableNames, entityId: string) => {
  const { get } = useTable<AllDbTypes>({ tableName: table });
  const [value, setValue] = React.useState<AllDbTypes | null>(null);

  React.useEffect(() => {
    if (!entityId) return;


    get(entityId).then(setValue);
  }, [get, entityId]);

  return { value };
};

export const EntityCard: React.FC<EntityCardParams> = ({ table, entityId }) => {
  const { remove } = useTable<AllDbTypes>({ tableName: table });
  const navigate = useNavigate();
  const { value } = useEntity(table, entityId);

  const onDelete = (id: string) => {
    remove(id);
  }

  return <Grid xs={12} sm={6} md={4} lg={3}>
    <Card>
      {value && isBaseEntity(value) && <CardHeader
        title={value?.name ?? 'Loading...'}
        subheader={value?.description} />}
      <CardContent>
        {isPlanSchema(value) && <PlanOverview plan={value} />}
        {isCategorySchema(value) && <CategoryOverview category={value} />}
        {isPersonSchema(value) && <PersonOverview person={value} />}
      </CardContent>
      <CardActions>
        <IconButton onClick={() => navigate(`/${table}/${entityId}`)}>
          <EditIcon />
        </IconButton>
        <IconButton onClick={() => onDelete(entityId)}>
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>
  </Grid>;
}
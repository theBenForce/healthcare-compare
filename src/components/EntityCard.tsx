import React from 'react';
import { TableNames } from '../providers/db';
import Grid from '@mui/material/Unstable_Grid2';
import { useTable } from '../hooks/table';
import { useNavigate } from 'react-router-dom';
import { BaseSchema } from '../types/base.dto';
import CardHeader from '@mui/material/CardHeader';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { PlanSchema, isPlanSchema } from '../types/plan.dto';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import CardActions from '@mui/material/CardActions';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/EditRounded';
import DeleteIcon from '@mui/icons-material/DeleteRounded';
import { CategorySchema, isCategorySchema } from '../types/category.dto';
import { ExpenseSchema } from '../types/expense.dto';
import { PersonSchema, isPersonSchema } from '../types/person.dto';

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
  const { values: expenses } = useTable<ExpenseSchema>({ tableName: TableNames.EXPENSES, filter: { categoryId: category.id } });

  const total = expenses.reduce((acc, expense) => acc + expense.amount, 0);

  return <Paper elevation={0} sx={{ flexWrap: 'wrap' }}>
    <Chip label={`Expenses: ${total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`} />
    <Chip label={category.isInNetwork ? 'In Network' : 'Out of Network'} color='secondary' />
  </Paper>;
};

const PersonOverview: React.FC<{ person: PersonSchema }> = ({ person }) => {
  const { values: expenses } = useTable<ExpenseSchema>({ tableName: TableNames.EXPENSES, filter: { personId: person.id } });

  const total = expenses.reduce((acc, expense) => acc + expense.amount, 0);

  return <Paper elevation={0} sx={{ flexWrap: 'wrap' }}>
    <Chip label={`Expenses: ${total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`} />
  </Paper>;
};

export const EntityCard: React.FC<EntityCardParams> = ({ table, entityId }) => {
  const { get, remove } = useTable({ tableName: table });
  const [value, setValue] = React.useState<BaseSchema | null>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!entityId) return;

    get(entityId).then(setValue);
  }, [get, entityId]);

  const overview = React.useMemo(() => {
    if (isPlanSchema(value)) {
      return <PlanOverview plan={value} />;
    } else if (isCategorySchema(value)) {
      return <CategoryOverview category={value} />;
    } else if (isPersonSchema(value)) {
      return <PersonOverview person={value} />;
    }

    return null;
  }, [value]);


  const onDelete = (id: string) => {
    remove(id);
  }

  return <Grid xs={12} md={6} lg={4} xl={3}><Card>
    <CardHeader
      title={value?.name ?? 'Loading...'}
      subheader={value?.description} />
    {overview && <CardContent>
      {overview}
    </CardContent>}
    <CardActions>
      <IconButton onClick={() => navigate(`/${table}/${entityId}`)}>
        <EditIcon />
      </IconButton>
      <IconButton onClick={() => onDelete(entityId)}>
        <DeleteIcon />
      </IconButton>
    </CardActions>
  </Card></Grid>;
}
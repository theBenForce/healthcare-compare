import { Card, CardActions, CardHeader, IconButton, Stack, useTheme } from '@mui/material';
import React from 'react';

import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/AddRounded';
import EditIcon from '@mui/icons-material/EditRounded';
import DeleteIcon from '@mui/icons-material/DeleteRounded';
import { usePlans } from '../providers/plans';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../providers/state';


export const PlanListPage: React.FC = () => {
  const theme = useTheme();
  const { plans, create: createPlan, remove: removePlan } = usePlans();
  const navigate = useNavigate();
  const { setTitle } = useAppContext();

  React.useEffect(() => {
    setTitle('Plans');
  }, [setTitle]);

  const onCreatePlan = () => {
    const planId = createPlan();
    navigate(`/plan/${planId}`);
  };

  const onDeletePlan = (planId: string) => {
    removePlan(planId);
  };

  return (
    <Stack spacing={2}>
      {plans.map((plan) => (<Card key={plan.id}>
        <CardHeader title={plan.name} subheader={plan.description} />
        <CardActions>
          <IconButton onClick={() => navigate(`/plan/${plan.id}`)}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => onDeletePlan(plan.id)}>
            <DeleteIcon />
          </IconButton>
        </CardActions>
      </Card>))}

      <Fab onClick={onCreatePlan} sx={{ position: 'fixed', bottom: theme.spacing(2), right: theme.spacing(2) }}>
        <AddIcon />
      </Fab>
    </Stack>
  );
};
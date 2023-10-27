/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from "react";
import { PlanSchema } from "../types/plan.dto";
import { useAppContext } from "../providers/state";
import { useNavigate, useParams } from "react-router-dom";
import SaveIcon from "@mui/icons-material/SaveRounded";
import { Accordion, AccordionDetails, AccordionSummary, Fab, FormControlLabel, LinearProgress, Stack, Switch, TextField, Typography, useTheme } from "@mui/material";
import { ExpandCircleDownRounded } from "@mui/icons-material";
import { useTable } from "../hooks/table";
import { TableNames } from "../providers/db";

export const EditPlanPage: React.FC = () => {
  const { setTitle } = useAppContext();
  const [plan, setPlan] = React.useState<PlanSchema | null>(null);
  const { get: getPlan, save: savePlan } = useTable<PlanSchema>({ tableName: TableNames.PLANS });
  const { planId } = useParams();
  const theme = useTheme();
  const navigate = useNavigate();

  React.useEffect(() => {
    setTitle('Edit Plan');
  }, [setTitle]);

  React.useEffect(() => {
    if (!planId) return;
    getPlan(planId)
      .then(plan => setPlan(plan));
  }, [planId, getPlan]);

  const onSave = () => {
    savePlan(plan!);
    navigate('/plan');
  };

  if (!plan) {
    return <Stack spacing={2}>
      <Typography variant="h6">Loading...</Typography>
      <LinearProgress />
    </Stack>;
  }

  return <Stack spacing={2}>
    <TextField fullWidth label="Name" value={plan?.name} onChange={(event) => setPlan(plan => ({ ...plan, name: event.target.value }))} />

    <TextField fullWidth label="Description" value={plan?.description} onChange={(event) => setPlan(plan => ({ ...plan, description: event.target.value }))} />
    <TextField fullWidth label="Monthly Premium" type="number" value={plan?.premium} onChange={(event) => setPlan(plan => ({ ...plan, premium: Number(event.target.value) }))} />
    <TextField fullWidth label="Discount" type="number" value={plan?.discount} onChange={(event) => setPlan(plan => ({ ...plan, discount: Number(event.target.value) }))} />

    <FormControlLabel control={<Switch checked={plan?.isFamilyPlan} onChange={(event) => setPlan(plan => ({ ...plan, isFamilyPlan: event.target.checked }))} />} label="Family Plan" />


    <Typography variant="h6">Limits</Typography>
    <Accordion>
      <AccordionSummary expandIcon={<ExpandCircleDownRounded />}>In-Network</AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2}>
            <TextField sx={{ flex: 1 }} type="number" label="Deductible" value={plan?.deductible} onChange={(event) => setPlan(plan => ({ ...plan, deductible: Number(event.target.value) }))} />
            {plan?.isFamilyPlan && <TextField sx={{ flex: 1 }} type="number" label="Family Deductible" value={plan?.familyDeductible} onChange={(event) => setPlan(plan => ({ ...plan, familyDeductible: Number(event.target.value) }))} />}
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField sx={{ flex: 1 }} type="number" label="Out of Pocket Max" value={plan?.outOfPocketMax} onChange={(event) => setPlan(plan => ({ ...plan, outOfPocketMax: Number(event.target.value) }))} />
            {plan?.isFamilyPlan && <TextField sx={{ flex: 1 }} type="number" label="Family Out of Pocket Max" value={plan?.familyOutOfPocketMax} onChange={(event) => setPlan(plan => ({ ...plan, familyOutOfPocketMax: Number(event.target.value) }))} />}
          </Stack>
        </Stack>
      </AccordionDetails>
    </Accordion>

    <Typography variant="h6">Coverages</Typography>


    <Fab onClick={onSave} sx={{ position: 'fixed', bottom: theme.spacing(2), right: theme.spacing(2) }}>
      <SaveIcon />
    </Fab>
  </Stack>
};
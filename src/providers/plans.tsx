import React from "react";
import { PlanSchema } from "../types/plan.dto";
import { useDB } from "./db";
import { ulid } from "ulidx";

interface PlansContextInterface {
  plans: PlanSchema[];
  create: () => string;
  get: (planId: string) => PlanSchema | null;
  save: (plan: PlanSchema) => void;
  remove: (planId: string) => void;
}

const PlansContext = React.createContext<PlansContextInterface>({
  plans: [],
  create: () => '',
  get: () => null,
  save: () => { },
  remove: () => { },
});

export const usePlans = () => React.useContext(PlansContext);

export const WithPlans = ({ children }: { children: React.ReactNode }) => {
  const [plans, setPlans] = React.useState<PlanSchema[]>([]);
  const { db, saveDb } = useDB();

  const savePlans = (plans: PlanSchema[]) => {
    setPlans(plans);
    saveDb({ ...db, plans });
  };

  const create = () => {
    const planId = ulid();

    const newPlan = {
      id: planId,
      name: 'New Plan',
      description: '',
      premium: 0,
      discount: 0,
      coverages: [],
    } as PlanSchema;

    savePlans([...plans, newPlan]);

    return planId;
  };

  const remove = (planId: string) => {
    const planIndex = plans.findIndex((plan) => plan.id === planId);
    if (planIndex === -1) return;
    plans.splice(planIndex, 1);
    savePlans([...plans]);
  };

  const get = (planId: string) => plans.find((plan) => plan.id === planId) || null;
  const save = (plan: PlanSchema) => {
    const planIndex = plans.findIndex((p) => p.id === plan.id);
    if (planIndex === -1) {
      plans.push(plan);
    } else {
      plans[planIndex] = plan;
    }
    savePlans([...plans]);
  }

  React.useEffect(() => {
    setPlans(db.plans);
  }, [db]);

  return (
    <PlansContext.Provider value={{ plans, create, get, save, remove }}>
      {children}
    </PlansContext.Provider>
  );
}
import React from "react";
import { PlanSchema } from "../types/plan.dto";
import { useDB } from "./db";
import { ulid } from "ulidx";

interface PlansContextInterface {
  list: () => Promise<PlanSchema[]>;
  create: () => Promise<string>;
  get: (planId: string) => Promise<PlanSchema | null>;
  save: (plan: PlanSchema) => Promise<void>;
  remove: (planId: string) => Promise<void>;
  plans: PlanSchema[];
}

const PlansContext = React.createContext<PlansContextInterface>({
  list: async () => [],
  create: async () => '',
  get: async () => null,
  save: async () => { },
  remove: async () => { },
  plans: [],
});

export const usePlans = () => React.useContext(PlansContext);

export const WithPlans = ({ children }: { children: React.ReactNode }) => {
  const { db } = useDB();
  const [plans, setPlans] = React.useState<PlanSchema[]>([]);

  const list = React.useCallback(async () => {
    const result = (await db?.getAll('plans')) ?? [];
    setPlans(result);
    return result as Array<PlanSchema>;
  }, [db]);

  const create = async () => {
    const planId = ulid();

    const newPlan = {
      id: planId,
      name: 'New Plan',
      description: '',
      premium: 0,
      discount: 0,
      coverages: [],
      isFamilyPlan: false,
      outOfPocketMax: 0,
      familyOutOfPocketMax: 0,
      deductible: 0,
      familyDeductible: 0,
    } as PlanSchema;

    await db?.add('plans', newPlan);

    await list();

    return planId;
  };

  const remove = React.useCallback(async (planId: string) => {
    await db?.delete('plans', planId);
    await list();
  }, [db, list]);

  const get = React.useCallback(async (planId: string) => db?.get('plans', planId), [db]);
  const save = React.useCallback(async (plan: PlanSchema) => { await db?.put('plans', plan); await list(); }, [db, list]);

  React.useEffect(() => {
    list();
  }, [list]);

  return (
    <PlansContext.Provider value={{ list, create, get, save, remove, plans }}>
      {children}
    </PlansContext.Provider>
  );
}
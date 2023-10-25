import React from "react";
import { PlanSchema } from "../types/plan.dto";
import { useDB } from "./db";

interface PlansContextInterface {
  plans: PlanSchema[];
  savePlans: (plans: PlanSchema[]) => void;
}

const PlansContext = React.createContext<PlansContextInterface>({
  plans: [],
  savePlans: () => { },
});

export const usePlans = () => React.useContext(PlansContext);

export const WithPlans = ({ children }: { children: React.ReactNode }) => {
  const [plans, setPlans] = React.useState<PlanSchema[]>([]);
  const { db, setDB } = useDB();

  const savePlans = (plans: PlanSchema[]) => {
    setPlans(plans);
    setDB((db) => ({ ...db, plans }));
  };

  React.useEffect(() => {
    setPlans(db.plans);
  }, [db]);

  return (
    <PlansContext.Provider value={{ plans, savePlans }}>
      {children}
    </PlansContext.Provider>
  );
}
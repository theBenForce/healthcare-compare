import React from "react";
import { CostReport } from "../types/costReport.dto";
import { useTable } from "./table";
import { PlanSchema } from "../types/plan.dto";
import { PersonSchema } from "../types/person.dto";
import { ExpenseSchema } from "../types/expense.dto";
import { CoverageSchema } from "../types/coverage.dto";

export const useCostReport = (): CostReport => {
  const [report, setReport] = React.useState<CostReport>([]);
  const { list: listPlans } = useTable<PlanSchema>({ tableName: 'plan' });
  const { list: listPeople } = useTable<PersonSchema>({ tableName: 'person' });
  const { list: listCoverages } = useTable<CoverageSchema>({ tableName: 'coverage' });
  const {list: listExpenses} = useTable<ExpenseSchema>({tableName: 'expense'});

  React.useEffect(() => {
    listPlans().then(async (plans) => {
      const result: CostReport = [];
      for (const plan of plans) {
        const coverages = await listCoverages({planId: plan.id});
        const monthlyExpenses: Array<Array<ExpenseSchema>> = [];
        const people = await listPeople();
        for (const person of people) {
          const expenses = await listExpenses({ personId: person.id });
          
          for (const expense of expenses) {
            for (const month of expense.months) {
              monthlyExpenses[month] = [...(monthlyExpenses[month] || []), expense];
            }
          }
        }

        let inNetworkCharges = 0;
        const individualInNetworkCharges = Object.fromEntries(people.map(p => [p.id, 0]));
        let outOfNetworkCharges = 0;
        const individualOutOfNetworkCharges = Object.fromEntries(people.map(p => [p.id, 0]));

        monthlyExpenses.flat(1).forEach((expense) => {
          const coverage = coverages.find(c => c.categoryId === expense.categoryId);
          if (!coverage || !expense.personId ) return;

          const pastIndividualDeductible = (coverage.isInNetwork || plan.isCombinedDeductible) ? individualInNetworkCharges[expense.personId] >= plan.inNetworkLimt.deductible : individualOutOfNetworkCharges[expense.personId] >= plan.outOfNetworkLimit.deductible;
          const pastFamilyDeductible = (coverage.isInNetwork || plan.isCombinedDeductible) ? inNetworkCharges >= plan.inNetworkLimt.deductible : outOfNetworkCharges >= plan.outOfNetworkLimit.deductible;

          const coverageValue = (pastIndividualDeductible || pastFamilyDeductible) ?
            coverage.afterDeductible : coverage.beforeDeductible;
          
          let amount = expense.amount;

          if (coverageValue.type === 'percent') {
            amount = amount * (coverageValue.amount / 100);
          } else if (coverageValue.type === 'copay') {
            amount = coverageValue.amount;
          }

          if (coverage.isInNetwork) {
            if (individualInNetworkCharges[expense.personId] + amount > plan.inNetworkLimt.outOfPocketMax) {
              amount = plan.inNetworkLimt.outOfPocketMax - individualInNetworkCharges[expense.personId];
            }

            const outOfPocketMax = plan.isFamilyPlan ? plan.inNetworkLimt.familyOutOfPocketMax : plan.inNetworkLimt.outOfPocketMax;
            if (inNetworkCharges + amount > outOfPocketMax) {
              amount = plan.inNetworkLimt.outOfPocketMax - inNetworkCharges;
            }

            inNetworkCharges += amount;
            individualInNetworkCharges[expense.personId!] += amount;
          } else {
            if(individualOutOfNetworkCharges[expense.personId] + amount > plan.outOfNetworkLimit.outOfPocketMax) {
              amount = plan.outOfNetworkLimit.outOfPocketMax - individualOutOfNetworkCharges[expense.personId];
            }

            const outOfPocketMax = plan.isFamilyPlan ? plan.outOfNetworkLimit.familyOutOfPocketMax : plan.outOfNetworkLimit.outOfPocketMax;
            if (outOfNetworkCharges + amount > outOfPocketMax) {
              amount = plan.outOfNetworkLimit.outOfPocketMax - outOfNetworkCharges;
            }

            outOfNetworkCharges += amount;
          }
        });

        const expenses = Math.min(inNetworkCharges, plan.inNetworkLimt.outOfPocketMax) + Math.min(outOfNetworkCharges, plan.outOfNetworkLimit.outOfPocketMax);
        const discount = plan.discount ?? 0;
        const premiums = plan.monthlyPremium * 12;
        const total = premiums + expenses - discount;
        
        result.push({
          planId: plan.id,
          name: plan.name,
          expenses,
          discount,
          premiums,
          total
        });
      }
      
      result.sort((a, b) => (a.expenses + a.premiums) - (b.expenses + b.premiums));
      setReport(result);
    });
  }, [listPlans, listPeople, listCoverages, listExpenses]);

  return report;
};

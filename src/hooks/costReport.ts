import React from "react";
import { CostReport } from "../types/costReport.dto";
import { useTable } from "./table";
import { TableNames } from "../providers/db";
import { PlanSchema } from "../types/plan.dto";
import { PersonSchema } from "../types/person.dto";
import { ExpenseSchema } from "../types/expense.dto";
import { CoverageSchema } from "../types/coverage.dto";

export const useCostReport = (): CostReport => {
  const [report, setReport] = React.useState<CostReport>([]);
  const { list: listPlans } = useTable<PlanSchema>({ tableName: TableNames.PLANS });
  const { list: listPeople } = useTable<PersonSchema>({ tableName: TableNames.PEOPLE });
  const { list: listCoverages } = useTable<CoverageSchema>({ tableName: TableNames.COVERAGES });
  const {list: listExpenses} = useTable<ExpenseSchema>({tableName: TableNames.EXPENSES});

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
        let outOfNetworkCharges = 0;
        let isPastNetworkDeductible = false;
        let isPastOutOfNetworkDeductible = false;

        monthlyExpenses.flat(1).forEach((expense) => {
          const coverage = coverages.find(c => c.categoryId === expense.categoryId);
          if (!coverage) return;

          const coverageValue = ((coverage.isInNetwork || plan.isCombinedDeductible) ? isPastNetworkDeductible : isPastOutOfNetworkDeductible) ?
            coverage.afterDeductible : coverage.beforeDeductible;
          
          let amount = expense.amount;

          if (coverageValue.type === 'percent') {
            amount = amount * (coverageValue.amount / 100);
          } else if (coverageValue.type === 'copay') {
            amount = coverageValue.amount;
          }

          if(coverage.isInNetwork) {
            inNetworkCharges += amount;
          } else {
            outOfNetworkCharges += amount;
          }

          if (plan.isCombinedDeductible) {
            isPastNetworkDeductible = inNetworkCharges + outOfNetworkCharges >= plan.inNetworkLimt.deductible;
          } else if(coverage.isInNetwork) {
            isPastNetworkDeductible = inNetworkCharges >= plan.inNetworkLimt.deductible;
          } else {
            isPastOutOfNetworkDeductible = outOfNetworkCharges >= plan.outOfNetworkLimit.deductible;
          }
        });

        const totalCost = Math.min(inNetworkCharges, plan.inNetworkLimt.outOfPocketMax) + Math.min(outOfNetworkCharges, plan.outOfNetworkLimit.outOfPocketMax);

        result.push({
          planId: plan.id,
          name: plan.name,
          expenses: totalCost - (plan.discount ?? 0),
          premiums: plan.monthlyPremium * 12,
        });
      }
      
      result.sort((a, b) => (a.expenses + a.premiums) - (b.expenses + b.premiums));
      setReport(result);
    });
  }, [listPlans, listPeople, listCoverages, listExpenses]);

  return report;
};
import React from 'react';
import { useTable } from './table';
import { CoverageSchema } from '../types/coverage.dto';
import { TableNames } from '../providers/db';
import { PlanSchema } from '../types/plan.dto';
import { CategorySchema } from '../types/category.dto';
import { ulid } from 'ulidx';

interface UseCoveragesParams {
  planId?: string;
  categoryId?: string;
}


export const useCoverages = ({planId, categoryId}: UseCoveragesParams) => {
  const [coverages, setCoverages] = React.useState<Array<CoverageSchema>>([]);
  const { values } = useTable<CoverageSchema>({ tableName: TableNames.COVERAGES, filter: { planId, categoryId } });
  const { values: plans } = useTable<PlanSchema>({ tableName: TableNames.PLANS });
  const { values: categories } = useTable<CategorySchema>({ tableName: TableNames.CATEGORIES });
  
  React.useEffect(() => {
    const result = [...values];
    if (planId) {
      const missingCategories = categories.filter(c => !result.find(r => r.categoryId === c.id));
      missingCategories.forEach(c => {
        result.push({
          id: ulid(),
          planId,
          categoryId: c.id,
          beforeDeductible: {
            type: 'copay',
            amount: 0,
          },
          afterDeductible: {
            type: 'copay',
            amount: 0,
          },
          type: TableNames.COVERAGES,
        });
      });
    } else if (categoryId) {
      const missingPlans = plans.filter(p => !result.find(r => r.planId === p.id));
      missingPlans.forEach(p => {
        result.push({
          id: ulid(),
          planId: p.id,
          categoryId,
          beforeDeductible: {
            type: 'copay',
            amount: 0,
          },
          afterDeductible: {
            type: 'copay',
            amount: 0,
          },
          type: TableNames.COVERAGES,
        });
      });
    }

    setCoverages(result);
  }, [planId, categoryId, values, categories, plans]);
  
  return coverages;
}
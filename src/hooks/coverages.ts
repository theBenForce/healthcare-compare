import React from 'react';
import { useTable } from './table';
import { CoverageSchema } from '../types/coverage.dto';
import { TableNames, useDB } from '../providers/db';
import { PlanSchema } from '../types/plan.dto';
import { CategorySchema } from '../types/category.dto';

interface UseCoveragesParams {
  planId?: string;
  categoryId?: string;
}


export const useCoverages = ({planId, categoryId}: UseCoveragesParams) => {
  const [coverages, setCoverages] = React.useState<Array<CoverageSchema>>([]);
  const { values } = useTable<CoverageSchema>({ tableName: TableNames.COVERAGES, filter: { planId, categoryId } });
  const { values: plans } = useTable<PlanSchema>({ tableName: TableNames.PLANS });
  const { values: categories } = useTable<CategorySchema>({ tableName: TableNames.CATEGORIES });
  
  const refresh = React.useCallback(() => {
    console.info(`Refreshing coverages for planId: ${planId} and categoryId: ${categoryId}`);

    const result = [...values];
    if (planId) {
      const missingCategories = categories.filter(c => !result.find(r => r.categoryId === c.id)).map(c => CoverageSchema.parse({
          id: [planId, c.id].join('#'),
          planId,
          categoryId: c.id,
      }));
      result.push(...missingCategories);
    } else if (categoryId) {
      const missingPlans = plans.filter(p => !result.find(r => r.planId === p.id)).map(p => CoverageSchema.parse({
          id: [p.id, categoryId].join('#'),
          planId: p.id,
          categoryId,
      }));
      result.push(...missingPlans);
    }
    
    setCoverages(result);
  }, [planId, categoryId, values, categories, plans]);
  
  React.useEffect(() => {
    if (coverages.length) return;
    refresh();
  }, [planId, categoryId, values, categories, plans, coverages, refresh]);
  
  return {coverages, refresh};
}
import React from 'react';
import { ulid } from 'ulidx';
import { TableNames } from '../providers/db';
import { CategorySchema } from '../types/category.dto';
import { CoverageSchema } from '../types/coverage.dto';
import { PlanSchema } from '../types/plan.dto';
import { useTable } from './table';

interface UseCoveragesParams {
  planId?: string;
  categoryId?: string;
}


export const useCoverages = ({planId, categoryId}: UseCoveragesParams) => {
  const [coverages, setCoverages] = React.useState<Array<CoverageSchema>>([]);
  const { list: listCoverages } = useTable<CoverageSchema>({ tableName: TableNames.COVERAGES, filter: { planId, categoryId } });
  const { list: listPlans } = useTable<PlanSchema>({ tableName: TableNames.PLANS });
  const { list: listCategories } = useTable<CategorySchema>({ tableName: TableNames.CATEGORIES });
  
  const refresh = React.useCallback(async () => {
    console.info(`Refreshing coverages for planId: ${planId} and categoryId: ${categoryId}`);

    const result = await listCoverages();
    if (planId) {
      const categories = await listCategories();
      const missingCategories = categories.filter(c => !result.find(r => r.categoryId === c.id)).map(c => CoverageSchema.parse({
          id: ulid(),
          planId,
          categoryId: c.id,
      }));
      result.push(...missingCategories);
    } else if (categoryId) {
      const plans = await listPlans();
      const missingPlans = plans.filter(p => !result.find(r => r.planId === p.id)).map(p => CoverageSchema.parse({
          id: ulid(),
          planId: p.id,
          categoryId,
      }));
      result.push(...missingPlans);
    }
    
    setCoverages(result);
  }, [planId, categoryId, listCoverages, listCategories, listPlans]);
  
  React.useEffect(() => {
    if (coverages.length) return;
    refresh();
  }, [planId, categoryId, coverages, refresh]);
  
  return {coverages, refresh};
}
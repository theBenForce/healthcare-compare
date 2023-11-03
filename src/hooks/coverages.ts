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
  const { values: savedCoverages } = useTable<CoverageSchema>({ tableName: TableNames.COVERAGES, filter: { planId, categoryId } });
  const { values: plans } = useTable<PlanSchema>({ tableName: TableNames.PLANS });
  const { values: categories } = useTable<CategorySchema>({ tableName: TableNames.CATEGORIES });
  
  React.useEffect(() => {
    const handler = async () => {
      console.info(`Refreshing coverages for planId: ${planId} and categoryId: ${categoryId}`);

      const result = [...savedCoverages];
      if (planId) {
        const missingCategories = categories.filter(c => !result.find(r => r.categoryId === c.id)).map(c => CoverageSchema.parse({
          id: ulid(),
          planId,
          categoryId: c.id,
        }));
        result.push(...missingCategories);
      } else if (categoryId) {
        const missingPlans = plans.filter(p => !result.find(r => r.planId === p.id)).map(p => CoverageSchema.parse({
          id: ulid(),
          planId: p.id,
          categoryId,
        }));
        result.push(...missingPlans);
      }
    
      setCoverages(result);
    };

    handler();
  }, [planId, categoryId, savedCoverages, categories, plans]);
  
  return {coverages};
}
/* eslint-disable @typescript-eslint/ban-ts-comment */
import AddIcon from '@mui/icons-material/AddRounded';
import DeleteIcon from '@mui/icons-material/DeleteRounded';
import EditIcon from '@mui/icons-material/EditRounded';
import Button from '@mui/material/Button';
import { DataGrid, GridActionsCellItem, GridColDef, GridColumnGroupingModel, GridRenderEditCellParams, GridToolbarContainer } from '@mui/x-data-grid';
import React from 'react';
import { useTable } from '../hooks/table';
import { TableNames } from '../providers/db';
import { CoverageSchema } from '../types/coverage.dto';
import { EditCoverageDialog } from './dialog/editCoverage';
import { ulid } from 'ulidx';
import { PlanSchema } from '../types/plan.dto';
import { CategorySchema } from '../types/category.dto';
import { useCoverages } from '../hooks/coverages';

interface CoverageListParams {
  planId?: string;
  categoryId?: string;
}

const columns: GridColDef[] = [
  { field: 'planId', headerName: 'Plan', flex: 3, type: 'singleSelect' },
  { field: 'categoryId', headerName: 'Category', flex: 3, type: 'singleSelect' },
  {
    field: 'beforeDeductible.type', headerName: 'Type', flex: 2, type: 'singleSelect', valueOptions: ['copay', 'percent'], valueGetter(params) {
      return params.row.beforeDeductible.type;
    },
  },
  { field: 'beforeDeductible.amount', headerName: 'Amount', flex: 1, valueGetter(params) { return params.row.beforeDeductible.amount; } },
  { field: 'afterDeductible.type', headerName: 'Type', flex: 2, type: 'singleSelect', valueOptions: ['copay', 'percent'], valueGetter(params) { return params.row.afterDeductible.type; } },
  { field: 'afterDeductible.amount', headerName: 'Amount', flex: 1, valueGetter(params) { return params.row.afterDeductible.amount; } },
];

const columnGroupingModel: GridColumnGroupingModel = [
  {
    groupId: 'Before Deductible',
    children: [{ field: 'beforeDeductible.type' }, { field: 'beforeDeductible.amount' }],
  },
  {
    groupId: 'After Deductible',
    children: [
      { field: 'afterDeductible.type' },
      { field: 'afterDeductible.amount' },
    ],
  },
];

interface EditToolbarProps {
  planId?: string;
  categoryId?: string;
}

const EditToolbar: React.FC<EditToolbarProps> = ({ planId, categoryId }) => {
  const { create } = useTable<CoverageSchema>({ tableName: TableNames.COVERAGES });

  const onCreateCoverage = () => {
    create({
      id: ulid(),
      planId: planId!,
      categoryId: categoryId!,
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
  }

  return (
    <GridToolbarContainer>
      <Button color="primary" startIcon={<AddIcon />} onClick={onCreateCoverage}>
        Add Coverage
      </Button>
    </GridToolbarContainer>
  );
}

export const CoverageList: React.FC<CoverageListParams> = ({ planId, categoryId }) => {
  const { remove, save } = useTable<CoverageSchema>({ tableName: TableNames.COVERAGES });
  const coverages = useCoverages({ planId, categoryId });
  const [editingCoverageId, setEditingCoverageId] = React.useState<string | null>(null);

  const { values: plans } = useTable<PlanSchema>({ tableName: TableNames.PLANS });
  const { values: categories } = useTable<CategorySchema>({ tableName: TableNames.CATEGORIES });

  const onSaveCoverage = React.useCallback(async (value?: CoverageSchema) => {
    if (!value) return;
    await save(value);
    setEditingCoverageId(null);
  }, [save]);

  const columnDefs = React.useMemo(() => {
    let result = columns;
    if (planId) {
      result = result.filter(x => x.field !== 'planId');
    } else if (categoryId) {
      result = result.filter(x => x.field !== 'categoryId');
    }

    const planColumn = result.find(x => x.field === 'planId');
    if (planColumn) {
      planColumn.type = 'singleSelect';
      // @ts-ignore
      planColumn.valueOptions = plans.map(x => x.id);
      planColumn.valueGetter = (params) => {
        const plan = plans.find(x => x.id === params.row.planId);
        return plan?.name ?? 'Unknown';
      };
    }

    const categoryColumn = result.find(x => x.field === 'categoryId');
    if (categoryColumn) {
      categoryColumn.type = 'singleSelect';
      // @ts-ignore
      categoryColumn.valueOptions = categories.map(x => x.id);
      categoryColumn.valueGetter = (params) => {
        const category = categories.find(x => x.id === params.row.categoryId);
        return category?.name ?? 'Unknown';
      };
    }

    result.push({
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      getActions(params) {
        return [
          <GridActionsCellItem icon={<EditIcon />} onClick={() => {
            console.dir({ params });
            return setEditingCoverageId(params.id as string);
          }
          } label="Edit" />,
          <GridActionsCellItem icon={<DeleteIcon />} onClick={() => remove(params.id as string)} label="Delete" />,
        ]
      },
    });

    return result;
  }, [planId, categoryId, plans, categories, remove]);

  return <><DataGrid
    experimentalFeatures={{ columnGrouping: true }}
    rows={coverages}
    columns={columnDefs}
    columnGroupingModel={columnGroupingModel}
    slots={{ toolbar: EditToolbar }}
    slotProps={{ toolbar: { planId, categoryId } }}
  />
    {editingCoverageId && <EditCoverageDialog coverageId={editingCoverageId} planId={planId} categoryId={categoryId} onClose={onSaveCoverage} />}
  </>;
};
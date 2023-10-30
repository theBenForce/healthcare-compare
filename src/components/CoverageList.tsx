/* eslint-disable @typescript-eslint/ban-ts-comment */
import DeleteIcon from '@mui/icons-material/DeleteRounded';
import EditIcon from '@mui/icons-material/EditRounded';
import { DataGrid, GridActionsCellItem, GridColDef, GridColumnGroupingModel } from '@mui/x-data-grid';
import React from 'react';
import { useCoverages } from '../hooks/coverages';
import { useTable } from '../hooks/table';
import { TableNames } from '../providers/db';
import { CategorySchema } from '../types/category.dto';
import { CoverageSchema, CoverageType } from '../types/coverage.dto';
import { PlanSchema } from '../types/plan.dto';
import { EditCoverageDialog } from './dialog/editCoverage';

interface CoverageListParams {
  planId?: string;
  categoryId?: string;
}

const TypeLabels: Record<CoverageType, string> = {
  copay: 'Copay',
  percent: 'Co-Insurance',
};

const TypeColumnProps = {
  headerName: 'Type',
  flex: 2,
  type: 'singleSelect',
  valueOptions: ['copay', 'percent'],
  getOptionLabel: (value: string) => TypeLabels[CoverageType.parse(value)],
  editable: true,
};

const columns: GridColDef[] = [
  { field: 'planId', headerName: 'Plan', flex: 3, type: 'singleSelect', editable: false },
  { field: 'categoryId', headerName: 'Category', flex: 3, type: 'singleSelect', editable: false },
  { field: 'isInNetwork', headerName: 'In Network', flex: 1, type: 'boolean', editable: true },
  {
    ...TypeColumnProps,
    field: 'beforeDeductible.type',
    valueGetter(params) {
      return params.row.beforeDeductible.type;
    },
  },
  { field: 'beforeDeductible.amount', headerName: 'Amount', flex: 1, valueGetter(params) { return params.row.beforeDeductible.amount; }, editable: true },
  {
    ...TypeColumnProps,
    field: 'afterDeductible.type',
    valueGetter(params) { return params.row.afterDeductible.type; },
  },
  { field: 'afterDeductible.amount', headerName: 'Amount', flex: 1, valueGetter(params) { return params.row.afterDeductible.amount; }, editable: true },
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

// interface EditToolbarProps {
//   planId?: string;
//   categoryId?: string;
//   changes: Array<CoverageSchema>;
//   clearChanges: () => void;
// }

// const EditToolbar: React.FC<EditToolbarProps> = ({ changes, clearChanges }) => {
//   const { save } = useTable<CoverageSchema>({ tableName: TableNames.COVERAGES });

//   const onSaveChanges = async () => {
//     console.dir({ changes });
//     await Promise.all(changes.map(async (change) => {
//       await save(change);
//     }));

//     clearChanges();
//   }

//   return (
//     <GridToolbarContainer>
//       <Button color="primary" disabled={changes.length === 0} startIcon={<SaveIcon />} onClick={onSaveChanges}>
//         Save Changes
//       </Button>
//     </GridToolbarContainer>
//   );
// }

export const CoverageList: React.FC<CoverageListParams> = ({ planId, categoryId }) => {
  const { remove, save } = useTable<CoverageSchema>({ tableName: TableNames.COVERAGES });
  const { coverages, refresh } = useCoverages({ planId, categoryId });
  const [editingCoverageId, setEditingCoverageId] = React.useState<string | null>(null);

  const { values: plans } = useTable<PlanSchema>({ tableName: TableNames.PLANS });
  const { values: categories } = useTable<CategorySchema>({ tableName: TableNames.CATEGORIES });

  const onSaveCoverage = React.useCallback(async (value?: CoverageSchema) => {
    setEditingCoverageId(null);
    if (!value) return;
    await save(value);
    refresh();
  }, [save, refresh]);

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
      planColumn.valueOptions = plans.map(x => ({ value: x.id, label: x.name }));
    }

    const categoryColumn = result.find(x => x.field === 'categoryId');
    if (categoryColumn) {
      categoryColumn.type = 'singleSelect';
      // @ts-ignore
      categoryColumn.valueOptions = categories.map(x => ({ value: x.id, label: x.name }));
    }

    result.push({
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      getActions(params) {
        return [
          <GridActionsCellItem icon={<EditIcon />} onClick={async () => {
            const coverage = CoverageSchema.parse(params.row);

            await save(coverage);
            return setEditingCoverageId(coverage.id);
          }
          } label="Edit" />,
          <GridActionsCellItem icon={<DeleteIcon />} onClick={() => remove(params.id as string)} label="Delete" />,
        ]
      },
    });

    return result;
  }, [planId, categoryId, plans, categories, save, remove]);

  return <><DataGrid
    // editMode='row'
    experimentalFeatures={{ columnGrouping: true }}
    rows={coverages}
    columns={columnDefs}
    columnGroupingModel={columnGroupingModel}
  // slots={{ toolbar: EditToolbar }}
  // processRowUpdate={(updatedRow) => {
  //   setChanges(changes => [...changes.filter(x => x.id !== updatedRow.id), updatedRow]);
  // }}
  // slotProps={{ toolbar: { planId, categoryId, changes, clearChanges: () => setChanges([]) } }}
  />
    {editingCoverageId && <EditCoverageDialog coverageId={editingCoverageId} planId={planId} categoryId={categoryId} onClose={onSaveCoverage} />}
  </>;
};
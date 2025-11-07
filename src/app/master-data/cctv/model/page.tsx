
'use client';

import { useState } from 'react';
import { columns } from './columns';
import { DataTable } from '@/components/ui/data-table';
import { AddModelDialog } from './add-dialog';
import { EditModelDialog } from './edit-dialog';
import { getCctvModels, deleteCctvModel } from '@/lib/cctvModelService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CctvModel } from '@prisma/client';
import { TableSkeleton } from '@/components/ui/table-skeleton';

export default function ModelPage() {
  const queryClient = useQueryClient();
  const [editingModel, setEditingModel] = useState<CctvModel | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['cctvModels'],
    queryFn: getCctvModels,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCctvModel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cctvModels'] });
      toast.success('Model deleted successfully!');
      setIsDeleteDialogOpen(false);
    },
    onError: () => {
      toast.error('Failed to delete model.');
    },
  });

  const openDeleteDialog = (id: number) => {
    setModelToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (modelToDelete) {
      deleteMutation.mutate(modelToDelete);
    }
  };

  const handleEdit = (model: CctvModel) => {
    setEditingModel(model);
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <AddModelDialog />
      </div>
      <DataTable
        columns={columns({ handleDelete: openDeleteDialog, handleEdit })}
        data={data || []}
        totalCount={(data || []).length}
      />

      <EditModelDialog
        model={editingModel}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the model.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Deleting...' : 'Continue'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

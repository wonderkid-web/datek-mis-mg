
'use client';

import { useState } from 'react';
import { columns } from './columns';
import { DataTable } from '@/components/ui/data-table';
import { AddDeviceTypeDialog } from './add-dialog';
import { EditDeviceTypeDialog } from './edit-dialog';
import { getCctvDeviceTypes, deleteCctvDeviceType } from '@/lib/cctvDeviceTypeService';
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
import { CctvDeviceType } from '@prisma/client';
import { TableSkeleton } from '@/components/ui/table-skeleton';

export default function DeviceTypePage() {
  const queryClient = useQueryClient();
  const [editingDeviceType, setEditingDeviceType] = useState<CctvDeviceType | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deviceTypeToDelete, setDeviceTypeToDelete] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['cctvDeviceTypes'],
    queryFn: getCctvDeviceTypes,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCctvDeviceType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cctvDeviceTypes'] });
      toast.success('Device type deleted successfully!');
      setIsDeleteDialogOpen(false);
    },
    onError: () => {
      toast.error('Failed to delete device type.');
    },
  });

  const openDeleteDialog = (id: number) => {
    setDeviceTypeToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deviceTypeToDelete) {
      deleteMutation.mutate(deviceTypeToDelete);
    }
  };

  const handleEdit = (deviceType: CctvDeviceType) => {
    setEditingDeviceType(deviceType);
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <AddDeviceTypeDialog />
      </div>
      <DataTable
        columns={columns({ handleDelete: openDeleteDialog, handleEdit })}
        data={data || []}
        totalCount={(data || []).length}
      />

      <EditDeviceTypeDialog
        deviceType={editingDeviceType}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the device type.
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

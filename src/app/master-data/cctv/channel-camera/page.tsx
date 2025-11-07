
'use client';

import { useState } from 'react';
import { columns } from './columns';
import { DataTable } from '@/components/ui/data-table';
import { AddChannelCameraDialog } from './add-dialog';
import { EditChannelCameraDialog } from './edit-dialog';
import { getCctvChannelCameras, deleteCctvChannelCamera } from '@/lib/cctvChannelCameraService';
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
import { CctvChannelCamera } from '@prisma/client';
import { TableSkeleton } from '@/components/ui/table-skeleton';

export default function ChannelCameraPage() {
  const queryClient = useQueryClient();
  const [editingChannelCamera, setEditingChannelCamera] = useState<CctvChannelCamera | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [channelCameraToDelete, setChannelCameraToDelete] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['cctvChannelCameras'],
    queryFn: getCctvChannelCameras,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCctvChannelCamera,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cctvChannelCameras'] });
      toast.success('Channel camera deleted successfully!');
      setIsDeleteDialogOpen(false);
    },
    onError: () => {
      toast.error('Failed to delete channel camera.');
    },
  });

  const openDeleteDialog = (id: number) => {
    setChannelCameraToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (channelCameraToDelete) {
      deleteMutation.mutate(channelCameraToDelete);
    }
  };

  const handleEdit = (channelCamera: CctvChannelCamera) => {
    setEditingChannelCamera(channelCamera);
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <AddChannelCameraDialog />
      </div>
      <DataTable
        columns={columns({ handleDelete: openDeleteDialog, handleEdit })}
        data={data || []}
        totalCount={(data || []).length}
      />

      <EditChannelCameraDialog
        channelCamera={editingChannelCamera}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the channel camera.
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


'use client';

import { useMemo, useState } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SBU_OPTIONS } from '@/lib/constants';
import { AddCctvDialog } from '@/app/items/cctv/add-cctv-dialog';

export default function ChannelCameraPage() {
  const queryClient = useQueryClient();
  const [editingChannelCamera, setEditingChannelCamera] = useState<CctvChannelCamera | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [channelCameraToDelete, setChannelCameraToDelete] = useState<number | null>(null);
  const [companyFilter, setCompanyFilter] = useState<string>("all");

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
      toast(channelCameraToDelete);
      deleteMutation.mutate(channelCameraToDelete);
    }
  };

  const handleEdit = (channelCamera: CctvChannelCamera) => {
    setEditingChannelCamera(channelCamera);
    setIsEditDialogOpen(true);
  };


  const SBU_GROUP_KEY = "PT_Intan_Sejati_Andalan_(Group)";
  const sbuDropdownOptions = [
    ...SBU_OPTIONS.map(s => ({ value: s, label: s.replace(/_/g, " ") })),
    { value: SBU_GROUP_KEY, label: "PT Intan Sejati Andalan (Group)" }
  ].sort((a, b) => a.label.localeCompare(b.label));



  const filteredAssets = useMemo(() => {
    if (!data) return [];
    if (companyFilter === "all") return data;

    return data.filter(cctv => cctv.sbu === companyFilter).sort((a, b) => a.lokasi.localeCompare(b.lokasi, undefined, { numeric: true }));
  }, [data, companyFilter]);

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <div>
      <div className="flex justify-between mt-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger className="w-[260px]">
                <SelectValue placeholder="Filter by company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {sbuDropdownOptions.map((company) => (
                  <SelectItem key={company.value} value={company.value}>
                    {company.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <AddChannelCameraDialog />

      </div>
      <DataTable
        columns={columns({ handleDelete: openDeleteDialog, handleEdit })}
        data={filteredAssets || []}
        totalCount={(filteredAssets || []).length}
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

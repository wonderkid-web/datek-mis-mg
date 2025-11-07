
'use client';

import { useState } from 'react';
import { columns } from './columns';
import { DataTable } from '@/components/ui/data-table';
import { AddBrandDialog } from './add-dialog';
import { EditBrandDialog } from './edit-dialog';
import { getCctvBrands, deleteCctvBrand } from '@/lib/cctvBrandService';
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
import { CctvBrand } from '@prisma/client';
import { TableSkeleton } from '@/components/ui/table-skeleton';

export default function BrandPage() {
  const queryClient = useQueryClient();
  const [editingBrand, setEditingBrand] = useState<CctvBrand | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['cctvBrands'],
    queryFn: getCctvBrands,
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCctvBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cctvBrands'] });
      toast.success('Brand deleted successfully!');
      setIsDeleteDialogOpen(false);
    },
    onError: () => {
      toast.error('Failed to delete brand.');
    },
  });

  const openDeleteDialog = (id: number) => {
    setBrandToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (brandToDelete) {
      deleteMutation.mutate(brandToDelete);
    }
  };

  const handleEdit = (brand: CctvBrand) => {
    setEditingBrand(brand);
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <AddBrandDialog />
      </div>
      <DataTable
        columns={columns({ handleDelete: openDeleteDialog, handleEdit })}
        data={data || []}
        totalCount={(data || []).length}
      />

      <EditBrandDialog
        brand={editingBrand}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the brand.
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

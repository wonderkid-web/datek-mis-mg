"use client";

import { useState } from "react";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { AddCctvDialog } from "./add-cctv-dialog";
import { getCctvSpecs, deleteCctvSpec } from "@/lib/cctvService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Asset } from "@/lib/types";
import { CctvAssetDetailDialog } from "@/components/dialogs/CctvAssetDetailDialog";
import { EditCctvDialog } from "./edit-cctv-dialog";

export default function CctvPage() {
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<number | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);

  const { data: cctvAssets, isLoading } = useQuery({
    queryKey: ["cctvSpecs"],
    queryFn: getCctvSpecs,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCctvSpec,
    onSuccess: () => {
      toast.success("CCTV asset deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["cctvSpecs"] });
    },
    onError: () => {
      toast.error("Failed to delete CCTV asset.");
    },
  });

  const openDeleteDialog = (assetId: number) => {
    console.log("openDeleteDialog called with assetId:", assetId);
    setAssetToDelete(assetId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (assetToDelete) {
      deleteMutation.mutate(assetToDelete);
      setIsDeleteDialogOpen(false);
      setAssetToDelete(null);
    }
  };

  const handleEdit = (asset: Asset) => {
    setAssetToEdit(asset);
    setIsEditDialogOpen(true);
  };

  const handleRowClick = (asset: Asset) => {
    console.log("handleRowClick called with asset:", asset);
    setSelectedAsset(asset);
    setIsDetailDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-4">Manage CCTV Assets</h1>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Manage CCTV Assets</h1>
      <div className="flex items-center justify-end mb-4">
        <AddCctvDialog
          onSave={() => {
            queryClient.invalidateQueries({ queryKey: ["cctvSpecs"] });
          }}
        />
      </div>
            <DataTable
        columns={columns({ handleDelete: openDeleteDialog, handleEdit })}
        // @ts-expect-error its okay
        data={cctvAssets || []}
        totalCount={(cctvAssets || []).length}
        onRowClick={handleRowClick}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the CCTV asset.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CctvAssetDetailDialog
        asset={selectedAsset}
        isOpen={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
      />

      <EditCctvDialog
        asset={assetToEdit}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={() => {
          queryClient.invalidateQueries({ queryKey: ["cctvSpecs"] });
        }}
      />
    </div>
  );
}

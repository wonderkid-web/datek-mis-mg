"use client";

import { useMemo, useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SBU_OPTIONS } from "@/lib/constants";

const SBU_GROUP_KEY = "PT_Intan_Sejati_Andalan_(Group)";
const sbuDropdownOptions = [
  ...SBU_OPTIONS.map(s => ({ value: s, label: s.replace(/_/g, " ") })),
  { value: SBU_GROUP_KEY, label: "PT Intan Sejati Andalan (Group)" }
].sort((a, b) => a.label.localeCompare(b.label));


export default function CctvPage() {
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<number | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);
  const [companyFilter, setCompanyFilter] = useState<string>("all");

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
    setSelectedAsset(asset);
    setIsDetailDialogOpen(true);
  };

  const filteredAssets = useMemo(() => {
    if (!cctvAssets) return [];
    if (companyFilter === "all") return cctvAssets;
    // @ts-expect-error its okay for now
    return cctvAssets.filter(asset => asset.cctvSpecs.channelCamera?.sbu === companyFilter);
  }, [cctvAssets, companyFilter]);

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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Select value={companyFilter} onValueChange={setCompanyFilter}>
            <SelectTrigger className="w-[180px]">
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
        <AddCctvDialog
          onSave={() => {
            queryClient.invalidateQueries({ queryKey: ["cctvSpecs"] });
          }}
        />
      </div>
      <DataTable
        columns={columns({ handleDelete: openDeleteDialog, handleEdit })}
        // @ts-expect-error its okay
        data={filteredAssets || []}
        totalCount={(filteredAssets || []).length}
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
        // @ts-expect-error its okay
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

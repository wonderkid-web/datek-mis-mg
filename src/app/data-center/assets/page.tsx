"use client";

import { useEffect, useState } from "react";
import { getAssets, deleteAsset } from "@/lib/assetService";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { EditAssetDialog } from "./edit-asset-dialog"; // To be created
import { AssignAssetDialog } from "./assign-asset-dialog";
import { Asset } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/ui/table-skeleton";

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const fetchedAssets = await getAssets();
      setAssets(fetchedAssets);
    } catch (error) {
      console.error("Failed to fetch assets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  

  const handleEdit = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this asset?")) {
      console.log(id)
      try {
        await deleteAsset(id);
        fetchData(); // Refresh data
      } catch (error) {
        console.error("Failed to delete asset:", error);
      }
    }
  };

   if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Assigned Assets</h1>
          <Skeleton className="h-10 w-1/3" />
        </div>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Asset Management</h1>
        <Button onClick={() => setIsAssignDialogOpen(true)}>Assign Asset</Button>
        
      </div>
      <AssignAssetDialog
        isOpen={isAssignDialogOpen}
        onClose={() => setIsAssignDialogOpen(false)}
        onSave={() => {
          setIsAssignDialogOpen(false);
          fetchData();
        }}
      />
      <DataTable
        columns={columns({ handleEdit, handleDelete })}
        data={assets}
      />
      {selectedAsset && (
        <EditAssetDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSave={() => {
            setIsEditDialogOpen(false);
            fetchData();
          }}
          asset={selectedAsset}
        />
      )}
    </div>
  );
}

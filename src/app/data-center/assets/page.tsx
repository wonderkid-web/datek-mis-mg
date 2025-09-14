"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getAssets, deleteAsset } from "@/lib/assetService";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { EditAssetDialog } from "./edit-asset-dialog"; // To be created
import { AssignAssetDialog } from "./assign-asset-dialog";
import { Asset } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAssetCategories } from "@/lib/assetCategoryService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ExportActions } from "@/components/ExportActions";
import { toast } from "sonner";

export default function AssetsPage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "administrator";
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [currentTab, setCurrentTab] = useState("all-assets"); // New state for current tab

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["assetCategories"],
    queryFn: getAssetCategories,
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
  });

  const laptopCategoryId = categories?.find((cat) => cat.slug === "laptop")?.id;
  const intelNucCategoryId = categories?.find(
    (cat) => cat.slug === "intel-nuc"
  )?.id;
  const printerCategoryId = categories?.find(
    (cat) => cat.slug === "printer"
  )?.id;

  const {
    data: allAssets,
    isLoading: isLoadingAllAssets,
    isRefetching: isRefetchingAllAssets,
  } = useQuery({
    queryKey: ["allAssets", laptopCategoryId, intelNucCategoryId],
    queryFn: () => {
      if (laptopCategoryId !== undefined && intelNucCategoryId !== undefined) {
        return getAssets().then((fetchedAssets) =>
          fetchedAssets.filter(
            (asset) =>
              asset.categoryId === laptopCategoryId ||
              asset.categoryId === intelNucCategoryId
          )
        );
      }
      return Promise.resolve([]);
    },
    enabled: laptopCategoryId !== undefined && intelNucCategoryId !== undefined,
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
  });

  const {
    data: printerAssets,
    isLoading: isLoadingPrinterAssets,
    isRefetching: isRefetchingPrinterAssets,
  } = useQuery({
    queryKey: ["printerAssets", printerCategoryId],
    queryFn: () => {
      if (printerCategoryId !== undefined) {
        return getAssets(printerCategoryId);
      }
      return Promise.resolve([]);
    },
    enabled: printerCategoryId !== undefined,
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
  });

  const deleteAssetMutation = useMutation({
    mutationFn: deleteAsset,
    onMutate: async (idToDelete) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: ["allAssets", laptopCategoryId, intelNucCategoryId],
      });
      await queryClient.cancelQueries({
        queryKey: ["printerAssets", printerCategoryId],
      });

      // Snapshot the previous values
      const previousAllAssets = queryClient.getQueryData<Asset[]>([
        "allAssets",
        laptopCategoryId,
        intelNucCategoryId,
      ]);
      const previousPrinterAssets = queryClient.getQueryData<Asset[]>([
        "printerAssets",
        printerCategoryId,
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData<Asset[]>(
        ["allAssets", laptopCategoryId, intelNucCategoryId],
        (old) => (old ? old.filter((asset) => asset.id !== idToDelete) : [])
      );
      queryClient.setQueryData<Asset[]>(
        ["printerAssets", printerCategoryId],
        (old) => (old ? old.filter((asset) => asset.id !== idToDelete) : [])
      );

      return { previousAllAssets, previousPrinterAssets };
    },
    onError: (err, idToDelete, context) => {
      // Rollback to the previous value on error
      queryClient.setQueryData(
        ["allAssets", laptopCategoryId, intelNucCategoryId],
        context?.previousAllAssets
      );
      queryClient.setQueryData(
        ["printerAssets", printerCategoryId],
        context?.previousPrinterAssets
      );
      console.error("Failed to delete asset:", err);
    },
    onSettled: () => {
      // Always refetch after error or success:
      queryClient.invalidateQueries({
        queryKey: ["allAssets", laptopCategoryId, intelNucCategoryId],
      });
      queryClient.invalidateQueries({
        queryKey: ["printerAssets", printerCategoryId],
      });
    },
  });

  const handleEdit = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    toast("Delete this asset?", {
      description: "This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: () => deleteAssetMutation.mutate(id),
      },
      cancel: {
        label: "Cancel",
        onClick: () => {return}
       },
    });
  };

  const isLoading =
    isLoadingCategories || isLoadingAllAssets || isLoadingPrinterAssets;
  const isRefetching = isRefetchingAllAssets || isRefetchingPrinterAssets;

  const exportColumns = [
    { header: "Asset Name", accessorKey: "namaAsset" },
    { header: "Serial Number", accessorKey: "nomorSeri" },
    { header: "Status", accessorKey: "statusAsset" },
    { header: "Category", accessorKey: "category.nama" },
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Asset Management</h1>
          <Skeleton className="h-10 w-1/3" />
        </div>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">
        Asset Management{" "}
        {isRefetching && (
          <span className="text-sm text-gray-500">(Updating...)</span>
        )}
      </h1>
      <Tabs defaultValue="all-assets" onValueChange={setCurrentTab}>
        {" "}
        {/* Add onValueChange */}
        <TabsList className="mb-4">
          <TabsTrigger value="all-assets">Laptop, Intel NUC & PC</TabsTrigger>
          <TabsTrigger value="printer-assets">Printer Assets</TabsTrigger>
        </TabsList>
        <TabsContent value="all-assets">
          <div className="flex justify-between items-center mb-6">
            <ExportActions
              columns={exportColumns}
              data={allAssets || []}
              fileName="Laptop_IntelNUC_Assets"
            />
            {isAdmin && (
              <Button onClick={() => setIsAssignDialogOpen(true)}>
                Assign Asset
              </Button>
            )}
          </div>
          {isAdmin && (
            <AssignAssetDialog
              isOpen={isAssignDialogOpen}
              onClose={() => setIsAssignDialogOpen(false)}
              onSave={() => {
                setIsAssignDialogOpen(false);
                queryClient.invalidateQueries({ queryKey: ["allAssets"] });
              }}
              currentTab={currentTab}
              laptopCategoryId={laptopCategoryId || null}
              intelNucCategoryId={intelNucCategoryId || null}
              printerCategoryId={printerCategoryId || null}
            />
          )}
          <DataTable
            // @ts-expect-error its okay
            columns={columns({ handleEdit, handleDelete, router })}
            // @ts-expect-error its okay
            data={allAssets || []}
          />
        </TabsContent>
        <TabsContent value="printer-assets">
          <div className="flex justify-between items-center mb-6">
            <ExportActions
              columns={exportColumns}
              data={printerAssets || []}
              fileName="Printer_Assets"
            />
            {isAdmin && (
              <Button onClick={() => setIsAssignDialogOpen(true)}>
                Assign Printer Asset
              </Button>
            )}
          </div>
          {isAdmin && (
            <AssignAssetDialog
              isOpen={isAssignDialogOpen}
              onClose={() => setIsAssignDialogOpen(false)}
              onSave={() => {
                setIsAssignDialogOpen(false);
                queryClient.invalidateQueries({ queryKey: ["printerAssets"] });
              }}
              currentTab={currentTab}
              laptopCategoryId={laptopCategoryId || null}
              intelNucCategoryId={intelNucCategoryId || null}
              printerCategoryId={printerCategoryId || null}
            />
          )}
          <DataTable
            // @ts-expect-error its okay
            columns={columns({ handleEdit, handleDelete, router })}
            // @ts-expect-error its okay
            data={printerAssets || []}
          />
        </TabsContent>
      </Tabs>
      {selectedAsset && (
        <EditAssetDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSave={() => {
            setIsEditDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: ["allAssets"] });
            queryClient.invalidateQueries({ queryKey: ["printerAssets"] });
          }}
          asset={selectedAsset}
        />
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getAssets, deleteAsset } from "@/lib/assetService";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { EditAssetDialog } from "./edit-asset-dialog";
import { AssignAssetDialog } from "./assign-asset-dialog";
// Update import Asset agar mendukung relasi (category, specs, dll)
import { Asset } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Import Input Component
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

  // --- STATE BARU UNTUK SEARCH ---
  const [searchTerm, setSearchTerm] = useState("");

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [currentTab, setCurrentTab] = useState("all-assets");

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["assetCategories"],
    queryFn: getAssetCategories,
    staleTime: 5 * 60 * 1000,
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
    staleTime: 5 * 60 * 1000,
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
    staleTime: 5 * 60 * 1000,
  });

  const deleteAssetMutation = useMutation({
    mutationFn: deleteAsset,
    onMutate: async (idToDelete) => {
      await queryClient.cancelQueries({
        queryKey: ["allAssets", laptopCategoryId, intelNucCategoryId],
      });
      await queryClient.cancelQueries({
        queryKey: ["printerAssets", printerCategoryId],
      });

      const previousAllAssets = queryClient.getQueryData<Asset[]>([
        "allAssets",
        laptopCategoryId,
        intelNucCategoryId,
      ]);
      const previousPrinterAssets = queryClient.getQueryData<Asset[]>([
        "printerAssets",
        printerCategoryId,
      ]);

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
        onClick: () => { return }
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

  // --- LOGIC PENCARIAN ---
  // Fungsi untuk memfilter asset berdasarkan nama, serial number, atau brand
  const filterData = (data: Asset[] | undefined) => {
    if (!data) return [];
    if (!searchTerm) return data;

    const lowerTerm = searchTerm.toLowerCase();
    return data.filter((asset) => {
      const inName = asset.namaAsset?.toLowerCase().includes(lowerTerm);
      const inSerial = asset.nomorSeri?.toLowerCase().includes(lowerTerm);
      const inCategory = asset.category?.nama?.toLowerCase().includes(lowerTerm);

      // Optional: Cari juga berdasarkan Brand jika ada di specs
      const inLaptopBrand = asset.laptopSpecs?.brandOption?.value?.toLowerCase().includes(lowerTerm);
      const inNucBrand = asset.intelNucSpecs?.brandOption?.value?.toLowerCase().includes(lowerTerm);
      const inPrinterBrand = asset.printerSpecs?.brandOption?.value?.toLowerCase().includes(lowerTerm);

      return inName || inSerial || inCategory || inLaptopBrand || inNucBrand || inPrinterBrand;
    });
  };

  // Terapkan filter ke data
  // @ts-expect-error its okay
  const filteredAllAssets = filterData(allAssets as Asset[]);
  // @ts-expect-error its okay
  const filteredPrinterAssets = filterData(printerAssets as Asset[]);
  // -----------------------

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
        <TabsList className="mb-4">
          <TabsTrigger value="all-assets">Laptop, Intel NUC & PC</TabsTrigger>
          <TabsTrigger value="printer-assets">Printer Assets</TabsTrigger>
        </TabsList>

        <TabsContent value="all-assets">
          {/* BARIS ACTION: Search Input & Buttons */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <Input
              placeholder="Search by Name, SN, Brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:max-w-sm"
            />
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <ExportActions
                columns={exportColumns}
                data={filteredAllAssets || []} // Export filtered data
                fileName="Laptop_IntelNUC_Assets"
              />
              {isAdmin && (
                <Button onClick={() => setIsAssignDialogOpen(true)}>
                  Assign Asset
                </Button>
              )}
            </div>
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
            columns={columns({ handleEdit, handleDelete, router })}
            data={filteredAllAssets} // Pass filtered data
          />
        </TabsContent>

        <TabsContent value="printer-assets">
          {/* BARIS ACTION: Search Input & Buttons */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <Input
              placeholder="Search by Name, SN, Brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:max-w-sm"
            />
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <ExportActions
                columns={exportColumns}
                data={filteredPrinterAssets || []} // Export filtered data
                fileName="Printer_Assets"
              />
              {isAdmin && (
                <Button onClick={() => setIsAssignDialogOpen(true)}>
                  Assign Printer Asset
                </Button>
              )}
            </div>
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
            columns={columns({ handleEdit, handleDelete, router })}
            data={filteredPrinterAssets} // Pass filtered data
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
          // @ts-expect-error its okay
          asset={selectedAsset}
        />
      )}
    </div>
  );
}
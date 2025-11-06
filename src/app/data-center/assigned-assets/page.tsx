"use client";

import { useState } from "react";
import { getAssignments, deleteAssignment } from "@/lib/assignmentService";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { EditAssignmentDialog } from "./edit-assignment-dialog";
import { ViewAssignmentDialog } from "./view-assignment-dialog";
import { AssetAssignment } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAssetCategories } from "@/lib/assetCategoryService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ExportActions } from "@/components/ExportActions";


export default function AssignedAssetsPage() {
  const [activeTabs, setActiveTabs] = useState<"all-assigned-assets" | "printer-assigned-assets">("all-assigned-assets")
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<AssetAssignment | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

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
    data: allAssignments,
    isLoading: isLoadingAllAssignments,
    isRefetching: isRefetchingAllAssignments,
  } = useQuery({
    queryKey: ["allAssignments", laptopCategoryId, intelNucCategoryId],
    queryFn: async () => {
      if (laptopCategoryId !== undefined && intelNucCategoryId !== undefined) {
        const fetchedAssignments = await getAssignments();
        return fetchedAssignments.filter(
          (assignment) =>
            assignment.asset.categoryId === laptopCategoryId ||
            assignment.asset.categoryId === intelNucCategoryId
        );
      }
      return Promise.resolve([]);
    },
    enabled: laptopCategoryId !== undefined && intelNucCategoryId !== undefined,
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
  });

  const {
    data: printerAssignments,
    isLoading: isLoadingPrinterAssignments,
    isRefetching: isRefetchingPrinterAssignments,
  } = useQuery({
    queryKey: ["printerAssignments", printerCategoryId],
    queryFn: async () => {
      if (printerCategoryId !== undefined) {
        const fetchedAssignments = await getAssignments();
        return fetchedAssignments.filter(
          (assignment) => assignment.asset.categoryId === printerCategoryId
        );
      }
      return Promise.resolve([]);
    },
    enabled: printerCategoryId !== undefined,
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: deleteAssignment,
    onMutate: async (idToDelete) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: ["allAssignments", laptopCategoryId, intelNucCategoryId],
      });
      await queryClient.cancelQueries({
        queryKey: ["printerAssignments", printerCategoryId],
      });

      // Snapshot the previous values
      const previousAllAssignments = queryClient.getQueryData<
        AssetAssignment[]
      >(["allAssignments", laptopCategoryId, intelNucCategoryId]);
      const previousPrinterAssignments = queryClient.getQueryData<
        AssetAssignment[]
      >(["printerAssignments", printerCategoryId]);

      // Optimistically update to the new value
      queryClient.setQueryData<AssetAssignment[]>(
        ["allAssignments", laptopCategoryId, intelNucCategoryId],
        (old) =>
          old ? old.filter((assignment) => assignment.id !== idToDelete) : []
      );
      queryClient.setQueryData<AssetAssignment[]>(
        ["printerAssignments", printerCategoryId],
        (old) =>
          old ? old.filter((assignment) => assignment.id !== idToDelete) : []
      );

      return { previousAllAssignments, previousPrinterAssignments };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allAssignments"] });
      queryClient.invalidateQueries({ queryKey: ["printerAssignments"] });
      toast.success("Assignment deleted successfully!");
    },
    onError: (err, idToDelete, context) => {
      // Rollback to the previous value on error
      queryClient.setQueryData(
        ["allAssignments", laptopCategoryId, intelNucCategoryId],
        context?.previousAllAssignments
      );
      queryClient.setQueryData(
        ["printerAssignments", printerCategoryId],
        context?.previousPrinterAssignments
      );
      console.error("Failed to delete assignment:", err);
      toast.error("Failed to delete assignment.");
    },
    onSettled: () => {
      // Always refetch after error or success:
      queryClient.invalidateQueries({
        queryKey: ["allAssignments", laptopCategoryId, intelNucCategoryId],
      });
      queryClient.invalidateQueries({
        queryKey: ["printerAssignments", printerCategoryId],
      });
    },
  });

  const handleEdit = (assignment: AssetAssignment) => {
    setSelectedAssignment(assignment);
    setIsEditDialogOpen(true);
  };

  const handleView = (assignment: AssetAssignment) => {
    setSelectedAssignment(assignment);
    setIsViewDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    toast("Delete this assignment?", {
      description: "This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: () => deleteAssignmentMutation.mutate(id),
      },
      cancel: { label: "Cancel", onClick: () => {return} },
    });
  };

  const isLoading =
    isLoadingCategories ||
    isLoadingAllAssignments ||
    isLoadingPrinterAssignments;
  const isRefetching =
    isRefetchingAllAssignments || isRefetchingPrinterAssignments;

  const filteredAllAssignments =
    allAssignments?.filter(
      (assignment) =>
        assignment.nomorAsset
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        assignment.asset.namaAsset
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        assignment.user.namaLengkap
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        assignment.catatan?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const filteredPrinterAssignments =
    printerAssignments?.filter(
      (assignment) =>
        assignment.nomorAsset
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        assignment.asset.namaAsset
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        assignment.user.namaLengkap
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        assignment.catatan?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];


  const exportColumns = [
    { header: "Asset Number", accessorKey: "nomorAsset" },
    { header: "User Name", accessorKey: "user.namaLengkap" },
    { header: "Asset Name", accessorKey: "asset.namaAsset" },
    { header: "Purchase Date", accessorKey: "asset.tanggalPembelian" },
    { header: "Warranty Date", accessorKey: "asset.tanggalGaransi" },
    { header: "Notes", accessorKey: "catatan" },
  ];

  const onValueChange = (val: "all-assigned-assets" | "printer-assigned-assets") => {
    setActiveTabs(val)
  }

  if (isLoading) {
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
      <h1 className="text-3xl font-bold mb-6">
        Assigned Assets{" "}
        {isRefetching && (
          <span className="text-sm text-gray-500">(Updating...)</span>
        )}
      </h1>
      <div className="flex items-center justify-between mb-4">
        <Input
          placeholder="Search assignments..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="max-w-sm"
        />
      </div>
      {/* @ts-expect-error its okay */}
      <Tabs defaultValue="all-assigned-assets" onValueChange={onValueChange}>
        <div className="flex justify-between">
          <TabsList className="mb-4">
            <TabsTrigger value="all-assigned-assets">
              Laptop & Intel NUC Assignments
            </TabsTrigger>
            <TabsTrigger value="printer-assigned-assets">
              Printer Assignments
            </TabsTrigger>
          </TabsList>
          <div>
            {
              activeTabs == "all-assigned-assets" ?
                <div className="flex justify-end mb-4">
                  <ExportActions
                    columns={exportColumns}
                    data={filteredAllAssignments}
                    fileName="Laptop_IntelNUC_Assignments"
                  />
                </div>
                :
                <div className="flex justify-end mb-4">
                  <ExportActions
                    columns={exportColumns}
                    data={filteredPrinterAssignments}
                    fileName="Printer_Assignments"
                  />
                </div>
            }
          </div>
        </div>
        <TabsContent value="all-assigned-assets">
          <DataTable
            columns={columns({ handleEdit, handleView, handleDelete })}
            data={filteredAllAssignments}
          />
        </TabsContent>
        <TabsContent value="printer-assigned-assets">
          <DataTable
            columns={columns({ handleEdit, handleView, handleDelete })}
            data={filteredPrinterAssignments}
          />
        </TabsContent>
      </Tabs>
      {selectedAssignment && (
        <EditAssignmentDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSave={() => {
            setIsEditDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: ["allAssignments"] });
            queryClient.invalidateQueries({ queryKey: ["printerAssignments"] });
          }}
          assignment={selectedAssignment}
        />
      )}
      {selectedAssignment && (
        <ViewAssignmentDialog
          isOpen={isViewDialogOpen}
          onClose={() => setIsViewDialogOpen(false)}
          onSave={() => setIsViewDialogOpen(false)}
          // @ts-expect-error its okay
          assignment={selectedAssignment}
        />
      )}
    </div>
  );
}

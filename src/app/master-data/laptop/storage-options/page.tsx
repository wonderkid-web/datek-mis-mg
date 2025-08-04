"use client"
import { useState } from "react";
import { LaptopStorageTypeOption } from "@prisma/client";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { AddStorageDialog } from "./add-storage-dialog";
import { EditStorageDialog } from "./edit-storage-dialog";
import {
  getLaptopStorageOptions,
  deleteLaptopStorageOption,
} from "@/lib/laptopStorageService";
import { Input } from "@/components/ui/input";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function StorageOptionsPage() {
  const queryClient = useQueryClient();
  const [editingStorageOption, setEditingStorageOption] =
    useState<LaptopStorageTypeOption | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: storageOptions, isLoading } = useQuery({
    queryKey: ["laptopStorageOptions"],
    queryFn: async () => {
      const fetchedOptions = await getLaptopStorageOptions();
      return fetchedOptions
    },
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
  });

  const deleteStorageMutation = useMutation({
    mutationFn: deleteLaptopStorageOption,
    onMutate: async (idToDelete) => {
      await queryClient.cancelQueries({ queryKey: ["laptopStorageOptions"] });
      const previousStorageOptions = queryClient.getQueryData<LaptopStorageTypeOption[]>(["laptopStorageOptions"]);
      queryClient.setQueryData<LaptopStorageTypeOption[]>(["laptopStorageOptions"], (old) =>
        old ? old.filter((item) => item.id !== Number(idToDelete)) : []
      );
      return { previousStorageOptions };
    },
    onError: (err, idToDelete, context) => {
      queryClient.setQueryData(["laptopStorageOptions"], context?.previousStorageOptions);
      console.error("An error occurred:", err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["laptopStorageOptions"] });
    },
  });

  const openDeleteDialog = (id: string) => {
    setItemToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      deleteStorageMutation.mutate(Number(itemToDelete));
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleEdit = (storageOption: LaptopStorageTypeOption) => {
    setEditingStorageOption(storageOption);
    setIsEditDialogOpen(true);
  };

  const filteredData = storageOptions?.filter((item) =>
    item.value.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Storage Options</h1>
          <Skeleton className="h-10 w-1/3" />
        </div>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Storage Options</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <Input
            placeholder="Search storage types..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="max-w-sm"
          />
          <AddStorageDialog
            onSave={() => queryClient.invalidateQueries({ queryKey: ["laptopStorageOptions"] })}
          />
        </div>
        <DataTable
          columns={columns({ handleDelete: openDeleteDialog, handleEdit })}
          data={filteredData}
          totalCount={filteredData.length}
        />

        {editingStorageOption && (
          <EditStorageDialog
            storageOption={editingStorageOption}
            onSave={() => {
              queryClient.invalidateQueries({ queryKey: ["laptopStorageOptions"] });
              setEditingStorageOption(null);
            }}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
          />
        )}

        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will mark the storage option as deleted.
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
      </CardContent>
    </Card>
  );
}

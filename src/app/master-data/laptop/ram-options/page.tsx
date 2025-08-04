"use client"
import { useState } from "react";
import { LaptopRamOption } from "@prisma/client";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { AddRamDialog } from "./add-ram-dialog";
import { EditRamDialog } from "./edit-ram-dialog";
import { getLaptopRamOptions, deleteLaptopRamOption } from "@/lib/laptopRamService";
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

export default function RamOptionsPage() {
  const queryClient = useQueryClient();
  const [editingRamOption, setEditingRamOption] = useState<LaptopRamOption | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: ramOptions, isLoading } = useQuery({
    queryKey: ["laptopRamOptions"],
    queryFn: async () => {
      const fetchedOptions = await getLaptopRamOptions();
      return fetchedOptions
    },
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
  });

  const deleteRamMutation = useMutation({
    mutationFn: deleteLaptopRamOption,
    onMutate: async (idToDelete) => {
      await queryClient.cancelQueries({ queryKey: ["laptopRamOptions"] });
      const previousRamOptions = queryClient.getQueryData<LaptopRamOption[]>(["laptopRamOptions"]);
      queryClient.setQueryData<LaptopRamOption[]>(["laptopRamOptions"], (old) =>
        old ? old.filter((item) => item.id !== Number(idToDelete)) : []
      );
      return { previousRamOptions };
    },
    onError: (err, idToDelete, context) => {
      queryClient.setQueryData(["laptopRamOptions"], context?.previousRamOptions);
      console.error("An error occurred:", err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["laptopRamOptions"] });
    },
  });

  const openDeleteDialog = (id: string) => {
    setItemToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      deleteRamMutation.mutate(Number(itemToDelete));
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleEdit = (ramOption: LaptopRamOption) => {
    setEditingRamOption(ramOption);
    setIsEditDialogOpen(true);
  };

  const filteredData = ramOptions?.filter((item) =>
    item.value.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage RAM Options</h1>
          <Skeleton className="h-10 w-1/3" />
        </div>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage RAM Options</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <Input
            placeholder="Search RAM..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="max-w-sm"
          />
          <AddRamDialog
            onSave={() => queryClient.invalidateQueries({ queryKey: ["laptopRamOptions"] })}
          />
        </div>
        <DataTable
          columns={columns({ handleDelete: openDeleteDialog, handleEdit })}
          data={filteredData}
          totalCount={filteredData.length}
        />

        {editingRamOption && (
          <EditRamDialog
            ramOption={editingRamOption}
            onSave={() => {
              queryClient.invalidateQueries({ queryKey: ["laptopRamOptions"] });
              setEditingRamOption(null);
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
                This action will mark the RAM option as deleted.
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
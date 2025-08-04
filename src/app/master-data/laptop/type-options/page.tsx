"use client"
import { useState } from "react";
import { LaptopTypeOption } from "@prisma/client";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { AddTypeDialog } from "./add-type-dialog";
import { EditTypeDialog } from "./edit-type-dialog";
import { getLaptopTypeOptions, deleteLaptopTypeOption } from "@/lib/laptopTypeService";
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

export default function TypeOptionsPage() {
  const queryClient = useQueryClient();
  const [editingTypeOption, setEditingTypeOption] = useState<LaptopTypeOption | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: typeOptions, isLoading } = useQuery({
    queryKey: ["laptopTypeOptions"],
    queryFn: async () => {
      const fetchedOptions = await getLaptopTypeOptions();
      return fetchedOptions
    },
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
  });

  const deleteTypeMutation = useMutation({
    mutationFn: deleteLaptopTypeOption,
    onMutate: async (idToDelete) => {
      await queryClient.cancelQueries({ queryKey: ["laptopTypeOptions"] });
      const previousTypeOptions = queryClient.getQueryData<LaptopTypeOption[]>(["laptopTypeOptions"]);
      queryClient.setQueryData<LaptopTypeOption[]>(["laptopTypeOptions"], (old) =>
        old ? old.filter((item) => item.id !== Number(idToDelete)) : []
      );
      return { previousTypeOptions };
    },
    onError: (err, idToDelete, context) => {
      queryClient.setQueryData(["laptopTypeOptions"], context?.previousTypeOptions);
      console.error("An error occurred:", err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["laptopTypeOptions"] });
    },
  });

  const openDeleteDialog = (id: string) => {
    setItemToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      deleteTypeMutation.mutate(Number(itemToDelete));
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleEdit = (typeOption: LaptopTypeOption) => {
    setEditingTypeOption(typeOption);
    setIsEditDialogOpen(true);
  };

  const filteredData = typeOptions?.filter((item) =>
    item.value.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Type Options</h1>
          <Skeleton className="h-10 w-1/3" />
        </div>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Type Options</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <Input
            placeholder="Search types..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="max-w-sm"
          />
          <AddTypeDialog
            onSave={() => queryClient.invalidateQueries({ queryKey: ["laptopTypeOptions"] })}
          />
        </div>
        <DataTable
          columns={columns({ handleDelete: openDeleteDialog, handleEdit })}
          data={filteredData}
          totalCount={filteredData.length}
        />

        {editingTypeOption && (
          <EditTypeDialog
            typeOption={editingTypeOption}
            onSave={() => {
              queryClient.invalidateQueries({ queryKey: ["laptopTypeOptions"] });
              setEditingTypeOption(null);
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
                This action will mark the type option as deleted.
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
"use client";
import { useState } from "react";
import { LaptopBrandOption } from "@prisma/client";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { AddBrandDialog } from "./add-brand-dialog";
import { EditBrandDialog } from "./edit-brand-dialog";
import {
  getLaptopBrandOptions,
  deleteLaptopBrandOption,
} from "@/lib/laptopBrandService";
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

export default function BrandOptionsPage() {
  const queryClient = useQueryClient();
  const [editingBrandOption, setEditingBrandOption] =
    useState<LaptopBrandOption | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: brandOptions, isLoading } = useQuery({
    queryKey: ["laptopBrandOptions"],
    queryFn: async () => {
      const fetchedOptions = await getLaptopBrandOptions();
      return fetchedOptions
    },
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
  });

  const deleteBrandMutation = useMutation({
    mutationFn: deleteLaptopBrandOption,
    onMutate: async (idToDelete) => {
      await queryClient.cancelQueries({ queryKey: ["laptopBrandOptions"] });
      const previousBrandOptions = queryClient.getQueryData<
        LaptopBrandOption[]
      >(["laptopBrandOptions"]);
      queryClient.setQueryData<LaptopBrandOption[]>(
        ["laptopBrandOptions"],
        (old) => (old ? old.filter((item) => item.id !== idToDelete) : [])
      );
      return { previousBrandOptions };
    },
    onError: (err, idToDelete, context) => {
      queryClient.setQueryData(
        ["laptopBrandOptions"],
        context?.previousBrandOptions
      );
      console.error("An error occurred:", err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["laptopBrandOptions"] });
    },
  });

  const openDeleteDialog = (id: string) => {
    setItemToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      deleteBrandMutation.mutate(Number(itemToDelete));
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleEdit = (brandOption: LaptopBrandOption) => {
    setEditingBrandOption(brandOption);
    setIsEditDialogOpen(true);
  };

  const filteredData =
    brandOptions?.filter((item) =>
      item.value.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Brand Options</h1>
          <Skeleton className="h-10 w-1/3" />
        </div>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Brand Options</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <Input
            placeholder="Search brands..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="max-w-sm"
          />
          <AddBrandDialog
            onSave={() =>
              queryClient.invalidateQueries({
                queryKey: ["laptopBrandOptions"],
              })
            }
          />
        </div>
        <DataTable
          columns={columns({ handleDelete: openDeleteDialog, handleEdit })}
          data={filteredData}
          totalCount={filteredData.length}
        />

        {editingBrandOption && (
          <EditBrandDialog
            brandOption={editingBrandOption}
            onSave={() => {
              queryClient.invalidateQueries({
                queryKey: ["laptopBrandOptions"],
              });
              setEditingBrandOption(null);
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
                This action will mark the brand as deleted.
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

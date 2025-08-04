"use client"
import { useState } from "react";
import { LaptopOsOption } from "@prisma/client";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { AddOsDialog } from "./add-os-dialog";
import { EditOsDialog } from "./edit-os-dialog";
import { getLaptopOsOptions, deleteLaptopOsOption } from "@/lib/laptopOsService";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function OsOptionsPage() {
  const queryClient = useQueryClient();
  const [editingOsOption, setEditingOsOption] = useState<LaptopOsOption | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: osOptions, isLoading } = useQuery({
    queryKey: ["laptopOsOptions"],
    queryFn: async () => {
      const fetchedOptions = await getLaptopOsOptions();
      return fetchedOptions
    },
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
  });

  const deleteOsMutation = useMutation({
    mutationFn: deleteLaptopOsOption,
    onMutate: async (idToDelete) => {
      await queryClient.cancelQueries({ queryKey: ["laptopOsOptions"] });
      const previousOsOptions = queryClient.getQueryData<LaptopOsOption[]>(["laptopOsOptions"]);
      queryClient.setQueryData<LaptopOsOption[]>(["laptopOsOptions"], (old) =>
        old ? old.filter((item) => item.id !== Number(idToDelete)) : []
      );
      return { previousOsOptions };
    },
    onError: (err, idToDelete, context) => {
      queryClient.setQueryData(["laptopOsOptions"], context?.previousOsOptions);
      console.error("An error occurred:", err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["laptopOsOptions"] });
    },
  });

  const openDeleteDialog = (id: string) => {
    setItemToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      deleteOsMutation.mutate(Number(itemToDelete));
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleEdit = (osOption: LaptopOsOption) => {
    setEditingOsOption(osOption);
    setIsEditDialogOpen(true);
  };

  const filteredData = osOptions?.filter((item) =>
    item.value.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage OS Options</h1>
          {/* <Skeleton className="h-10 w-1/3" /> */}
        </div>
        {/* <TableSkeleton /> */}
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage OS Options</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <Input
            placeholder="Search OS..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="max-w-sm"
          />
          <AddOsDialog
            onSave={() => queryClient.invalidateQueries({ queryKey: ["laptopOsOptions"] })}
          />
        </div>
        <DataTable
          columns={columns({ handleDelete: openDeleteDialog, handleEdit })}
          data={filteredData}
          totalCount={filteredData.length}
        />

        {editingOsOption && (
          <EditOsDialog
            osOption={editingOsOption}
            onSave={() => {
              queryClient.invalidateQueries({ queryKey: ["laptopOsOptions"] });
              setEditingOsOption(null);
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
                This action will mark the OS as deleted.
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

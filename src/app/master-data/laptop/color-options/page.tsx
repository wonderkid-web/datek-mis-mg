"use client";
import { useState } from "react";
import { LaptopColorOption } from "@prisma/client";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { AddColorDialog } from "./add-color-dialog";
import { EditColorDialog } from "./edit-color-dialog";
import { getLaptopColors, deleteLaptopColor } from "@/lib/laptopColorService";
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

export default function ColorOptionsPage() {
  const queryClient = useQueryClient();
  const [editingColorOption, setEditingColorOption] = useState<LaptopColorOption | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: colorOptions, isLoading } = useQuery({
    queryKey: ["laptopColorOptions"],
    queryFn: async () => {
      const fetchedOptions = await getLaptopColors();
      return fetchedOptions
    },
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
  });

  const deleteColorMutation = useMutation({
    mutationFn: deleteLaptopColor,
    onMutate: async (idToDelete) => {
      await queryClient.cancelQueries({ queryKey: ["laptopColorOptions"] });
      const previousColorOptions = queryClient.getQueryData<LaptopColorOption[]>(["laptopColorOptions"]);
      queryClient.setQueryData<LaptopColorOption[]>(["laptopColorOptions"], (old) =>
        old ? old.filter((item) => item.id !== Number(idToDelete)) : []
      );
      return { previousColorOptions };
    },
    onError: (err, idToDelete, context) => {
      queryClient.setQueryData(["laptopColorOptions"], context?.previousColorOptions);
      console.error("An error occurred:", err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["laptopColorOptions"] });
    },
  });

  const openDeleteDialog = (id: string) => {
    setItemToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      deleteColorMutation.mutate(Number(itemToDelete));
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleEdit = (colorOption: LaptopColorOption) => {
    setEditingColorOption(colorOption);
    setIsEditDialogOpen(true);
  };

  const filteredData = colorOptions?.filter((item) =>
    item.value.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Color Options</h1>
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
        <CardTitle>Manage Color Options</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <Input
            placeholder="Search colors..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="max-w-sm"
          />
          <AddColorDialog
            onSave={() => queryClient.invalidateQueries({ queryKey: ["laptopColorOptions"] })}
          />
        </div>
        <DataTable
          columns={columns({ handleDelete: openDeleteDialog, handleEdit })}
          data={filteredData}
          totalCount={filteredData.length}
        />

        {editingColorOption && (
          <EditColorDialog
            colorOption={editingColorOption}
            onSave={() => {
              queryClient.invalidateQueries({ queryKey: ["laptopColorOptions"] });
              setEditingColorOption(null);
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
                This action will mark the color as deleted.
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

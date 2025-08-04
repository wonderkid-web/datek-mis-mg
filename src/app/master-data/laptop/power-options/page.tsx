"use client"
import { useState } from "react";
import { LaptopPowerOption } from "@prisma/client";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { AddPowerDialog } from "./add-power-dialog";
import { EditPowerDialog } from "./edit-power-dialog";
import { getLaptopPowerOptions, deleteLaptopPowerOption } from "@/lib/laptopPowerService";
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

export default function PowerOptionsPage() {
  const queryClient = useQueryClient();
  const [editingPowerOption, setEditingPowerOption] = useState<LaptopPowerOption | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: powerOptions, isLoading } = useQuery({
    queryKey: ["laptopPowerOptions"],
    queryFn: async () => {
      const fetchedOptions = await getLaptopPowerOptions();
      return fetchedOptions
    },
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
  });

  const deletePowerMutation = useMutation({
    mutationFn: deleteLaptopPowerOption,
    onMutate: async (idToDelete) => {
      await queryClient.cancelQueries({ queryKey: ["laptopPowerOptions"] });
      const previousPowerOptions = queryClient.getQueryData<LaptopPowerOption[]>(["laptopPowerOptions"]);
      queryClient.setQueryData<LaptopPowerOption[]>(["laptopPowerOptions"], (old) =>
        old ? old.filter((item) => item.id !== Number(idToDelete)) : []
      );
      return { previousPowerOptions };
    },
    onError: (err, idToDelete, context) => {
      queryClient.setQueryData(["laptopPowerOptions"], context?.previousPowerOptions);
      console.error("An error occurred:", err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["laptopPowerOptions"] });
    },
  });

  const openDeleteDialog = (id: string) => {
    setItemToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      deletePowerMutation.mutate(Number(itemToDelete));
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleEdit = (powerOption: LaptopPowerOption) => {
    setEditingPowerOption(powerOption);
    setIsEditDialogOpen(true);
  };

  const filteredData = powerOptions?.filter((item) =>
    item.value.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Power Options</h1>
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
        <CardTitle>Manage Power Options</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <Input
            placeholder="Search power options..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="max-w-sm"
          />
          <AddPowerDialog
            onSave={() => queryClient.invalidateQueries({ queryKey: ["laptopPowerOptions"] })}
          />
        </div>
        <DataTable
          columns={columns({ handleDelete: openDeleteDialog, handleEdit })}
          data={filteredData}
          totalCount={filteredData.length}
        />

        {editingPowerOption && (
          <EditPowerDialog
            powerOption={editingPowerOption}
            onSave={() => {
              queryClient.invalidateQueries({ queryKey: ["laptopPowerOptions"] });
              setEditingPowerOption(null);
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
                This action will mark the power option as deleted.
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

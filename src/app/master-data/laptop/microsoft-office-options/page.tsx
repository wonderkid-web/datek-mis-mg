"use client"
import { useState } from "react";
import { LaptopMicrosoftOfficeOption } from "@prisma/client";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { AddMicrosoftOfficeDialog } from "./add-microsoft-office-dialog";
import { EditMicrosoftOfficeDialog } from "./edit-microsoft-office-dialog";
import { getLaptopMicrosoftOffices, deleteLaptopMicrosoftOffice } from "@/lib/laptopMicrosoftOfficeService";
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

export default function MicrosoftOfficeOptionsPage() {
  const queryClient = useQueryClient();
  const [editingMicrosoftOfficeOption, setEditingMicrosoftOfficeOption] = useState<LaptopMicrosoftOfficeOption | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: microsoftOfficeOptions, isLoading } = useQuery({
    queryKey: ["laptopMicrosoftOfficeOptions"],
    queryFn: async () => {
      const fetchedOptions = await getLaptopMicrosoftOffices();
      return fetchedOptions
    },
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
  });

  const deleteMicrosoftOfficeMutation = useMutation({
    mutationFn: deleteLaptopMicrosoftOffice,
    onMutate: async (idToDelete) => {
      await queryClient.cancelQueries({ queryKey: ["laptopMicrosoftOfficeOptions"] });
      const previousMicrosoftOfficeOptions = queryClient.getQueryData<LaptopMicrosoftOfficeOption[]>(["laptopMicrosoftOfficeOptions"]);
      queryClient.setQueryData<LaptopMicrosoftOfficeOption[]>(["laptopMicrosoftOfficeOptions"], (old) =>
        old ? old.filter((item) => item.id !== Number(idToDelete)) : []
      );
      return { previousMicrosoftOfficeOptions };
    },
    onError: (err, idToDelete, context) => {
      queryClient.setQueryData(["laptopMicrosoftOfficeOptions"], context?.previousMicrosoftOfficeOptions);
      console.error("An error occurred:", err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["laptopMicrosoftOfficeOptions"] });
    },
  });

  const openDeleteDialog = (id: string) => {
    setItemToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      deleteMicrosoftOfficeMutation.mutate(Number(itemToDelete));
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleEdit = (microsoftOfficeOption: LaptopMicrosoftOfficeOption) => {
    setEditingMicrosoftOfficeOption(microsoftOfficeOption);
    setIsEditDialogOpen(true);
  };

  const filteredData = microsoftOfficeOptions?.filter((item) =>
    item.value.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Microsoft Office Options</h1>
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
        <CardTitle>Manage Microsoft Office Options</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <Input
            placeholder="Search Office versions..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="max-w-sm"
          />
          <AddMicrosoftOfficeDialog
            onSave={() => queryClient.invalidateQueries({ queryKey: ["laptopMicrosoftOfficeOptions"] })}
          />
        </div>
        <DataTable
          columns={columns({ handleDelete: openDeleteDialog, handleEdit })}
          data={filteredData}
          totalCount={filteredData.length}
        />

        {editingMicrosoftOfficeOption && (
          <EditMicrosoftOfficeDialog
            microsoftOfficeOption={editingMicrosoftOfficeOption}
            onSave={() => {
              queryClient.invalidateQueries({ queryKey: ["laptopMicrosoftOfficeOptions"] });
              setEditingMicrosoftOfficeOption(null);
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
                This action will mark the Office version as deleted.
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

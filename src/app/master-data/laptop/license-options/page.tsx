"use client";
import { useState } from "react";
import { LaptopLicenseOption } from "@prisma/client";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { AddLicenseDialog } from "./add-license-dialog";
import { EditLicenseDialog } from "./edit-license-dialog";
import { getLaptopLicenseOptions, deleteLaptopLicenseOption } from "@/lib/laptopLicenseService";
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

export default function LicenseOptionsPage() {
  const queryClient = useQueryClient();
  const [editingLicenseOption, setEditingLicenseOption] = useState<LaptopLicenseOption | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: licenseOptions, isLoading } = useQuery({
    queryKey: ["laptopLicenseOptions"],
    queryFn: async () => {
      const fetchedOptions = await getLaptopLicenseOptions();
      return fetchedOptions
    },
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
  });

  const deleteLicenseMutation = useMutation({
    mutationFn: deleteLaptopLicenseOption,
    onMutate: async (idToDelete) => {
      await queryClient.cancelQueries({ queryKey: ["laptopLicenseOptions"] });
      const previousLicenseOptions = queryClient.getQueryData<LaptopLicenseOption[]>(["laptopLicenseOptions"]);
      queryClient.setQueryData<LaptopLicenseOption[]>(["laptopLicenseOptions"], (old) =>
        old ? old.filter((item) => item.id !== Number(idToDelete)) : []
      );
      return { previousLicenseOptions };
    },
    onError: (err, idToDelete, context) => {
      queryClient.setQueryData(["laptopLicenseOptions"], context?.previousLicenseOptions);
      console.error("An error occurred:", err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["laptopLicenseOptions"] });
    },
  });

  const openDeleteDialog = (id: string) => {
    setItemToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      deleteLicenseMutation.mutate(itemToDelete);
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleEdit = (licenseOption: LaptopLicenseOption) => {
    setEditingLicenseOption(licenseOption);
    setIsEditDialogOpen(true);
  };

  const filteredData = licenseOptions?.filter((item) =>
    item.value.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage License Options</h1>
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
        <CardTitle>Manage License Options</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <Input
            placeholder="Search licenses..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="max-w-sm"
          />
          <AddLicenseDialog
            onSave={() => queryClient.invalidateQueries({ queryKey: ["laptopLicenseOptions"] })}
          />
        </div>
        <DataTable
          columns={columns({ handleDelete: openDeleteDialog, handleEdit })}
          data={filteredData}
          totalCount={filteredData.length}
        />

        {editingLicenseOption && (
          <EditLicenseDialog
            licenseOption={editingLicenseOption}
            onSave={() => {
              queryClient.invalidateQueries({ queryKey: ["laptopLicenseOptions"] });
              setEditingLicenseOption(null);
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
                This action will mark the license option as deleted.
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

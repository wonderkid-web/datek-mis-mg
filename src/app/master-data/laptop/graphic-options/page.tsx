"use client";
import { useState } from "react";
import { LaptopGraphicOption } from "@prisma/client";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { AddGraphicDialog } from "./add-graphic-dialog";
import { EditGraphicDialog } from "./edit-graphic-dialog";
import { getLaptopGraphicOptions, deleteLaptopGraphicOption } from "@/lib/laptopGraphicService";
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

export default function GraphicOptionsPage() {
  const queryClient = useQueryClient();
  const [editingOption, setEditingOption] = useState<LaptopGraphicOption | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: graphicOptions, isLoading } = useQuery({
    queryKey: ["laptopGraphicOptions"],
    queryFn: async () => {
      const fetchedOptions = await getLaptopGraphicOptions();
      return fetchedOptions
    },
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
  });

  const deleteGraphicMutation = useMutation({
    mutationFn: deleteLaptopGraphicOption,
    onMutate: async (idToDelete) => {
      await queryClient.cancelQueries({ queryKey: ["laptopGraphicOptions"] });
      const previousGraphicOptions = queryClient.getQueryData<LaptopGraphicOption[]>(["laptopGraphicOptions"]);
      queryClient.setQueryData<LaptopGraphicOption[]>(["laptopGraphicOptions"], (old) =>
        old ? old.filter((item) => item.id !== Number(idToDelete)) : []
      );
      return { previousGraphicOptions };
    },
    onError: (err, idToDelete, context) => {
      queryClient.setQueryData(["laptopGraphicOptions"], context?.previousGraphicOptions);
      console.error("An error occurred:", err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["laptopGraphicOptions"] });
    },
  });

  const openDeleteDialog = (id: string) => {
    setItemToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      deleteGraphicMutation.mutate(Number(itemToDelete));
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleEdit = (option: LaptopGraphicOption) => {
    setEditingOption(option);
    setIsEditDialogOpen(true);
  };

  const filteredData = graphicOptions?.filter((item) =>
    item.value.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Graphic Options</h1>
          <Skeleton className="h-10 w-1/3" />
        </div>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Graphic Options</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <Input
            placeholder="Search graphics..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="max-w-sm"
          />
          <AddGraphicDialog
            onSave={() => queryClient.invalidateQueries({ queryKey: ["laptopGraphicOptions"] })}
          />
        </div>
        <DataTable
          columns={columns({ handleDelete: openDeleteDialog, handleEdit })}
          data={filteredData}
          totalCount={filteredData.length}
        />

        {editingOption && (
          <EditGraphicDialog
            graphicOption={editingOption}
            onSave={() => {
              queryClient.invalidateQueries({ queryKey: ["laptopGraphicOptions"] });
              setEditingOption(null);
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
                This action will mark the graphic option as deleted.
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

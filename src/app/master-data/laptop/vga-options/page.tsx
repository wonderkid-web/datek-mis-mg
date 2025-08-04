"use client";

import { useEffect, useState } from "react";
import { LaptopVgaOption } from "@prisma/client";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { AddVgaDialog } from "./add-vga-dialog";
import { EditVgaDialog } from "./edit-vga-dialog";
import {
  getLaptopVgaOptions,
  deleteLaptopVgaOption,
} from "@/lib/laptopVgaService";
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

export default function VgaOptionsPage() {
  const [data, setData] = useState<LaptopVgaOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingOption, setEditingOption] = useState<LaptopVgaOption | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const options = await getLaptopVgaOptions();
      return options;
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openDeleteDialog = (id: string) => {
    setItemToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      try {
        await deleteLaptopVgaOption(Number(itemToDelete));
        fetchData();
      } catch (error) {
        console.error("An error occurred:", error);
      } finally {
        setIsDeleteDialogOpen(false);
        setItemToDelete(null);
      }
    }
  };

  const handleEdit = (option: LaptopVgaOption) => {
    setEditingOption(option);
    setIsEditDialogOpen(true);
  };

  const filteredData = data.filter((item) =>
    item.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Assigned Assets</h1>
          <Skeleton className="h-10 w-1/3" />
        </div>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage VGA Options</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <Input
            placeholder="Search VGA..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="max-w-sm"
          />
          <AddVgaDialog onSave={fetchData} />
        </div>
        <DataTable
          columns={columns({ handleDelete: openDeleteDialog, handleEdit })}
          data={filteredData}
          totalCount={filteredData.length}
        />

        {editingOption && (
          <EditVgaDialog
            vgaOption={editingOption}
            onSave={() => {
              fetchData();
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
                This action will mark the VGA option as deleted.
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

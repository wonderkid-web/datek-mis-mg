"use client";

import { useEffect, useState } from "react";
import { LaptopStorageTypeOption } from "@prisma/client";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { AddStorageDialog } from "./add-storage-dialog";
import { EditStorageDialog } from "./edit-storage-dialog";
import { getLaptopStorageOptions, deleteLaptopStorageOption } from "@/lib/laptopStorageService";
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

export default function StorageOptionsPage() {
  const [data, setData] = useState<LaptopStorageTypeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStorageOption, setEditingStorageOption] = useState<LaptopStorageTypeOption | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const storageOptions = await getLaptopStorageOptions();
      setData(storageOptions.filter(item => !item.isDeleted));
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
        await deleteLaptopStorageOption(itemToDelete);
        fetchData();
      } catch (error) {
        console.error("An error occurred:", error);
      } finally {
        setIsDeleteDialogOpen(false);
        setItemToDelete(null);
      }
    }
  };

  const handleEdit = (storageOption: LaptopStorageTypeOption) => {
    setEditingStorageOption(storageOption);
    setIsEditDialogOpen(true);
  };

  const filteredData = data.filter((item) =>
    item.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Storage Options</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <Input
            placeholder="Search storage types..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="max-w-sm"
          />
          <AddStorageDialog onSave={fetchData} />
        </div>
        <DataTable columns={columns({ handleDelete: openDeleteDialog, handleEdit })} data={filteredData} totalCount={filteredData.length} />

        {editingStorageOption && (
          <EditStorageDialog
            storageOption={editingStorageOption}
            onSave={() => {
              fetchData();
              setEditingStorageOption(null);
            }}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
          />
        )}

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will mark the storage option as deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}

"use client";

import { useEffect, useState } from "react";
import { LaptopStorageTypeOption } from "@prisma/client";
import { columns } from "./columns";
import { DataTable } from "@/app/master-data/laptop/ram-options/data-table"; // Reusing DataTable
import { AddStorageDialog } from "./add-storage-dialog";
import { EditStorageDialog } from "./edit-storage-dialog";
import { getStorages, deleteStorage } from "@/lib/storageService"; // Import service functions

export default function StorageOptionsPage() {
  const [data, setData] = useState<LaptopStorageTypeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStorageOption, setEditingStorageOption] = useState<LaptopStorageTypeOption | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const storageOptions = await getStorages(); // Use service function directly
      setData(storageOptions as LaptopStorageTypeOption[]); // Cast to LaptopStorageTypeOption[]
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await deleteStorage(id); // Use service function directly
      fetchData(); // Refresh data after successful deletion
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  const handleEdit = (storageOption: LaptopStorageTypeOption) => {
    setEditingStorageOption(storageOption);
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <AddStorageDialog onSave={fetchData} />
      </div>
      <DataTable columns={columns({ handleDelete, handleEdit })} data={data} />

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
    </div>
  );
}
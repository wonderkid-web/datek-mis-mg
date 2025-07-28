"use client";

import { useEffect, useState } from "react";
import { LaptopColorOption } from "@prisma/client";
import { columns } from "./columns";
import { DataTable } from "@/app/master-data/laptop/ram-options/data-table"; // Reusing DataTable
import { AddColorDialog } from "./add-color-dialog";
import { EditColorDialog } from "./edit-color-dialog";
import { getColors, deleteColor } from "@/lib/colorService"; // Import service functions

export default function ColorOptionsPage() {
  const [data, setData] = useState<LaptopColorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingColorOption, setEditingColorOption] = useState<LaptopColorOption | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const colorOptions = await getColors(); // Use service function directly
      setData(colorOptions as LaptopColorOption[]); // Cast to LaptopColorOption[]
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
      await deleteColor(id); // Use service function directly
      fetchData(); // Refresh data after successful deletion
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  const handleEdit = (colorOption: LaptopColorOption) => {
    setEditingColorOption(colorOption);
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <AddColorDialog onSave={fetchData} />
      </div>
      <DataTable columns={columns({ handleDelete, handleEdit })} data={data} />

      {editingColorOption && (
        <EditColorDialog
          colorOption={editingColorOption}
          onSave={() => {
            fetchData();
            setEditingColorOption(null);
          }}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { LaptopScreenSizeOption } from "@prisma/client";
import { columns } from "./columns";
import { DataTable } from "@/app/master-data/laptop/ram-options/data-table"; // Reusing DataTable
import { AddScreenSizeDialog } from "./add-screen-size-dialog";
import { EditScreenSizeDialog } from "./edit-screen-size-dialog";
import { getScreenSizes, deleteScreenSize } from "@/lib/screenSizeService"; // Import service functions

export default function ScreenSizeOptionsPage() {
  const [data, setData] = useState<LaptopScreenSizeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingScreenSizeOption, setEditingScreenSizeOption] = useState<LaptopScreenSizeOption | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const screenSizeOptions = await getScreenSizes(); // Use service function directly
      setData(screenSizeOptions as LaptopScreenSizeOption[]); // Cast to LaptopScreenSizeOption[]
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
      await deleteScreenSize(id); // Use service function directly
      fetchData(); // Refresh data after successful deletion
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  const handleEdit = (screenSizeOption: LaptopScreenSizeOption) => {
    setEditingScreenSizeOption(screenSizeOption);
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <AddScreenSizeDialog onSave={fetchData} />
      </div>
      <DataTable columns={columns({ handleDelete, handleEdit })} data={data} />

      {editingScreenSizeOption && (
        <EditScreenSizeDialog
          screenSizeOption={editingScreenSizeOption}
          onSave={() => {
            fetchData();
            setEditingScreenSizeOption(null);
          }}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
    </div>
  );
}
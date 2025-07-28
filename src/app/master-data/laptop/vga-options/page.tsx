"use client";

import { useEffect, useState } from "react";
import { LaptopVgaOption } from "@prisma/client";
import { columns } from "./columns";
import { DataTable } from "@/app/master-data/laptop/ram-options/data-table"; // Reusing DataTable
import { AddVgaDialog } from "./add-vga-dialog";
import { EditVgaDialog } from "./edit-vga-dialog";
import { getVgas, deleteVga } from "@/lib/vgaService"; // Import service functions

export default function VgaOptionsPage() {
  const [data, setData] = useState<LaptopVgaOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingVgaOption, setEditingVgaOption] = useState<LaptopVgaOption | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const vgaOptions = await getVgas(); // Use service function directly
      setData(vgaOptions as LaptopVgaOption[]); // Cast to LaptopVgaOption[]
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
      await deleteVga(id); // Use service function directly
      fetchData(); // Refresh data after successful deletion
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  const handleEdit = (vgaOption: LaptopVgaOption) => {
    setEditingVgaOption(vgaOption);
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <AddVgaDialog onSave={fetchData} />
      </div>
      <DataTable columns={columns({ handleDelete, handleEdit })} data={data} />

      {editingVgaOption && (
        <EditVgaDialog
          vgaOption={editingVgaOption}
          onSave={() => {
            fetchData();
            setEditingVgaOption(null);
          }}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
    </div>
  );
}
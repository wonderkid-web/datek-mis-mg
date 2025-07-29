"use client";

import { useEffect, useState } from "react";
import { LaptopPowerOption } from "@prisma/client";
import { columns } from "./columns";
import { DataTable } from "@/app/master-data/laptop/ram-options/data-table"; // Reusing DataTable
import { AddPowerDialog } from "./add-power-dialog";
import { EditPowerDialog } from "./edit-power-dialog";
import { getLaptopPowerOptions, deleteLaptopPowerOption } from "@/lib/laptopPowerService"; // Import service functions

export default function PowerOptionsPage() {
  const [data, setData] = useState<LaptopPowerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPowerOption, setEditingPowerOption] = useState<LaptopPowerOption | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const powerOptions = await getLaptopPowerOptions(); // Use service function directly
      setData(powerOptions as LaptopPowerOption[]); // Cast to LaptopPowerOption[]
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
      await deleteLaptopPowerOption(id); // Use service function directly
      fetchData(); // Refresh data after successful deletion
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  const handleEdit = (powerOption: LaptopPowerOption) => {
    setEditingPowerOption(powerOption);
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <AddPowerDialog onSave={fetchData} />
      </div>
      <DataTable columns={columns({ handleDelete, handleEdit })} data={data} />

      {editingPowerOption && (
        <EditPowerDialog
          powerOption={editingPowerOption}
          onSave={() => {
            fetchData();
            setEditingPowerOption(null);
          }}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
    </div>
  );
}
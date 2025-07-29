"use client";

import { useEffect, useState } from "react";
import { LaptopTypeOption } from "@prisma/client";
import { columns } from "./columns";
import { DataTable } from "@/app/master-data/laptop/ram-options/data-table"; // Reusing DataTable
import { AddTypeDialog } from "./add-type-dialog";
import { EditTypeDialog } from "./edit-type-dialog";
import { getLaptopTypeOptions, deleteLaptopTypeOption } from "@/lib/laptopTypeService"; // Import service functions

export default function TypeOptionsPage() {
  const [data, setData] = useState<LaptopTypeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTypeOption, setEditingTypeOption] = useState<LaptopTypeOption | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const typeOptions = await getLaptopTypeOptions(); // Use service function directly
      setData(typeOptions as LaptopTypeOption[]); // Cast to LaptopTypeOption[]
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
      await deleteLaptopTypeOption(id); // Use service function directly
      fetchData(); // Refresh data after successful deletion
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  const handleEdit = (typeOption: LaptopTypeOption) => {
    setEditingTypeOption(typeOption);
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <AddTypeDialog onSave={fetchData} />
      </div>
      <DataTable columns={columns({ handleDelete, handleEdit })} data={data} />

      {editingTypeOption && (
        <EditTypeDialog
          typeOption={editingTypeOption}
          onSave={() => {
            fetchData();
            setEditingTypeOption(null);
          }}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
    </div>
  );
}

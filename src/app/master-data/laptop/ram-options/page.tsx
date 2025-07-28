"use client";

import { useEffect, useState } from "react";
import { LaptopRamOption } from "@prisma/client";
import { columns } from "./columns";
import { DataTable } from "@/app/master-data/laptop/ram-options/data-table"; // Reusing DataTable
import { AddRamDialog } from "./add-ram-dialog";
import { EditRamDialog } from "./edit-ram-dialog";

async function getData(): Promise<LaptopRamOption[]> {
  const res = await fetch("/api/master-data/laptop/ram");
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  return res.json();
}

export default function RamOptionsPage() {
  const [data, setData] = useState<LaptopRamOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRamOption, setEditingRamOption] = useState<LaptopRamOption | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const ramOptions = await getData(); // Use fetch to API route
      setData(ramOptions);
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
      const response = await fetch(`/api/master-data/laptop/ram/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchData(); // Refresh data after successful deletion
      } else {
        console.error("Failed to delete RAM option");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  const handleEdit = (ramOption: LaptopRamOption) => {
    setEditingRamOption(ramOption);
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <AddRamDialog onSave={fetchData} />
      </div>
      <DataTable columns={columns({ handleDelete, handleEdit })} data={data} />

      {editingRamOption && (
        <EditRamDialog
          ramOption={editingRamOption}
          onSave={() => {
            fetchData();
            setEditingRamOption(null);
          }}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
    </div>
  );
}

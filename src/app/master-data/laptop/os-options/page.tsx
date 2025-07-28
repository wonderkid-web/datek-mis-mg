"use client";

import { useEffect, useState } from "react";
import { LaptopOsOption } from "@prisma/client";
import { columns } from "./columns";
import { DataTable } from "@/app/master-data/laptop/ram-options/data-table"; // Reusing DataTable
import { AddOsDialog } from "./add-os-dialog";
import { EditOsDialog } from "./edit-os-dialog";
import { getOs, deleteOs } from "@/lib/osService"; // Import service functions

export default function OsOptionsPage() {
  const [data, setData] = useState<LaptopOsOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingOsOption, setEditingOsOption] = useState<LaptopOsOption | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const osOptions = await getOs(); // Use service function directly
      setData(osOptions as LaptopOsOption[]); // Cast to LaptopOsOption[]
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
      await deleteOs(id); // Use service function directly
      fetchData(); // Refresh data after successful deletion
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  const handleEdit = (osOption: LaptopOsOption) => {
    setEditingOsOption(osOption);
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <AddOsDialog onSave={fetchData} />
      </div>
      <DataTable columns={columns({ handleDelete, handleEdit })} data={data} />

      {editingOsOption && (
        <EditOsDialog
          osOption={editingOsOption}
          onSave={() => {
            fetchData();
            setEditingOsOption(null);
          }}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
    </div>
  );
}

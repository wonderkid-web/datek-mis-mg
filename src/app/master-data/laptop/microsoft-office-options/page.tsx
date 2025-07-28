"use client";

import { useEffect, useState } from "react";
import { LaptopMicrosoftOfficeOption } from "@prisma/client";
import { columns } from "./columns";
import { DataTable } from "@/app/master-data/laptop/ram-options/data-table"; // Reusing DataTable
import { AddMicrosoftOfficeDialog } from "./add-microsoft-office-dialog";
import { EditMicrosoftOfficeDialog } from "./edit-microsoft-office-dialog";
import { getMicrosoftOffices, deleteMicrosoftOffice } from "@/lib/microsoftOfficeService"; // Import service functions

export default function MicrosoftOfficeOptionsPage() {
  const [data, setData] = useState<LaptopMicrosoftOfficeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMicrosoftOfficeOption, setEditingMicrosoftOfficeOption] = useState<LaptopMicrosoftOfficeOption | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const microsoftOfficeOptions = await getMicrosoftOffices(); // Use service function directly
      setData(microsoftOfficeOptions as LaptopMicrosoftOfficeOption[]); // Cast to LaptopMicrosoftOfficeOption[]
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
      await deleteMicrosoftOffice(id); // Use service function directly
      fetchData(); // Refresh data after successful deletion
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  const handleEdit = (microsoftOfficeOption: LaptopMicrosoftOfficeOption) => {
    setEditingMicrosoftOfficeOption(microsoftOfficeOption);
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <AddMicrosoftOfficeDialog onSave={fetchData} />
      </div>
      <DataTable columns={columns({ handleDelete, handleEdit })} data={data} />

      {editingMicrosoftOfficeOption && (
        <EditMicrosoftOfficeDialog
          microsoftOfficeOption={editingMicrosoftOfficeOption}
          onSave={() => {
            fetchData();
            setEditingMicrosoftOfficeOption(null);
          }}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
    </div>
  );
}

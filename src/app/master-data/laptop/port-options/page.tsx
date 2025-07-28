"use client";

import { useEffect, useState } from "react";
import { LaptopPortOption } from "@prisma/client";
import { columns } from "./columns";
import { DataTable } from "@/app/master-data/laptop/ram-options/data-table"; // Reusing DataTable
import { AddPortDialog } from "./add-port-dialog";
import { EditPortDialog } from "./edit-port-dialog";
import { getPorts, deletePort } from "@/lib/portService"; // Import service functions

export default function PortOptionsPage() {
  const [data, setData] = useState<LaptopPortOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPortOption, setEditingPortOption] = useState<LaptopPortOption | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const portOptions = await getPorts(); // Use service function directly
      setData(portOptions as LaptopPortOption[]); // Cast to LaptopPortOption[]
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
      await deletePort(id); // Use service function directly
      fetchData(); // Refresh data after successful deletion
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  const handleEdit = (portOption: LaptopPortOption) => {
    setEditingPortOption(portOption);
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <AddPortDialog onSave={fetchData} />
      </div>
      <DataTable columns={columns({ handleDelete, handleEdit })} data={data} />

      {editingPortOption && (
        <EditPortDialog
          portOption={editingPortOption}
          onSave={() => {
            fetchData();
            setEditingPortOption(null);
          }}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
    </div>
  );
}
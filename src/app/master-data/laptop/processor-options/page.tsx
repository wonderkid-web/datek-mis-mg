"use client";

import { useEffect, useState } from "react";
import { LaptopProcessorOption } from "@prisma/client";
import { columns } from "./columns";
import { DataTable } from "@/app/master-data/laptop/ram-options/data-table"; // Reusing DataTable
import { AddProcessorDialog } from "./add-processor-dialog";
import { EditProcessorDialog } from "./edit-processor-dialog";
import { getProcessors, deleteProcessor } from "@/lib/processorService"; // Import service functions

export default function ProcessorOptionsPage() {
  const [data, setData] = useState<LaptopProcessorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProcessorOption, setEditingProcessorOption] = useState<LaptopProcessorOption | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const processorOptions = await getProcessors(); // Use service function directly
      setData(processorOptions as LaptopProcessorOption[]); // Cast to LaptopProcessorOption[]
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
      await deleteProcessor(id); // Use service function directly
      fetchData(); // Refresh data after successful deletion
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  const handleEdit = (processorOption: LaptopProcessorOption) => {
    setEditingProcessorOption(processorOption);
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <AddProcessorDialog onSave={fetchData} />
      </div>
      <DataTable columns={columns({ handleDelete, handleEdit })} data={data} />

      {editingProcessorOption && (
        <EditProcessorDialog
          processorOption={editingProcessorOption}
          onSave={() => {
            fetchData();
            setEditingProcessorOption(null);
          }}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
    </div>
  );
}
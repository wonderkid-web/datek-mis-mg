"use client";

import { useEffect, useState } from "react";
import { LaptopBrandOption } from "@prisma/client";
import { columns } from "./columns";
import { DataTable } from "@/app/master-data/laptop/ram-options/data-table"; // Reusing DataTable
import { AddBrandDialog } from "./add-brand-dialog";
import { EditBrandDialog } from "./edit-brand-dialog";
import { getLaptopBrandOptions, deleteLaptopBrandOption } from "@/lib/laptopBrandService"; // Import service functions

export default function BrandOptionsPage() {
  const [data, setData] = useState<LaptopBrandOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBrandOption, setEditingBrandOption] = useState<LaptopBrandOption | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const brandOptions = await getLaptopBrandOptions(); // Use service function directly
      setData(brandOptions as LaptopBrandOption[]); // Cast to LaptopBrandOption[]
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
      await deleteLaptopBrandOption(id); // Use service function directly
      fetchData(); // Refresh data after successful deletion
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  const handleEdit = (brandOption: LaptopBrandOption) => {
    setEditingBrandOption(brandOption);
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <AddBrandDialog onSave={fetchData} />
      </div>
      <DataTable columns={columns({ handleDelete, handleEdit })} data={data} />

      {editingBrandOption && (
        <EditBrandDialog
          brandOption={editingBrandOption}
          onSave={() => {
            fetchData();
            setEditingBrandOption(null);
          }}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
    </div>
  );
}

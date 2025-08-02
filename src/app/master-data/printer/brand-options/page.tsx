"use client";

import { useEffect, useState } from "react";
import { PrinterBrandOption } from "@prisma/client";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { AddBrandDialog } from "./add-brand-dialog";
import { EditBrandDialog } from "./edit-brand-dialog";
import { getPrinterBrandOptions, deletePrinterBrandOption } from "@/lib/printerBrandService";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BrandOptionsPage() {
  const [data, setData] = useState<PrinterBrandOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBrandOption, setEditingBrandOption] = useState<PrinterBrandOption | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const brandOptions = await getPrinterBrandOptions();
      setData(brandOptions);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openDeleteDialog = (id: string) => {
    setItemToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      try {
        await deletePrinterBrandOption(Number(itemToDelete));
        fetchData();
      } catch (error) {
        console.error("An error occurred:", error);
      } finally {
        setIsDeleteDialogOpen(false);
        setItemToDelete(null);
      }
    }
  };

  const handleEdit = (brandOption: PrinterBrandOption) => {
    setEditingBrandOption(brandOption);
    setIsEditDialogOpen(true);
  };

  const filteredData = data.filter((item) =>
    item.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Brand Options</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <Input
            placeholder="Search brands..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="max-w-sm"
          />
          <AddBrandDialog onSave={fetchData} />
        </div>
        <DataTable columns={columns({ handleDelete: openDeleteDialog, handleEdit })} data={filteredData} totalCount={filteredData.length} />

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

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will delete the brand.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}

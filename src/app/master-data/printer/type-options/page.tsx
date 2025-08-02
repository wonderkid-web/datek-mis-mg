"use client";

import { useEffect, useState } from "react";
import { PrinterTypeOption } from "@prisma/client";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { AddTypeDialog } from "./add-type-dialog";
import { EditTypeDialog } from "./edit-type-dialog";
import { getPrinterTypeOptions, deletePrinterTypeOption } from "@/lib/printerTypeService";
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

export default function TypeOptionsPage() {
  const [data, setData] = useState<PrinterTypeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTypeOption, setEditingTypeOption] = useState<PrinterTypeOption | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const typeOptions = await getPrinterTypeOptions();
      setData(typeOptions);
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
        await deletePrinterTypeOption(Number(itemToDelete));
        fetchData();
      } catch (error) {
        console.error("An error occurred:", error);
      } finally {
        setIsDeleteDialogOpen(false);
        setItemToDelete(null);
      }
    }
  };

  const handleEdit = (typeOption: PrinterTypeOption) => {
    setEditingTypeOption(typeOption);
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
        <CardTitle>Manage Type Options</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <Input
            placeholder="Search types..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="max-w-sm"
          />
          <AddTypeDialog onSave={fetchData} />
        </div>
        <DataTable columns={columns({ handleDelete: openDeleteDialog, handleEdit })} data={filteredData} totalCount={filteredData.length} />

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

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will delete the type.
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

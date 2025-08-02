"use client";

import { useEffect, useState } from "react";
import { PrinterModelOption } from "@prisma/client";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { AddModelDialog } from "./add-model-dialog";
import { EditModelDialog } from "./edit-model-dialog";
import { getPrinterModelOptions, deletePrinterModelOption } from "@/lib/printerModelService";
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

export default function ModelOptionsPage() {
  const [data, setData] = useState<PrinterModelOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingModelOption, setEditingModelOption] = useState<PrinterModelOption | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const modelOptions = await getPrinterModelOptions();
      setData(modelOptions);
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
        await deletePrinterModelOption(Number(itemToDelete));
        fetchData();
      } catch (error) {
        console.error("An error occurred:", error);
      } finally {
        setIsDeleteDialogOpen(false);
        setItemToDelete(null);
      }
    }
  };

  const handleEdit = (modelOption: PrinterModelOption) => {
    setEditingModelOption(modelOption);
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
        <CardTitle>Manage Model Options</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <Input
            placeholder="Search models..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="max-w-sm"
          />
          <AddModelDialog onSave={fetchData} />
        </div>
        <DataTable columns={columns({ handleDelete: openDeleteDialog, handleEdit })} data={filteredData} totalCount={filteredData.length} />

        {editingModelOption && (
          <EditModelDialog
            modelOption={editingModelOption}
            onSave={() => {
              fetchData();
              setEditingModelOption(null);
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
                This action will delete the model.
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

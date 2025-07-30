"use client";

import { useEffect, useState } from "react";
import { AssetCategory } from "@prisma/client";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table"; // Corrected DataTable import
import { AddCategoryDialog } from "./add-category-dialog";
import { EditCategoryDialog } from "./edit-category-dialog";
import { getAssetCategories, deleteAssetCategory } from "@/lib/assetCategoryService";
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

export default function AssetCategoriesPage() {
  const [data, setData] = useState<AssetCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<AssetCategory | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const categories = await getAssetCategories();
      // @ts-expect-error its okay
      setData(categories.filter(cat => !cat.isDeleted)); // Filter out soft-deleted items
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
    setCategoryToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (categoryToDelete) {
      try {
        await deleteAssetCategory(categoryToDelete);
        fetchData(); // Refresh data
      } catch (error) {
        console.error("An error occurred:", error);
      } finally {
        setIsDeleteDialogOpen(false);
        setCategoryToDelete(null);
      }
    }
  };

  const handleEdit = (category: AssetCategory) => {
    setEditingCategory(category);
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <AddCategoryDialog onSave={fetchData} />
      </div>
      {/* @ts-expect-error its okay */}
      <DataTable columns={columns({ handleDelete: openDeleteDialog, handleEdit })} data={data} />

      {editingCategory && (
        <EditCategoryDialog
          category={editingCategory}
          onSave={() => {
            fetchData();
            setEditingCategory(null);
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
              This action will mark the category as deleted. It {"won't"} be permanently removed from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

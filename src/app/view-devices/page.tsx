"use client";

import { useEffect, useState } from "react";
import { Item } from "@/lib/types";
import {
  getItems,
  updateItem,
  deleteItem,
} from "@/lib/itemService";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Toaster, toast } from "sonner";
import ItemList from "@/components/ItemList";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function ViewDevicesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
    fetchItems();
  }, [loading, user, router]);

  const fetchItems = async () => {
    setIsLoading(true);
    const itemsData = await getItems();
    setItems(itemsData);
    setIsLoading(false);
  };

  const handleEdit = (item: Item) => {
    // Navigate to the /items page with the item ID for editing
    router.push(`/items?id=${item.id}`);
  };

  const handleDelete = async (id: string) => {
    toast("Are you sure you want to delete this item?", {
      action: {
        label: "Delete",
        onClick: async () => {
          toast.promise(deleteItem(id), {
            loading: "Deleting item...",
            success: () => {
              fetchItems();
              return "Item deleted successfully!";
            },
            error: "Failed to delete item.",
          });
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => toast.dismiss(),
      },
    });
  };

  return (
    <div className="min-h-screen max-h-screen overflow-auto bg-gray-100">
      <main className="container mx-auto p-8">
        <h1 className="mb-8 text-3xl font-bold">Daftar Aset</h1>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Aset</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Memuat aset...</p>
            ) : (
              <ItemList
                items={items}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
              />
            )}
          </CardContent>
        </Card>
      </main>
      <Toaster />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Item, User } from "@/lib/types";
import {
  getItems,
  deleteItem,
} from "@/lib/itemService";
import { Card, CardContent } from "@/components/ui/card";
import { Toaster, toast } from "sonner";
import AssetTable from "@/components/AssetTable";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { getUsers } from "@/lib/userService";

export default function ViewDevicesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
    fetchData();
  }, [loading, user, router]);

  const fetchData = async () => {
    setIsLoading(true);
    const itemsData = await getItems();
    const usersData = await getUsers();
    setItems(itemsData);
    setUsers(usersData);
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
              fetchData();
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
        <h1 className="mb-8 text-3xl font-bold">Data Teknis</h1>

        <Card>
          {/* <CardHeader>
            <CardTitle>List Asset</CardTitle>
          </CardHeader> */}
          <CardContent>
            {isLoading ? (
              <p>Memuat aset...</p>
            ) : (
              <AssetTable
                items={items}
                users={users}
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

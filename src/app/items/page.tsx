"use client";

import { useEffect, useState } from "react";
import { Item } from "@/lib/types";
import {
  getItems,
  createItem,
  updateItem,
  deleteItem,
} from "@/lib/itemService";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ITEM_TYPES } from "@/lib/constants";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";
import ItemList from "@/components/ItemList";

export default function ItemsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState<
    Omit<Item, "id" | "createdAt" | "updatedAt">
  >({
    name: "",
    description: "",
    quantity: 0,
    minQuantity: 0,
    isDeleted: false,
  });
  const [editingItem, setEditingItem] = useState<Item | null>(null);

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const itemData = {
      ...form,
      quantity: Number(form.quantity),
      minQuantity: Number(form.minQuantity),
    };
    if (editingItem) {
      await updateItem(editingItem.id!, itemData);
    } else {
      await createItem(itemData);
    }
    setForm({ name: "", description: "", quantity: 0, minQuantity: 0, isDeleted: false });
    setEditingItem(null);
    fetchItems();
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      minQuantity: item.minQuantity || 0,
      isDeleted: item.isDeleted,
    });
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
        <h1 className="mb-8 text-3xl font-bold">Kelola Barang</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editingItem ? "Edit Barang" : "Tambah Barang Baru"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Nama
                </label>
                <Select
                  onValueChange={(value) => setForm({ ...form, name: value })}
                  value={form.name}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih jenis item" />
                  </SelectTrigger>
                  <SelectContent>
                    {ITEM_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Type/Merk
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="quantity"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Kuantitas
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.quantity}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="minQuantity"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Kuantitas Minimum untuk Peringatan
                </label>
                <input
                  type="number"
                  id="minQuantity"
                  name="minQuantity"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.minQuantity}
                  onChange={handleChange}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {editingItem ? "Perbarui Barang" : "Tambah Barang"}
              </Button>
              {editingItem && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingItem(null);
                    setForm({ name: "", description: "", quantity: 0, minQuantity: 0, isDeleted: false });
                  }}
                  className="ml-4"
                >
                  Batal
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Barang</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Memuat barang...</p>
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

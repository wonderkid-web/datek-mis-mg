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
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

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
    minQuantity: 0, // Added minQuantity
  });
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
    fetchItems();
  }, []);

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
    setForm({ name: "", description: "", quantity: 0, minQuantity: 0 });
    setEditingItem(null);
    fetchItems();
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      minQuantity: item.minQuantity || 0, // Set minQuantity for editing
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      await deleteItem(id);
      fetchItems();
    }
  };

  return (
    <div className="min-h-screen max-h-screen overflow-auto bg-gray-100">
      <main className="container mx-auto p-8">
        <h1 className="mb-8 text-3xl font-bold">Manage Items</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editingItem ? "Edit Item" : "Add New Item"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Description
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
                  Quantity
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
                  Minimum Quantity for Alert
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
                {editingItem ? "Update Item" : "Add Item"}
              </Button>
              {editingItem && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingItem(null);
                    setForm({ name: "", description: "", quantity: 0 });
                  }}
                  className="ml-4"
                >
                  Cancel
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Item List</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading items...</p>
            ) : items.length === 0 ? (
              <p>No items found.</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Min Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {item.description}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {item.quantity}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {item.minQuantity}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                        <Button
                          variant="link"
                          onClick={() => handleEdit(item)}
                          className="text-primary p-0 h-auto"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="link"
                          onClick={() => handleDelete(item.id!)}
                          className="ml-4 text-red-600 p-0 h-auto"
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

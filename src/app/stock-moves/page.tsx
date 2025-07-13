"use client";

import { useEffect, useState } from "react";
import { StockMove, Item } from "@/lib/types";
import {
  getStockMoves,
  createStockMove,
  updateStockMove,
  deleteStockMove,
} from "@/lib/stockMoveService";
import { getItems } from "@/lib/itemService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster, toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const sbuOptions = [
  "BIMP",
  "BIMR",
  "BIMS",
  "ISA",
  "ISAR",
  "MUL",
  "KPNJ",
  "KMA",
  "MG",
];

export default function StockMovesPage() {
  const [stockMoves, setStockMoves] = useState<StockMove[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState<
    Omit<StockMove, "id" | "createdAt" | "moveDate"> & { moveDate: string }
  >({
    itemId: "initial",
    fromSBU: "initial",
    itemName: "",
    toSBU: "initial",
    quantity: 0,
    moveDate: "",
  });
  const [editingStockMove, setEditingStockMove] = useState<StockMove | null>(
    null
  );

  useEffect(() => {
    fetchStockMoves();
    fetchItems();
  }, []);

  const fetchStockMoves = async () => {
    const stockMovesData = await getStockMoves();
    setStockMoves(stockMovesData);
  };

  const fetchItems = async () => {
    setIsLoading(true);
    const itemsData = await getItems();
    setIsLoading(false);
    setItems(itemsData);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const stockMoveData = {
      ...form,
      quantity: Number(form.quantity),
      moveDate: new Date(form.moveDate),
    };
    try {
      if (editingStockMove) {
        await updateStockMove(editingStockMove.id!, stockMoveData);
        toast.success("Stock move updated successfully!");
      } else {
        await createStockMove(stockMoveData);
        toast.success("Stock move created successfully!");
      }
      setForm({
        itemId: "initial",
        itemName: "",
        fromSBU: "initial",
        toSBU: "initial",
        quantity: 0,
        moveDate: "",
      });
      setEditingStockMove(null);
      fetchStockMoves();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEdit = (stockMove: StockMove) => {
    setEditingStockMove(stockMove);
    setForm({
      itemId: stockMove.itemId,
      fromSBU: stockMove.fromSBU,
      itemName: "",
      toSBU: stockMove.toSBU,
      quantity: stockMove.quantity,
      moveDate: stockMove.moveDate.toISOString().split("T")[0], // Format date for input
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this stock move?")) {
      await deleteStockMove(id);
      fetchStockMoves();
    }
  };

  return (
    <div className="min-h-screen max-h-screen overflow-auto bg-gray-100">
      <main className="container mx-auto p-8">
        <h1 className="mb-8 text-3xl font-bold">Manage Stock Moves</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              {editingStockMove ? "Edit Stock Move" : "Add New Stock Move"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="itemId"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Item
                </label>
                <Select
                  value={form.itemId}
                  onValueChange={(value) =>
                    handleChange({
                      target: { name: "itemId", value },
                    } as React.ChangeEvent<HTMLSelectElement>)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an Item" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="initial">Select an Item</SelectItem>
                    {items.map((item) => (
                      <SelectItem key={item.id} value={item.id!}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="toSBU"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  To SBU
                </label>
                <Select
                  value={form.toSBU}
                  onValueChange={(value) =>
                    handleChange({
                      target: { name: "toSBU", value },
                    } as React.ChangeEvent<HTMLSelectElement>)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select SBU" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="initial">Select SBU</SelectItem>
                    {sbuOptions.map((sbu) => (
                      <SelectItem key={sbu} value={sbu}>
                        {sbu}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="fromSBU"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  From SBU
                </label>
                <Select
                  value={form.fromSBU}
                  onValueChange={(value) =>
                    handleChange({
                      target: { name: "fromSBU", value },
                    } as React.ChangeEvent<HTMLSelectElement>)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select SBU" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="initial">Select SBU</SelectItem>
                    {sbuOptions.map((sbu) => (
                      <SelectItem key={sbu} value={sbu}>
                        {sbu}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="mb-4">
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
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.quantity}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="moveDate"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Move Date
                </label>
                <input
                  type="date"
                  id="moveDate"
                  name="moveDate"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.moveDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <Button type="submit">
                {editingStockMove ? "Update Stock Move" : "Add Stock Move"}
              </Button>
              {editingStockMove && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingStockMove(null);
                    setForm({
                      itemId: "",
                      fromSBU: "",
                      toSBU: "",
                      itemName:"",
                      quantity: 0,
                      moveDate: "",
                    });
                  }}
                  className="ml-4 rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
              )}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock Move List</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading stock moves...</p>
            ) : stockMoves.length === 0 ? (
              <p>No stock moves found.</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      From SBU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      To SBU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Move Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {stockMoves.map((stockMove) => (
                    <tr key={stockMove.id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {stockMove.itemName}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {stockMove.fromSBU}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {stockMove.toSBU}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {stockMove.quantity}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {new Date(stockMove.moveDate).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                        <Button
                          variant="link"
                          onClick={() => handleEdit(stockMove)}
                          className="text-primary p-0 h-auto"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="link"
                          onClick={() => handleDelete(stockMove.id!)}
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
      <Toaster />
    </div>
  );
}

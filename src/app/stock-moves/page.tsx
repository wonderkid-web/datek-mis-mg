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
import { ITEM_TYPES } from "@/lib/constants";
import StockMoveList from "@/components/StockMoveList";

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
  const [selectedCategory, setSelectedCategory] = useState<string>("initial");
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
    const selectedItem = items.find((item) => item.id === form.itemId);
    if (!selectedItem) {
      toast.error("Silakan pilih item yang valid.");
      return;
    }

    const stockMoveData = {
      ...form,
      itemName: selectedItem.name, // Set itemName from the selected item's name
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
      setSelectedCategory("initial");
      setEditingStockMove(null);
      fetchStockMoves();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEdit = (stockMove: StockMove) => {
    setEditingStockMove(stockMove);
    // Extract category from stockMove.itemName (e.g., "laptop (MacBook Pro)" -> "laptop")
    const categoryMatch = stockMove.itemName.match(/^([^\s]+)/);
    const category = categoryMatch ? categoryMatch[1] : "initial";
    setSelectedCategory(category);

    setForm({
      itemId: stockMove.itemId,
      fromSBU: stockMove.fromSBU,
      itemName: stockMove.itemName,
      toSBU: stockMove.toSBU,
      quantity: stockMove.quantity,
      moveDate: stockMove.moveDate.toISOString().split("T")[0], // Format date for input
    });
  };

  const handleDelete = async (id: string) => {
    toast("Apakah Anda yakin ingin menghapus pergerakan stok ini?", {
      action: {
        label: "Hapus",
        onClick: async () => {
          toast.promise(deleteStockMove(id), {
            loading: "Menghapus pergerakan stok...",
            success: () => {
              fetchStockMoves();
              return "Pergerakan stok berhasil dihapus!";
            },
            error: "Gagal menghapus pergerakan stok.",
          });
        },
      },
      cancel: {
        label: "Batal",
        onClick: () => toast.dismiss(),
      },
    });
  };

  return (
    <div className="min-h-screen max-h-screen overflow-auto bg-gray-100">
      <main className="container mx-auto p-8">
        <h1 className="mb-8 text-3xl font-bold">Kelola Pergerakan Stok</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              {editingStockMove ? "Edit Pergerakan Stok" : "Tambah Pergerakan Stok Baru"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="itemCategory"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Kategori Item
                </label>
                <Select
                  value={selectedCategory}
                  onValueChange={(value) => {
                    setSelectedCategory(value);
                    setForm({ ...form, itemId: "initial", itemName: "" }); // Reset item selection when category changes
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Kategori Item" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="initial">Pilih Kategori Item</SelectItem>
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
                  htmlFor="itemId"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Item
                </label>
                <Select
                  value={form.itemId}
                  onValueChange={(value) => {
                    const selectedItem = items.find((item) => item.id === value);
                    setForm({
                      ...form,
                      itemId: value,
                      itemName: selectedItem ? `${selectedItem.name} (${selectedItem.description})` : "",
                    });
                  }}
                  disabled={selectedCategory === "initial"}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Item" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="initial">Pilih Item</SelectItem>
                    {items
                      .filter((item) => item.name === selectedCategory)
                      .map((item) => (
                        <SelectItem key={item.id} value={item.id!}>
                          {item.name} ({item.description})
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
                  Ke SBU
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
                    <SelectValue placeholder="Pilih SBU" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="initial">Pilih SBU</SelectItem>
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
                  Dari SBU
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
                    <SelectValue placeholder="Pilih SBU" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="initial">Pilih SBU</SelectItem>
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
                  Kuantitas
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
                  Tanggal Pergerakan
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
                {editingStockMove ? "Perbarui Pergerakan Stok" : "Tambah Pergerakan Stok"}
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
                  Batal
                </button>
              )}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Pergerakan Stok</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Memuat pergerakan stok...</p>
            ) : (
              <StockMoveList
                stockMoves={stockMoves}
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

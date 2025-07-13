"use client";

import { useEffect, useState } from "react";
import { StockMove, Item } from "@/lib/types";
import { getStockMoves } from "@/lib/stockMoveService";
import { getItems } from "@/lib/itemService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const sbuOptions = ["BIMP", "BIMR", "BIMS", "ISA", "ISAR", "MUL", "KPNJ", "KMA", "MG"];

export default function StockMoveHistoryPage() {
  const [stockMoves, setStockMoves] = useState<StockMove[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    itemId: "",
    fromSBU: "",
    toSBU: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const stockMovesData = await getStockMoves();
    const itemsData = await getItems();
    setStockMoves(stockMovesData);
    setItems(itemsData);
    setIsLoading(false);
  };

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    return stockMoves.filter((move) => {
      const moveDate = new Date(move.moveDate);
      const startDate = filters.startDate ? new Date(filters.startDate) : null;
      const endDate = filters.endDate ? new Date(filters.endDate) : null;

      return (
        (filters.itemId === "all" || filters.itemId === "" || move.itemId === filters.itemId) &&
        (filters.fromSBU === "all" || filters.fromSBU === "" || move.fromSBU === filters.fromSBU) &&
        (filters.toSBU === "all" || filters.toSBU === "" || move.toSBU === filters.toSBU) &&
        (!startDate || moveDate >= startDate) &&
        (!endDate || moveDate <= endDate)
      );
    });
  };

  const filteredStockMoves = applyFilters();

  return (
    <div className="min-h-screen max-h-screen overflow-auto bg-gray-100">
      <main className="container mx-auto p-8">
        <h1 className="mb-8 text-3xl font-bold">Stock Move History</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label htmlFor="filterItemId" className="mb-2 block text-sm font-medium text-gray-700">
                  Item
                </label>
                <Select
                  value={filters.itemId}
                  onValueChange={(value) => handleFilterChange("itemId", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an Item" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Items</SelectItem>
                    {items.map((item) => (
                      <SelectItem key={item.id} value={item.id!}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="filterFromSBU" className="mb-2 block text-sm font-medium text-gray-700">
                  From SBU
                </label>
                <Select
                  value={filters.fromSBU}
                  onValueChange={(value) => handleFilterChange("fromSBU", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select From SBU" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All SBUs</SelectItem>
                    {sbuOptions.map((sbu) => (
                      <SelectItem key={sbu} value={sbu}>
                        {sbu}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="filterToSBU" className="mb-2 block text-sm font-medium text-gray-700">
                  To SBU
                </label>
                <Select
                  value={filters.toSBU}
                  onValueChange={(value) => handleFilterChange("toSBU", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select To SBU" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All SBUs</SelectItem>
                    {sbuOptions.map((sbu) => (
                      <SelectItem key={sbu} value={sbu}>
                        {sbu}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="filterStartDate" className="mb-2 block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <Input
                  type="date"
                  id="filterStartDate"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange("startDate", e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="filterEndDate" className="mb-2 block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <Input
                  type="date"
                  id="filterEndDate"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange("endDate", e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={() => setFilters({ itemId: "all", fromSBU: "all", toSBU: "all", startDate: "", endDate: "" })}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock Move Records</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading stock move history...</p>
            ) : filteredStockMoves.length === 0 ? (
              <p>No stock moves found matching the filters.</p>
            ) : (
              <div className="overflow-x-auto">
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredStockMoves.map((stockMove) => (
                      <tr key={stockMove.id}>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                          {items.find((item) => item.id === stockMove.itemId)?.name || "N/A"}
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

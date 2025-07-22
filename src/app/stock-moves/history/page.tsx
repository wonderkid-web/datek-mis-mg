"use client";

import { useEffect, useState } from "react";
import { StockMove, Item } from "@/lib/types";
import { getStockMoves } from "@/lib/stockMoveService";
import { getItems } from "@/lib/itemService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StockMoveHistoryList from "@/components/StockMoveHistoryList";


export default function StockMoveHistoryPage() {
  const [stockMoves, setStockMoves] = useState<StockMove[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters] = useState({
    itemId: "",
    startDate: "",
    endDate: "",
    searchQuery: "",
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


  const applyFilters = () => {
    return stockMoves.filter((move) => {
      const moveDate = new Date(move.createdAt);
      const startDate = filters.startDate ? new Date(filters.startDate) : null;
      const endDate = filters.endDate ? new Date(filters.endDate) : null;

      const searchTerm = filters.searchQuery.toLowerCase();
      const matchesSearch =
        move.sbu.toLowerCase().includes(searchTerm) ||
        move.item.toLowerCase().includes(searchTerm) ||
        move.assetNumber.toLowerCase().includes(searchTerm) ||
        move.user.toLowerCase().includes(searchTerm) ||
        move.department.toLowerCase().includes(searchTerm) ||
        move.ipAddress.toLowerCase().includes(searchTerm) ||
        move.remote.toLowerCase().includes(searchTerm);

      return (
        (filters.itemId === "all" ||
          filters.itemId === "" ||
          move.item === filters.itemId) &&
        (!startDate || moveDate >= startDate) &&
        (!endDate || moveDate <= endDate) &&
        matchesSearch
      );
    });
  };

  const filteredStockMoves = applyFilters();


  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <main className="container mx-auto p-8 flex-grow flex flex-col">
        <h1 className="mb-8 text-3xl font-bold">Stock Move History</h1>

        <Card className="flex-grow flex flex-col">
          <CardHeader>
            <CardTitle>Stock Move Records</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col flex-grow overflow-y-auto">
            {isLoading ? (
              <p>Loading stock move history...</p>
            ) : (
              <StockMoveHistoryList
                stockMoves={filteredStockMoves}
                items={items}
              />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

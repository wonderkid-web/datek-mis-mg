"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";
import { getItems } from "@/lib/itemService";
import { getStockMoves } from "@/lib/stockMoveService";
import { Item, StockMove } from "@/lib/types";
import { ITEM_TYPES } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockMoveTrendChart } from "@/components/charts/StockMoveTrendChart";
import { ItemsBySbuChart } from "@/components/charts/ItemsBySbuChart";
import { FrequentItemsChart } from "@/components/charts/FrequentItemsChart";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [totalItems, setTotalItems] = useState(0);
  const [totalStockQuantity, setTotalStockQuantity] = useState(0);
  const [recentStockMoves, setRecentStockMoves] = useState<StockMove[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Item[]>([]);
  const [itemTypeCounts, setItemTypeCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }

    const fetchData = async () => {
      const fetchedItems = await getItems();
      setTotalItems(fetchedItems.length);
      setTotalStockQuantity(
        fetchedItems.reduce((sum, item) => sum + item.quantity, 0)
      );
      setLowStockItems(
        fetchedItems.filter(
          (item) =>
            item.minQuantity != null && item.quantity <= item.minQuantity
        )
      );

      const counts: Record<string, number> = {};
      ITEM_TYPES.forEach(type => {
        counts[type] = fetchedItems.filter(item => item.name === type).length;
      });
      setItemTypeCounts(counts);

      const fetchedStockMoves = await getStockMoves();
      setRecentStockMoves(fetchedStockMoves.slice(0, 3));
    };

    if (user) {
      fetchData();
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Memuat...
      </div>
    );
  }

  return (
    <div className="min-h-screen max-h-screen overflow-auto bg-gray-50/50">
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dasbor</h1>
          <p className="text-gray-600">Selamat datang kembali, {user.email}</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 justify-between">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">Total Barang</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">{totalItems}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">Total Kuantitas Stok</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">{totalStockQuantity}</p>
            </CardContent>
          </Card>
          {Object.entries(itemTypeCounts).map(([type, count]) => (
            <Card key={type}>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">Total Item {type}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-900">{count}</p>
              </CardContent>
            </Card>
          ))}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">Pergerakan Terbaru</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">{recentStockMoves.length}</p>
            </CardContent>
          </Card>
          <Card className="border-red-500/50">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-red-600">Peringatan Stok Rendah</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">{lowStockItems.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Tren Pergerakan Stok</CardTitle>
            </CardHeader>
            <CardContent>
              <StockMoveTrendChart />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Item berdasarkan SBU</CardTitle>
            </CardHeader>
            <CardContent>
              <ItemsBySbuChart />
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Item yang Paling Sering Dipindahkan</CardTitle>
            </CardHeader>
            <CardContent>
              <FrequentItemsChart />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

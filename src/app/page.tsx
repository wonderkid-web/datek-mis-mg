"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";
import { getItems } from "@/lib/itemService";


export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [totalItems, setTotalItems] = useState(0);
  const [itemTypeCounts, setItemTypeCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }

    const fetchData = async () => {
      const fetchedItems = await getItems();
      setTotalItems(fetchedItems.length);

      const targetItemNames = ["PRINTER", "laptop", "monitor", "mouse"];
      const counts: Record<string, number> = {};

      targetItemNames.forEach(name => {
        counts[name] = fetchedItems.filter(item => item.name.toLowerCase().includes(name.toLowerCase())).length;
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
    <div className="min-h-screen max-h-screen overflow-auto">
      <main className="container p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Dasbor</h1>
          <p className="text-muted-foreground">Selamat datang kembali, {user.email}</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 justify-between">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Barang</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalItems}</p>
            </CardContent>
          </Card>
          {Object.entries(itemTypeCounts).map(([type, count]) => (
            <Card key={type}>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total {type}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{count}</p>
              </CardContent>
            </Card>
          ))}
          
        </div>

        
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";
import { getItems } from "@/lib/itemService";
import { getUsers } from "@/lib/userService";
import { Item, User } from "@/lib/types";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Package, Monitor, Mouse, PrinterIcon, LaptopIcon } from "lucide-react";
import ItemsBySbuChart from "@/components/charts/ItemsBySbuChart";
import ItemsByDepartmentChart from "@/components/charts/ItemsByDepartmentChart";
import ItemsByLocationChart from "@/components/charts/ItemsByLocationChart";
import ItemsByStatusChart from "@/components/charts/ItemsByStatusChart";
import ItemsByUserChart from "@/components/charts/ItemsByUserChart";
import SbuAssetMap from "@/components/SbuAssetMap";


export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [totalItems, setTotalItems] = useState(0);
  const [itemTypeCounts, setItemTypeCounts] = useState<Record<string, number>>({});
  const [items, setItems] = useState<Item[]>([]); // Add state for items
  const [users, setUsers] = useState<User[]>([]); // Add state for users

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }

    const fetchData = async () => {
      const fetchedItems = await getItems();
      setItems(fetchedItems); // Set items state
      setTotalItems(fetchedItems.length);

      const fetchedUsers = await getUsers(); // Fetch users
      setUsers(fetchedUsers); // Set users state

      const targetItemNames = ["PRINTER", "Laptop", "Monitor", "Mouse"];
      const counts: Record<string, number> = {};

      targetItemNames.forEach(name => {
        counts[name] = fetchedItems.filter(item => item.name.toLowerCase().includes(name.toLowerCase())).length;
      });
      setItemTypeCounts(counts);

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
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Barang</CardTitle>
              <Package className="h-8 w-8 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalItems}</p>
            </CardContent>
          </Card>
          {Object.entries(itemTypeCounts).map(([type, count]) => (
            <Card key={type}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total {type}</CardTitle>
                {type === "PRINTER" && <PrinterIcon className="h-8 w-8 text-muted-foreground" />}
                {type === "Laptop" && <LaptopIcon className="h-8 w-8 text-muted-foreground" />}
                {type === "Monitor" && <Monitor className="h-8 w-8 text-muted-foreground" />}
                {type === "Mouse" && <Mouse className="h-8 w-8 text-muted-foreground" />}
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{count}</p>
              </CardContent>
            </Card>
          ))}
          
        </div>

         {/* SBU Asset Map */}
        <div className="mt-8">
          <Card className="shadow-lg rounded-lg overflow-hidden border border-gray-200">
            <CardHeader>
              <CardTitle className="text-3xl text-center font-bold">Distribusi Aset per SBU di Peta</CardTitle>
            </CardHeader>
            <CardContent>
              <SbuAssetMap items={items} />
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Distribusi Aset per Perusahaan (SBU)</CardTitle>
            </CardHeader>
            <CardContent>
              <ItemsBySbuChart items={items} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Distribusi Aset per Departemen</CardTitle>
            </CardHeader>
            <CardContent>
              <ItemsByDepartmentChart items={items} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Distribusi Aset per Lokasi</CardTitle>
            </CardHeader>
            <CardContent>
              <ItemsByLocationChart items={items} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Ikhtisar Status Aset</CardTitle>
            </CardHeader>
            <CardContent>
              <ItemsByStatusChart items={items} />
            </CardContent>
          </Card>
          <Card className="grid col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Item per Pengguna (Top 5)</CardTitle>
            </CardHeader>
            <CardContent>
              <ItemsByUserChart items={items} users={users} />
            </CardContent>
          </Card>
        </div>

       
      </main>
    </div>
  );
}

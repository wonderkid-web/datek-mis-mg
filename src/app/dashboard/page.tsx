"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAssetTotal, getAssetBreakdownByCategory } from "@/lib/assetService";
import { Package, Laptop, Cpu, Printer } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import AssetStatusChart from "@/components/charts/AssetStatusChart";
import AssetCategoryChart from "@/components/charts/AssetCategoryChart";

// Dynamically import the map component to avoid SSR issues with Leaflet
const AssetLocationMap = dynamic(
  () => import("@/components/charts/AssetLocationMap"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[400px] w-full" />,
  }
);

function DashboardPage() {
  const { data: assetTotal, isLoading: isLoadingTotal } = useQuery({
    queryKey: ["assetTotal"],
    queryFn: getAssetTotal,
  });

  const { data: categoryBreakdown, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["assetCategoryBreakdown"],
    queryFn: getAssetBreakdownByCategory,
  });

  const getCategoryTotal = (categoryName: string) => {
    if (!categoryBreakdown) return 0;
    const category = categoryBreakdown.find((c) => c.name === categoryName);
    return category ? category.total : 0;
  };

  const isLoading = isLoadingTotal || isLoadingCategories;

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {isLoading ? (
          <>
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Aset</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{assetTotal}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Laptop</CardTitle>
                <Laptop className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {getCategoryTotal("Laptop")}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Intel NUC</CardTitle>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {getCategoryTotal("Intel NUC")}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Printer</CardTitle>
                <Printer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {getCategoryTotal("Printer")}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Main Dashboard Layout (Map and Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Map */}
        <div className="lg:col-span-2">
          <AssetLocationMap />
        </div>

        {/* Right Column: Charts */}
        <div className="space-y-6">
          <AssetCategoryChart />
          <AssetStatusChart />
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;

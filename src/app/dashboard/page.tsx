"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getAssetTotal,
  getAssetBreakdownByLocation,
  getOperatingSystemBreakdown,
  getTotalIdleAssets,
} from "@/lib/assetService";
import { Package, Laptop, Cpu, Printer, UserX, Monitor, Wifi } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AssetsDetailDialog } from "@/components/dialogs/AssetDetailDialog";
import { IpAddressesDetailDialog } from "@/components/dialogs/IpAddressDetailDialog";

import { getAssetCategories } from "@/lib/assetCategoryService";
import { getIpAddressTotal, getIpAddressBreakdownByLocation } from "@/lib/ipAddressService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ItemsByLocationChart from "@/components/charts/ItemsByLocationChart";
import CategoryBreakdownChart from "@/components/charts/CategoryBreakdownChart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SbuDistributionMap = dynamic(
  () => import("@/components/maps/SbuDistributionMap"),
  { ssr: false }
);

function DashboardPage() {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogFilters, setDialogFilters] = useState({});
  const [isIpDialogOpen, setIpDialogOpen] = useState(false);
  const [ipDialogTitle, setIpDialogTitle] = useState("");
  const [ipDialogFilters, setIpDialogFilters] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState("card");

  const { data: assetTotal, isLoading: isLoadingTotal } = useQuery({
    queryKey: ["assetTotal"],
    queryFn: getAssetTotal,
  });

  const { data: assetBreakdown, isLoading: isLoadingBreakdown } = useQuery({
    queryKey: ["assetBreakdown"],
    queryFn: getAssetBreakdownByLocation,
  });

  const { data: ipTotal, isLoading: isLoadingIpTotal } = useQuery({
    queryKey: ["ipTotal"],
    queryFn: getIpAddressTotal,
  });

  const { data: ipBreakdown, isLoading: isLoadingIpBreakdown } = useQuery({
    queryKey: ["ipBreakdown"],
    queryFn: getIpAddressBreakdownByLocation,
  });

  const { data: osBreakdown, isLoading: isLoadingOs } = useQuery({
    queryKey: ["osBreakdown"],
    queryFn: getOperatingSystemBreakdown,
  });

  const { data: idleAssets, isLoading: isLoadingIdle } = useQuery({
    queryKey: ["idleAssets"],
    queryFn: getTotalIdleAssets,
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["assetCategories"],
    queryFn: getAssetCategories,
  });

  const handleCardClick = (title: string, filters: Record<string, any>) => {
    setDialogTitle(title);
    setDialogFilters(filters);
    setDialogOpen(true);
  };

  const getGlobalCategoryTotal = (categoryName: string) => {
    if (!assetBreakdown) return 0;
    return assetBreakdown
      .flatMap((location) => location.data)
      .filter((d) => d.name === categoryName)
      .reduce((sum, item) => sum + item.total, 0);
  };

  const handleIpCardClick = (title: string, filters: Record<string, any>) => {
    setIpDialogTitle(title);
    setIpDialogFilters(filters);
    setIpDialogOpen(true);
  };

  const getLocationCategoryTotal = (
    locationData: { name: string; total: number }[],
    categoryName: string
  ) => {
    const category = locationData.find((d) => d.name === categoryName);
    return category ? category.total : 0;
  };

  const getOsTotal = (osName: string) => {
    if (!osBreakdown) return 0;
    const os = osBreakdown.find((o) => o.name === osName);
    return os ? os.total : 0;
  };

  const getCategoryId = (name: string) => {
    return categories?.find((c) => c.nama === name)?.id;
  };

  const isLoading = isLoadingTotal || isLoadingBreakdown || isLoadingOs || isLoadingIdle || isLoadingCategories || isLoadingIpTotal || isLoadingIpBreakdown;

  const getIpCountForLocation = (location: string) => {
    if (!ipBreakdown) return 0;
    const row = ipBreakdown.find((r) => r.location === location);
    return row ? row.total : 0;
  };

  const locationTotals = useMemo(
    () =>
      assetBreakdown?.map((locationData) => ({
        location: locationData.location,
        total: locationData.data.reduce((sum, item) => sum + item.total, 0),
      })) ?? [],
    [assetBreakdown]
  );

  const topLocationTotals = useMemo(
    () => locationTotals.slice().sort((a, b) => b.total - a.total).slice(0, 8),
    [locationTotals]
  );

  const categoryDistribution = useMemo(() => {
    if (!assetBreakdown) return [];
    const totals = new Map<string, number>();
    assetBreakdown.forEach((locationData) => {
      locationData.data.forEach(({ name, total }) => {
        totals.set(name, (totals.get(name) ?? 0) + total);
      });
    });

    return Array.from(totals.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
  }, [assetBreakdown]);

  const topCategoryDistribution = useMemo(
    () => categoryDistribution.slice(0, 10),
    [categoryDistribution]
  );

  const totalAssetsCount = assetTotal ?? 0;
  const idleAssetsCount = idleAssets ?? 0;
  const activeAssetsCount = Math.max(totalAssetsCount - idleAssetsCount, 0);
  const totalIpCount = ipTotal ?? 0;

  const osOverview = useMemo(
    () =>
      (osBreakdown ?? []).map((item) => ({
        name: item.name,
        total: item.total,
        percentage: totalAssetsCount
          ? (item.total / totalAssetsCount) * 100
          : 0,
      })),
    [osBreakdown, totalAssetsCount]
  );

  const locationInsights = useMemo(() => {
    if (!assetBreakdown) return [];
    return assetBreakdown.map((locationData) => {
      const totalAssetsAtLocation = locationData.data.reduce(
        (sum, item) => sum + item.total,
        0
      );

      let topCategoryName = "-";
      let topCategoryCount = 0;

      locationData.data.forEach((item) => {
        if (item.total > topCategoryCount) {
          topCategoryCount = item.total;
          topCategoryName = item.name;
        }
      });

      const ipCount =
        ipBreakdown?.find(
          (row) => row.location === locationData.location
        )?.total ?? 0;

      return {
        location: locationData.location,
        totalAssets: totalAssetsAtLocation,
        topCategory: topCategoryName,
        topCategoryCount,
        ipCount,
      };
    });
  }, [assetBreakdown, ipBreakdown]);

  const sortedLocationInsights = useMemo(
    () => locationInsights.slice().sort((a, b) => b.totalAssets - a.totalAssets),
    [locationInsights]
  );

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto py-10">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full max-w-xs grid-cols-2">
              <TabsTrigger value="card">Card</TabsTrigger>
              <TabsTrigger value="chart">Chart</TabsTrigger>
            </TabsList>

            <TabsContent value="card" className="space-y-10 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div
                  className="cursor-pointer hover:ring-2 hover:ring-primary rounded-lg transition-all"
                  onClick={() => handleCardClick("All Assets", {})}
                >
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Aset
                      </CardTitle>
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{assetTotal}</div>
                    </CardContent>
                  </Card>
                </div>
                <div
                  className="cursor-pointer hover:ring-2 hover:ring-primary rounded-lg transition-all"
                  onClick={() =>
                    handleCardClick("Laptops", { categoryId: getCategoryId("Laptop") })
                  }
                >
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Laptop
                      </CardTitle>
                      <Laptop className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {getGlobalCategoryTotal("Laptop")}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div
                  className="cursor-pointer hover:ring-2 hover:ring-primary rounded-lg transition-all"
                  onClick={() =>
                    handleCardClick("Intel NUCs", {
                      categoryId: getCategoryId("Intel NUC"),
                    })
                  }
                >
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Intel NUC
                      </CardTitle>
                      <Cpu className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {getGlobalCategoryTotal("Intel NUC")}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div
                  className="cursor-pointer hover:ring-2 hover:ring-primary rounded-lg transition-all"
                  onClick={() =>
                    handleCardClick("Printers", { categoryId: getCategoryId("Printer") })
                  }
                >
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Printer
                      </CardTitle>
                      <Printer className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {getGlobalCategoryTotal("Printer")}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div
                  className="cursor-pointer hover:ring-2 hover:ring-primary rounded-lg transition-all"
                  onClick={() => handleIpCardClick("IP Addresses", {})}
                >
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total IP Address</CardTitle>
                      <Wifi className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{ipTotal || 0}</div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="space-y-8">
                {assetBreakdown?.map((locationData) => (
                  <div key={locationData.location}>
                    <h2 className="text-xl font-bold mb-4">
                      {locationData.location}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div
                        className="cursor-pointer hover:ring-2 hover:ring-primary rounded-lg transition-all"
                        onClick={() =>
                          handleCardClick(`All Assets in ${locationData.location}`, {
                            lokasiFisik: locationData.location,
                          })
                        }
                      >
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                              Total Items
                            </CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              {locationData.data.reduce(
                                (sum, item) => sum + item.total,
                                0
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      <div
                        className="cursor-pointer hover:ring-2 hover:ring-primary rounded-lg transition-all"
                        onClick={() =>
                          handleCardClick(`Laptops in ${locationData.location}`, {
                            lokasiFisik: locationData.location,
                            categoryId: getCategoryId("Laptop"),
                          })
                        }
                      >
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                              Laptops
                            </CardTitle>
                            <Laptop className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              {getLocationCategoryTotal(locationData.data, "Laptop")}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      <div
                        className="cursor-pointer hover:ring-2 hover:ring-primary rounded-lg transition-all"
                        onClick={() =>
                          handleCardClick(`Intel NUCs in ${locationData.location}`, {
                            lokasiFisik: locationData.location,
                            categoryId: getCategoryId("Intel NUC"),
                          })
                        }
                      >
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                              Intel NUCs
                            </CardTitle>
                            <Cpu className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              {getLocationCategoryTotal(
                                locationData.data,
                                "Intel NUC"
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      <div
                        className="cursor-pointer hover:ring-2 hover:ring-primary rounded-lg transition-all"
                        onClick={() =>
                          handleCardClick(`Printers in ${locationData.location}`, {
                            lokasiFisik: locationData.location,
                            categoryId: getCategoryId("Printer"),
                          })
                        }
                      >
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                              Printers
                            </CardTitle>
                            <Printer className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              {getLocationCategoryTotal(locationData.data, "Printer")}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      <div
                        className="cursor-pointer hover:ring-2 hover:ring-primary rounded-lg transition-all"
                        onClick={() =>
                          handleIpCardClick(`IP Addresses in ${locationData.location}`, {
                            company: locationData.location,
                          })
                        }
                      >
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">IP Addresses</CardTitle>
                            <Wifi className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              {getIpCountForLocation(locationData.location)}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4">
                  Management Information Systems
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div
                    className="cursor-pointer hover:ring-2 hover:ring-primary rounded-lg transition-all"
                    onClick={() =>
                      handleCardClick("Windows 11 Pro", {
                        osValue: "Windows 11 Pro 64 Bit",
                      })
                    }
                  >
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Windows 11 Pro
                        </CardTitle>
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {getOsTotal("Windows 11 Pro 64 Bit")}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <div
                    className="cursor-pointer hover:ring-2 hover:ring-primary rounded-lg transition-all"
                    onClick={() =>
                      handleCardClick("Windows 11 Home", {
                        osValue: "Windows 11 Home SL 64 Bit",
                      })
                    }
                  >
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Windows 11 Home
                        </CardTitle>
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {getOsTotal("Windows 11 Home SL 64 Bit")}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <div
                    className="cursor-pointer hover:ring-2 hover:ring-primary rounded-lg transition-all"
                    onClick={() =>
                      handleCardClick("Windows 10 Pro", {
                        osValue: "Windows 10 Pro 64 Bit",
                      })
                    }
                  >
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Windows 10 Pro
                        </CardTitle>
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {getOsTotal("Windows 10 Pro 64 Bit")}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div
                    className="cursor-pointer hover:ring-2 hover:ring-primary rounded-lg transition-all"
                    onClick={() =>
                      handleCardClick("Windows 10 Home", {
                        osValue: "Windows 10 Home SL 64 Bit",
                      })
                    }
                  >
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Windows 10 Home
                        </CardTitle>
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {getOsTotal("Windows 10 Home SL 64 Bit")}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <div
                    className="cursor-pointer hover:ring-2 hover:ring-primary rounded-lg transition-all"
                    onClick={() =>
                      handleCardClick("Idle Assets", { idleOnly: true })
                    }
                  >
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Idle Assets</CardTitle>
                        <UserX className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{idleAssets}</div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="chart" className="space-y-10 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {totalAssetsCount.toLocaleString("id-ID")}
                    </div>
                    <CardDescription className="mt-1">
                      Semua aset yang tercatat di sistem
                    </CardDescription>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Assets</CardTitle>
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {activeAssetsCount.toLocaleString("id-ID")}
                    </div>
                    <CardDescription className="mt-1">
                      {totalAssetsCount
                        ? `${Math.round((activeAssetsCount / totalAssetsCount) * 100)}% dari total aset`
                        : "Tidak ada data"}
                    </CardDescription>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Idle Assets</CardTitle>
                    <UserX className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {idleAssetsCount.toLocaleString("id-ID")}
                    </div>
                    <CardDescription className="mt-1">
                      {totalAssetsCount
                        ? `${Math.round((idleAssetsCount / totalAssetsCount) * 100)}% dari total aset`
                        : "Tidak ada data"}
                    </CardDescription>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total IP Address</CardTitle>
                    <Wifi className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {totalIpCount.toLocaleString("id-ID")}
                    </div>
                    <CardDescription className="mt-1">
                      IP aktif yang teralokasi per lokasi
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Sebaran SBU</CardTitle>
                  <CardDescription>
                    Peta lokasi perusahaan beserta ringkasan aset dan IP
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[420px] p-0">
                  <SbuDistributionMap locations={locationInsights} />
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Distribusi Aset per Lokasi</CardTitle>
                    <CardDescription>
                      Lokasi dengan jumlah aset terbanyak
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {topLocationTotals.length ? (
                      <ItemsByLocationChart data={topLocationTotals} />
                    ) : (
                      <div className="flex h-[350px] items-center justify-center text-sm text-muted-foreground">
                        Data lokasi belum tersedia
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Top Kategori Aset</CardTitle>
                    <CardDescription>
                      10 kategori dengan inventaris terbanyak
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {topCategoryDistribution.length ? (
                      <CategoryBreakdownChart data={topCategoryDistribution} />
                    ) : (
                      <div className="flex h-[350px] items-center justify-center text-sm text-muted-foreground">
                        Data kategori belum tersedia
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Ringkasan Lokasi</CardTitle>
                    <CardDescription>
                      Gabungan aset, kategori teratas, dan alokasi IP
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {sortedLocationInsights.length ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Lokasi</TableHead>
                            <TableHead className="text-right">Aset</TableHead>
                            <TableHead>Top Kategori</TableHead>
                            <TableHead className="text-right">IP</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sortedLocationInsights.slice(0, 8).map((row) => (
                            <TableRow key={row.location}>
                              <TableCell>{row.location}</TableCell>
                              <TableCell className="text-right">
                                {row.totalAssets.toLocaleString("id-ID")}
                              </TableCell>
                              <TableCell>
                                {row.topCategory} ({row.topCategoryCount})
                              </TableCell>
                              <TableCell className="text-right">
                                {row.ipCount.toLocaleString("id-ID")}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Ringkasan lokasi belum tersedia.
                      </p>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Jejak Sistem Operasi</CardTitle>
                    <CardDescription>
                      Presentase instalasi OS terhadap total aset
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {osOverview.length ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Sistem Operasi</TableHead>
                            <TableHead className="text-right">Aset</TableHead>
                            <TableHead className="text-right">Presentase</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {osOverview
                            .slice()
                            .sort((a, b) => b.total - a.total)
                            .map((row) => (
                              <TableRow key={row.name}>
                                <TableCell>{row.name}</TableCell>
                                <TableCell className="text-right">
                                  {row.total.toLocaleString("id-ID")}
                                </TableCell>
                                <TableCell className="text-right">
                                  {totalAssetsCount
                                    ? `${row.percentage.toFixed(1)}%`
                                    : "-"}
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Data sistem operasi belum tersedia.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <AssetsDetailDialog
        isOpen={isDialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogTitle}
        filters={dialogFilters}
      />
      <IpAddressesDetailDialog
        isOpen={isIpDialogOpen}
        onOpenChange={setIpDialogOpen}
        title={ipDialogTitle}
        filters={ipDialogFilters}
      />
    </>
  );
}

export default DashboardPage;

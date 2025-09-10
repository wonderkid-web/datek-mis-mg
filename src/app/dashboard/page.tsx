"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getAssetTotal,
  getAssetBreakdownByLocation,
  getOperatingSystemBreakdown,
  getTotalIdleAssets,
} from "@/lib/assetService";
import { Package, Laptop, Cpu, Printer, UserX, Monitor } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AssetsDetailDialog } from "@/components/dialogs/AssetDetailDialog";

import { getAssetCategories } from "@/lib/assetCategoryService";

function DashboardPage() {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogFilters, setDialogFilters] = useState({});

  const { data: assetTotal, isLoading: isLoadingTotal } = useQuery({
    queryKey: ["assetTotal"],
    queryFn: getAssetTotal,
  });

  const { data: assetBreakdown, isLoading: isLoadingBreakdown } = useQuery({
    queryKey: ["assetBreakdown"],
    queryFn: getAssetBreakdownByLocation,
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

  const isLoading = isLoadingTotal || isLoadingBreakdown || isLoadingOs || isLoadingIdle || isLoadingCategories;

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
        </div>

        <div className="space-y-8">
          {assetBreakdown?.map((locationData) => (
            <div key={locationData.location}>
              <h2 className="text-xl font-bold mb-4">
                {locationData.location}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
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
      </div>
      <AssetsDetailDialog
        isOpen={isDialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogTitle}
        filters={dialogFilters}
      />
    </>
  );
}

export default DashboardPage;

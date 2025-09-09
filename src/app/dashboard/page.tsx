import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CategoryBreakdownChart from "@/components/charts/CategoryBreakdownChart";
import { getAssetTotal, getAssetBreakdownByLocation } from "@/lib/assetService";
import { Package, Laptop, Cpu, Printer } from "lucide-react";

async function DashboardPage() {
  const assetTotal = await getAssetTotal();
  const assetBreakdown = await getAssetBreakdownByLocation();

  // Helper to get total for the top cards
  const getCategoryTotal = (categoryName: string) => {
    return assetBreakdown
      .flatMap((location) => location.data)
      .filter((d) => d.name === categoryName)
      .reduce((sum, item) => sum + item.total, 0);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
            <CardTitle className="text-sm font-medium">Total Laptop</CardTitle>
            <Laptop className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getCategoryTotal("Laptop")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Intel NUC</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getCategoryTotal("Intel NUC")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Printer</CardTitle>
            <Printer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getCategoryTotal("Printer")}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {assetBreakdown.map((locationData) => (
          <Card key={locationData.location}>
            <CardHeader>
              <CardTitle>{locationData.location}</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryBreakdownChart data={locationData.data} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default DashboardPage;

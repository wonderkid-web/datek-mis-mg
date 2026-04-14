import { AssetImportPanel } from "@/components/items/AssetImportPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ImportAssetPage() {
  return (
    <div className="container mx-auto space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold">Import Asset</h1>
        <p className="text-sm text-muted-foreground">
          Bulk create asset dengan nama master data. Sistem akan resolve nama ke ID saat preview/import.
        </p>
      </div>

      <Tabs defaultValue="LAPTOP" className="space-y-4">
        <TabsList>
          <TabsTrigger value="LAPTOP">Laptop</TabsTrigger>
          <TabsTrigger value="INTEL_NUC">Intel NUC</TabsTrigger>
          <TabsTrigger value="PC">PC</TabsTrigger>
        </TabsList>

        <TabsContent value="LAPTOP">
          <AssetImportPanel family="LAPTOP" />
        </TabsContent>
        <TabsContent value="INTEL_NUC">
          <AssetImportPanel family="INTEL_NUC" />
        </TabsContent>
        <TabsContent value="PC">
          <AssetImportPanel family="PC" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

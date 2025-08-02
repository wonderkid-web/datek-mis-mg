import BrandOptionsPage from "./brand-options/page";
import TypeOptionsPage from "./type-options/page";
import ModelOptionsPage from "./model-options/page";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MasterDataPrinterPage() {
  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Master Data Printer</CardTitle>
          <CardDescription>
            Kelola semua data master yang berkaitan dengan aset printer. Pilih
            salah satu tab untuk melihat dan mengelola opsi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="brand" className="w-full">
            <TabsList className="h-auto flex-wrap">
              <TabsTrigger value="brand">Brand</TabsTrigger>
              <TabsTrigger value="type">Type</TabsTrigger>
              <TabsTrigger value="model">Model</TabsTrigger>
            </TabsList>

            {/* Contents */}
            <TabsContent value="brand">
              <BrandOptionsPage />
            </TabsContent>
            <TabsContent value="type">
              <TypeOptionsPage />
            </TabsContent>
            <TabsContent value="model">
              <ModelOptionsPage />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

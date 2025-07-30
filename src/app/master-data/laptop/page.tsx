import BrandOptionsPage from "./brand-options/page";
import ColorOptionsPage from "./color-options/page";
import GraphicOptionsPage from "./graphic-options/page";
import MicrosoftOfficeOptionsPage from "./microsoft-office-options/page";
import OsOptionsPage from "./os-options/page";
import PowerOptionsPage from "./power-options/page";
import ProcessorOptionsPage from "./processor-options/page";
import RamOptionsPage from "./ram-options/page";
import StorageOptionsPage from "./storage-options/page";
import TypeOptionsPage from "./type-options/page";
import VgaOptionsPage from "./vga-options/page";
import LicenseOptionsPage from "./license-options/page";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MasterDataLaptopPage() {
  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Master Data Laptop</CardTitle>
          <CardDescription>
            Kelola semua data master yang berkaitan dengan aset laptop. Pilih
            salah satu tab untuk melihat dan mengelola opsi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="brand" className="w-full">
            <TabsList className="h-auto flex-wrap">
              <TabsTrigger value="brand">Brand</TabsTrigger>
              <TabsTrigger value="type">Type</TabsTrigger>
              <TabsTrigger value="processor">Processor</TabsTrigger>
              <TabsTrigger value="ram">RAM</TabsTrigger>
              <TabsTrigger value="storage">Storage</TabsTrigger>
              <TabsTrigger value="graphic">Graphic</TabsTrigger>
              <TabsTrigger value="power">Power Adaptor</TabsTrigger>
              {/* <TabsTrigger value="vga">VGA</TabsTrigger> */}
              <TabsTrigger value="colors">Color</TabsTrigger>
              <TabsTrigger value="os">Operation Systems</TabsTrigger>
              <TabsTrigger value="license">Product License</TabsTrigger>
              <TabsTrigger value="office">Office Tools</TabsTrigger>
            </TabsList>

            {/* Contents */}
            <TabsContent value="brand">
              <BrandOptionsPage />
            </TabsContent>
            <TabsContent value="type">
              <TypeOptionsPage />
            </TabsContent>
            <TabsContent value="processor">
              <ProcessorOptionsPage />
            </TabsContent>
            <TabsContent value="ram">
              <RamOptionsPage />
            </TabsContent>
            <TabsContent value="storage">
              <StorageOptionsPage />
            </TabsContent>
            <TabsContent value="graphic">
              <GraphicOptionsPage />
            </TabsContent>
            <TabsContent value="vga">
              <VgaOptionsPage />
            </TabsContent>
            <TabsContent value="colors">
              <ColorOptionsPage />
            </TabsContent>
            <TabsContent value="os">
              <OsOptionsPage />
            </TabsContent>
            <TabsContent value="power">
              <PowerOptionsPage />
            </TabsContent>
            <TabsContent value="office">
              <MicrosoftOfficeOptionsPage />
            </TabsContent>
            <TabsContent value="license">
              <LicenseOptionsPage />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}


import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RamOptionsPage from "./ram-options/page";
import ProcessorOptionsPage from "./processor-options/page";
import StorageOptionsPage from "./storage-options/page";
import OsOptionsPage from "./os-options/page";
import VgaOptionsPage from "./vga-options/page";
import ScreenSizeOptionsPage from "./screen-size-options/page";
import ColorOptionsPage from "./color-options/page";
import PortOptionsPage from "./port-options/page";
import PowerOptionsPage from "./power-options/page";
import MicrosoftOfficeOptionsPage from "./microsoft-office-options/page";

export default function MasterDataLaptopPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Master Data - Laptop</h1>
      <Tabs defaultValue="ram">
        <TabsList>
          <TabsTrigger value="ram">RAM</TabsTrigger>
          <TabsTrigger value="processor">Processor</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="os">OS</TabsTrigger>
          <TabsTrigger value="vga">VGA</TabsTrigger>
          <TabsTrigger value="screenSizes">Ukuran Layar</TabsTrigger>
          <TabsTrigger value="colors">Warna</TabsTrigger>
          <TabsTrigger value="port">Port</TabsTrigger>
          <TabsTrigger value="power">Power</TabsTrigger>
          <TabsTrigger value="office">Microsoft Office</TabsTrigger>
        </TabsList>
        <TabsContent value="ram">
          <RamOptionsPage />
        </TabsContent>
        <TabsContent value="processor">
          <ProcessorOptionsPage />
        </TabsContent>
        <TabsContent value="storage">
          <StorageOptionsPage />
        </TabsContent>
        <TabsContent value="os">
          <OsOptionsPage />
        </TabsContent>
        <TabsContent value="vga">
          <VgaOptionsPage />
        </TabsContent>
        <TabsContent value="screenSizes">
          <ScreenSizeOptionsPage />
        </TabsContent>
        <TabsContent value="colors">
          <ColorOptionsPage />
        </TabsContent>
        <TabsContent value="port">
          <PortOptionsPage />
        </TabsContent>
        <TabsContent value="power">
          <PowerOptionsPage />
        </TabsContent>
        <TabsContent value="office">
          <MicrosoftOfficeOptionsPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}

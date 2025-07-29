import RamOptionsPage from "./ram-options/page";
import ProcessorOptionsPage from "./processor-options/page";
import StorageOptionsPage from "./storage-options/page";
import OsOptionsPage from "./os-options/page";
import ColorOptionsPage from "./color-options/page";
import PortOptionsPage from "./port-options/page";
import PowerOptionsPage from "./power-options/page";
import MicrosoftOfficeOptionsPage from "./microsoft-office-options/page";
import BrandOptionsPage from "./brand-options/page";
import TypeOptionsPage from "./type-options/page";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MasterDataLaptopPage() {
  return (
    <Tabs defaultValue="ram">
      <TabsList>
        <TabsTrigger value="brand">Brand</TabsTrigger>
        <TabsTrigger value="type">Type</TabsTrigger>
        <TabsTrigger value="processor">Processor</TabsTrigger>
        <TabsTrigger value="ram">RAM</TabsTrigger>
        <TabsTrigger value="storage">Storage</TabsTrigger>
        <TabsTrigger value="port">Graphic</TabsTrigger>
        <TabsTrigger value="colors">Color</TabsTrigger>
        <TabsTrigger value="os">Operation Systems</TabsTrigger>
        {/* <TabsTrigger value="port">Port</TabsTrigger> */}
        <TabsTrigger value="power">Power Adaptor</TabsTrigger>
        <TabsTrigger value="office">Office Tools</TabsTrigger>
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
      <TabsContent value="brand">
        <BrandOptionsPage />
      </TabsContent>
      <TabsContent value="type">
        <TypeOptionsPage />
      </TabsContent>
    </Tabs>
  );
}

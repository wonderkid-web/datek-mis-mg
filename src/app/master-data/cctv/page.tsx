import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BrandPage from "./brand/page";
import ModelPage from "./model/page";
import DeviceTypePage from "./device-type/page";
import ChannelCameraPage from "./channel-camera/page";

export default function MasterDataCctvPage() {
  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>CCTV Specifications</CardTitle>
          <CardDescription>
            Manage all master data related to CCTV assets. Select a tab to view and manage options.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="brand" className="w-full">
            <TabsList className="h-auto flex-wrap">
              <TabsTrigger value="brand">Brand</TabsTrigger>
              <TabsTrigger value="model">Model</TabsTrigger>
              <TabsTrigger value="device-type">Device Type</TabsTrigger>
              <TabsTrigger value="channel-camera">Channel Camera</TabsTrigger>
            </TabsList>

            <TabsContent value="brand">
              <BrandPage />
            </TabsContent>
            <TabsContent value="model">
              <ModelPage />
            </TabsContent>
            <TabsContent value="device-type">
              <DeviceTypePage />
            </TabsContent>
            <TabsContent value="channel-camera">
              <ChannelCameraPage />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
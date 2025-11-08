"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createAssetAndCctvSpecs } from "@/lib/cctvService";
import { getCctvBrands } from "@/lib/cctvBrandService";
import { getCctvModels } from "@/lib/cctvModelService";
import { getCctvDeviceTypes } from "@/lib/cctvDeviceTypeService";
import { getCctvChannelCameras } from "@/lib/cctvChannelCameraService";
import { getAssetCategories } from "@/lib/assetCategoryService";
import { SBU_OPTIONS } from "@/lib/constants";
import { CctvBrand, CctvModel, CctvDeviceType, CctvChannelCamera, AssetCategory } from "@prisma/client";
import { Asset, CctvSpecs } from "@/lib/types";

interface AddCctvDialogProps {
  onSave: () => void;
}

export function AddCctvDialog({ onSave }: AddCctvDialogProps) {
  const [open, setOpen] = useState(false);
  const [sbu, setSbu] = useState("");
  const [noAsset, setNoAsset] = useState("");
  const [channelCameraId, setChannelCameraId] = useState<number | null>(null);
  const [nameSite, setNameSite] = useState("");
  const [viewCamera, setViewCamera] = useState("");
  const [brandId, setBrandId] = useState<number | null>(null);
  const [modelId, setModelId] = useState<number | null>(null);
  const [deviceTypeId, setDeviceTypeId] = useState<number | null>(null);
  const [serialNumber, setSerialNumber] = useState("");
  const [systemVersion, setSystemVersion] = useState("");
  const [power, setPower] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [macAddress, setMacAddress] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [brandOptions, setBrandOptions] = useState<CctvBrand[]>([]);
  const [modelOptions, setModelOptions] = useState<CctvModel[]>([]);
  const [deviceTypeOptions, setDeviceTypeOptions] = useState<CctvDeviceType[]>([]);
  const [channelCameraOptions, setChannelCameraOptions] = useState<CctvChannelCamera[]>([]);
  const [assetCategories, setAssetCategories] = useState<AssetCategory[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setBrandOptions(await getCctvBrands());
        setModelOptions(await getCctvModels());
        setDeviceTypeOptions(await getCctvDeviceTypes());
        setChannelCameraOptions(await getCctvChannelCameras());
        setAssetCategories(await getAssetCategories());
      } catch (error) {
        console.error("Failed to fetch options:", error);
        toast.error("Failed to load selection data.");
      }
    };
    fetchOptions();
  }, []);

  const handleSubmit = async () => {
    try {
      const cctvCategory = assetCategories.find(cat => cat.slug === 'cctv');
      if (!cctvCategory) {
        toast.error("CCTV Asset Category not found. Please create it in Master Data -> Asset Categories with slug 'cctv'.");
        return;
      }

      const assetData = {
        namaAsset: `${nameSite} - ${viewCamera}`,
        categoryId: cctvCategory.id, // Use dynamic ID
        nomorSeri: serialNumber,
        statusAsset: "GOOD",
      };

      const cctvSpecsData = {
        sbu,
        nameSite,
        viewCamera,
        systemVersion,
        power,
        ipAddress,
        macAddress,
        username,
        password,
        brandId,
        modelId,
        deviceTypeId,
        channelCameraId,
      };

      // @ts-expect-error some fields are intentionally omitted
      await createAssetAndCctvSpecs(assetData, cctvSpecsData);

      toast.success("CCTV asset added successfully!");
      onSave();
      setOpen(false);
    } catch (error) {
      console.error("An error occurred:", error);
      toast.error("Failed to add CCTV asset.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add New CCTV</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New CCTV Asset</DialogTitle>
          <DialogDescription>
            Fill in the details for the new CCTV asset.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sbu" className="text-right">Perusahaan</Label>
            <Select onValueChange={setSbu} value={sbu}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select SBU" />
              </SelectTrigger>
              <SelectContent>
                {SBU_OPTIONS.map((sbu) => (
                  <SelectItem key={sbu} value={sbu}>
                    {sbu.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="noAsset" className="text-right">Number Asset</Label>
            <Input id="noAsset" value={noAsset} onChange={(e) => setNoAsset(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="channelCamera" className="text-right">Channel Camera</Label>
            <Select onValueChange={(value) => setChannelCameraId(Number(value))}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select Channel Camera" />
              </SelectTrigger>
              <SelectContent>
                {channelCameraOptions.map((opt) => (
                  <SelectItem key={opt.id} value={String(opt.id)}>
                    {opt.sbu} - {opt.lokasi}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nameSite" className="text-right">Name Site</Label>
            <Input id="nameSite" value={nameSite} onChange={(e) => setNameSite(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="viewCamera" className="text-right">View Camera</Label>
            <Input id="viewCamera" value={viewCamera} onChange={(e) => setViewCamera(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="brand" className="text-right">Brand</Label>
            <Select onValueChange={(value) => setBrandId(Number(value))}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select Brand" />
              </SelectTrigger>
              <SelectContent>
                {brandOptions.map((opt) => (
                  <SelectItem key={opt.id} value={String(opt.id)}>
                    {opt.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="model" className="text-right">Model</Label>
            <Select onValueChange={(value) => setModelId(Number(value))}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select Model" />
              </SelectTrigger>
              <SelectContent>
                {modelOptions.map((opt) => (
                  <SelectItem key={opt.id} value={String(opt.id)}>
                    {opt.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="deviceType" className="text-right">Device Type</Label>
            <Select onValueChange={(value) => setDeviceTypeId(Number(value))}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select Device Type" />
              </SelectTrigger>
              <SelectContent>
                {deviceTypeOptions.map((opt) => (
                  <SelectItem key={opt.id} value={String(opt.id)}>
                    {opt.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="serialNumber" className="text-right">Serial Number</Label>
            <Input id="serialNumber" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="systemVersion" className="text-right">System Version</Label>
            <Input id="systemVersion" value={systemVersion} onChange={(e) => setSystemVersion(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="power" className="text-right">Power</Label>
            <Input id="power" value={power} onChange={(e) => setPower(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ipAddress" className="text-right">IP Address</Label>
            <Input id="ipAddress" value={ipAddress} onChange={(e) => setIpAddress(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="macAddress" className="text-right">MAC Address</Label>
            <Input id="macAddress" value={macAddress} onChange={(e) => setMacAddress(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">Username</Label>
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>Save CCTV</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

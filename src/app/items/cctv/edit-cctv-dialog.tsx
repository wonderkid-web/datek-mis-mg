"use client";

import { useQuery } from "@tanstack/react-query";
import { updateAssetAndCctvSpecs } from "@/lib/cctvService";
import { getCctvBrands } from "@/lib/cctvBrandService";
import { getCctvModels } from "@/lib/cctvModelService";
import { getCctvDeviceTypes } from "@/lib/cctvDeviceTypeService";
import { getCctvChannelCameras } from "@/lib/cctvChannelCameraService";
import { SBU_OPTIONS } from "@/lib/constants";
import { CctvBrand, CctvModel, CctvDeviceType, CctvChannelCamera } from "@prisma/client";
import { Asset } from "@/lib/types";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";

interface EditCctvDialogProps {
  asset: Asset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export function EditCctvDialog({ asset, open, onOpenChange, onSave }: EditCctvDialogProps) {
  const [sbu, setSbu] = useState("");
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
  const [statusAsset, setStatusAsset] = useState("");

  const [brandOptions, setBrandOptions] = useState<CctvBrand[]>([]);
  const [modelOptions, setModelOptions] = useState<CctvModel[]>([]);
  const [deviceTypeOptions, setDeviceTypeOptions] = useState<CctvDeviceType[]>([]);
  const [channelCameraOptions, setChannelCameraOptions] = useState<CctvChannelCamera[]>([]);

  const { data: fullAsset, isLoading } = useQuery({
    queryKey: ["cctv-asset-edit", asset?.id],
    queryFn: async () => {
      if (!asset) return null;
      const res = await fetch(`/api/assets/${asset.id}`);
      if (!res.ok) {
        throw new Error("Failed to fetch asset details for editing.");
      }
      const result = await res.json();
      return result.data as Asset;
    },
    enabled: !!asset && open, // Only fetch when the dialog is open and an asset is selected
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setBrandOptions(await getCctvBrands());
        setModelOptions(await getCctvModels());
        setDeviceTypeOptions(await getCctvDeviceTypes());
        setChannelCameraOptions(await getCctvChannelCameras());
      } catch (error) {
        console.error("Failed to fetch options:", error);
        toast.error("Failed to load selection data.");
      }
    };
    if (open) {
      fetchOptions();
    }
  }, [open]);

  useEffect(() => {
    if (fullAsset) {
      setSbu(fullAsset.cctvSpecs?.sbu || "");
      setChannelCameraId(fullAsset.cctvSpecs?.channelCameraId || null);
      setNameSite(fullAsset.cctvSpecs?.nameSite || "");
      setViewCamera(fullAsset.cctvSpecs?.viewCamera || "");
      setBrandId(fullAsset.cctvSpecs?.brandId || null);
      setModelId(fullAsset.cctvSpecs?.modelId || null);
      setDeviceTypeId(fullAsset.cctvSpecs?.deviceTypeId || null);
      setSerialNumber(fullAsset.nomorSeri || "");
      setSystemVersion(fullAsset.cctvSpecs?.systemVersion || "");
      setPower(fullAsset.cctvSpecs?.power || "");
      setIpAddress(fullAsset.cctvSpecs?.ipAddress || "");
      setMacAddress(fullAsset.cctvSpecs?.macAddress || "");
      setUsername(fullAsset.cctvSpecs?.username || "");
      setPassword(""); // Do not pre-fill password
      setStatusAsset(fullAsset.statusAsset || "");
    }
  }, [fullAsset]);

  const handleSubmit = async () => {
    if (!asset) return;

    try {
      const assetData = {
        namaAsset: `${nameSite} - ${viewCamera}`,
        nomorSeri: serialNumber,
        statusAsset: statusAsset,
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
        ...(password && { password }), // Only include password if it's changed
        brandId,
        modelId,
        deviceTypeId,
        channelCameraId,
      };

      await updateAssetAndCctvSpecs(asset.id, assetData, cctvSpecsData);

      toast .success("CCTV asset updated successfully!");
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("An error occurred:", error);
      toast.error("Failed to update CCTV asset.");
    }
  };

  const renderForm = () => {
    if (isLoading) {
        return <div className="h-96 flex items-center justify-center">Loading form...</div>;
    }
    return (
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
          {/* Form fields are identical to AddCctvDialog, but pre-filled */}
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
            <Label htmlFor="statusAsset" className="text-right">Status</Label>
            <Select onValueChange={setStatusAsset} value={statusAsset}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GOOD">GOOD</SelectItem>
                <SelectItem value="SERVICE">SERVICE</SelectItem>
                <SelectItem value="RUSAK">RUSAK</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="channelCamera" className="text-right">Channel Camera</Label>
            <Select onValueChange={(value) => setChannelCameraId(Number(value))} value={channelCameraId ? String(channelCameraId) : undefined}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select Channel Camera" />
              </SelectTrigger>
              <SelectContent>
                {channelCameraOptions.map((opt) => (
                  <SelectItem key={opt.id} value={String(opt.id)}>
                    {opt.lokasi} ({opt.sbu.replace(/_/g, " ")})
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
            <Select onValueChange={(value) => setBrandId(Number(value))} value={brandId ? String(brandId) : undefined}>
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
            <Select onValueChange={(value) => setModelId(Number(value))} value={modelId ? String(modelId) : undefined}>
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
            <Select onValueChange={(value) => setDeviceTypeId(Number(value))} value={deviceTypeId ? String(deviceTypeId) : undefined}>
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
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="col-span-3" placeholder="Leave blank to keep unchanged" />
          </div>
        </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit CCTV Asset</DialogTitle>
          <DialogDescription>
            Update the details for the CCTV asset.
          </DialogDescription>
        </DialogHeader>
        {renderForm()}
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

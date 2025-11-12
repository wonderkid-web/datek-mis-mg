"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ReactSelect from "react-select";
import { updateAssetAndCctvSpecs } from "@/lib/cctvService";
import { getCctvBrands } from "@/lib/cctvBrandService";
import { getCctvModels } from "@/lib/cctvModelService";
import { getCctvDeviceTypes } from "@/lib/cctvDeviceTypeService";
import { getCctvChannelCameras } from "@/lib/cctvChannelCameraService";
import { SBU_OPTIONS } from "@/lib/constants";
import { CctvBrand, CctvModel, CctvDeviceType, CctvChannelCamera, Asset } from "@prisma/client";

interface EditCctvDialogProps {
  asset: Asset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

const SBU_GROUP_KEY = "PT_Intan_Sejati_Andalan_(Group)";
const sbuDropdownOptions = [
  ...SBU_OPTIONS.map(s => ({ value: s, label: s.replace(/_/g, " ") })),
  { value: SBU_GROUP_KEY, label: "PT Intan Sejati Andalan (Group)" }
].sort((a, b) => a.label.localeCompare(b.label));


export function EditCctvDialog({ asset, open, onOpenChange, onSave }: EditCctvDialogProps) {
  const [sbu, setSbu] = useState<string | null>(null);
  const [channelCameraId, setChannelCameraId] = useState<string | null>(null);
  const [viewCamera, setViewCamera] = useState("");
  const [brandId, setBrandId] = useState<string | null>(null);
  const [modelId, setModelId] = useState<string | null>(null);
  const [deviceTypeId, setDeviceTypeId] = useState<string | null>(null);
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

  const queryClient = useQueryClient();

  const { data: fullAsset, isLoading: isLoadingAsset } = useQuery({
    queryKey: ["cctv-asset-edit", asset?.id],
    queryFn: async () => {
      if (!asset) return null;
      const res = await fetch(`/api/assets/${asset.id}`);
      if (!res.ok) throw new Error("Failed to fetch asset details for editing.");
      const result = await res.json();
      return result.data as Asset;
    },
    enabled: !!asset && open,
  });

  useEffect(() => {
    if (!open) return;
    const fetchOptions = async () => {
      try {
        setBrandOptions(await getCctvBrands());
        setModelOptions(await getCctvModels());
        setDeviceTypeOptions(await getCctvDeviceTypes());
        setChannelCameraOptions(await getCctvChannelCameras());
      } catch (error) {
        toast.error("Failed to load selection data.");
      }
    };
    fetchOptions();
  }, [open]);

  useEffect(() => {
    if (fullAsset) {
      // @ts-expect-error cctvSpecs is a relation
      const specs = fullAsset.cctvSpecs;
      setSbu(specs?.sbu || null);
      setChannelCameraId(specs?.channelCameraId ? String(specs.channelCameraId) : null);
      setViewCamera(specs?.viewCamera || "");
      setBrandId(specs?.brandId ? String(specs.brandId) : null);
      setModelId(specs?.modelId ? String(specs.modelId) : null);
      setDeviceTypeId(specs?.deviceTypeId ? String(specs.deviceTypeId) : null);
      setSerialNumber(fullAsset.nomorSeri || "");
      setSystemVersion(specs?.systemVersion || "");
      setPower(specs?.power || "");
      setIpAddress(specs?.ipAddress || "");
      setMacAddress(specs?.macAddress || "");
      setUsername(specs?.username || "");
      setPassword("");
      setStatusAsset(fullAsset.statusAsset || "");
    }
  }, [fullAsset]);

  const filteredChannelCameraOptions = useMemo(() => {
    if (!sbu) return [];

    const normalize = (str: string) => str.replace(/[\s-]/g, "_").toLowerCase();

    if (sbu === SBU_GROUP_KEY) {
      const isaPrefix = normalize("PT_Intan_Sejati_Andalan");
      return channelCameraOptions
        .filter(opt => normalize(opt.sbu).startsWith(isaPrefix))
        .map(opt => ({ value: String(opt.id), label: `${opt.sbu.replace(/_/g, " ")} - ${opt.lokasi}` }));
    }

    const normalizedSbu = normalize(sbu);
    return channelCameraOptions
      .filter(opt => normalize(opt.sbu) === normalizedSbu)
      .map(opt => ({ value: String(opt.id), label: opt.lokasi }));
  }, [sbu, channelCameraOptions]);

  const mutation = useMutation({
    mutationFn: (vars: { id: number, assetData: any, cctvSpecsData: any }) =>
      updateAssetAndCctvSpecs(vars.id, vars.assetData, vars.cctvSpecsData),
    onSuccess: () => {
      toast.success("CCTV asset updated successfully!");
      // queryClient.invalidateQueries({ queryKey: ["cctvSpecs"] });
      onSave();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Failed to update asset: ${error.message}`);
    }
  });

  const handleSubmit = async () => {
    if (!asset) return;

    const selectedChannel = channelCameraOptions.find(opt => opt.id === Number(channelCameraId));
    if (!selectedChannel) {
      toast.error("Please select a valid Channel Camera.");
      return;
    }
    if (!sbu) {
      toast.error("Please select a Perusahaan (SBU).");
      return;
    }

    const assetData = {
      namaAsset: `${selectedChannel.lokasi} - ${viewCamera}`,
      nomorSeri: serialNumber,
      statusAsset: statusAsset,
    };

    const cctvSpecsData = {
      sbu,
      viewCamera,
      systemVersion,
      power,
      ipAddress,
      macAddress,
      username,
      ...(password && { password }),
      brandId: Number(brandId),
      modelId: Number(modelId),
      deviceTypeId: Number(deviceTypeId),
      channelCameraId: Number(channelCameraId),
    };

    console.log(sbu)

    mutation.mutate({ id: asset.id, assetData, cctvSpecsData });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit CCTV Asset</DialogTitle>
          <DialogDescription>Update the details for the CCTV asset.</DialogDescription>
        </DialogHeader>
        {isLoadingAsset ? <p>Loading asset data...</p> : (
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sbu" className="text-right">Perusahaan</Label>
              <ReactSelect
                className="col-span-3"
                options={sbuDropdownOptions}
                value={sbuDropdownOptions.find(opt => opt.value === sbu)}
                onChange={(opt) => {
                  setSbu(opt ? opt.value : null);
                  setChannelCameraId(null);
                }}
                placeholder="Select SBU"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="channelCamera" className="text-right">Channel Camera</Label>
              <ReactSelect
                className="col-span-3"
                options={channelCameraOptions.map(opt => ({ value: String(opt.id), label: opt.lokasi }))}
                value={channelCameraOptions.map(opt => ({ value: String(opt.id), label: opt.lokasi })).find(opt => opt.value === channelCameraId)}
                onChange={(opt) => setChannelCameraId(opt ? opt.value : null)}
                placeholder="Select Channel Camera"
                isDisabled={!sbu}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="viewCamera" className="text-right">View Camera</Label>
              <Input id="viewCamera" value={viewCamera} onChange={(e) => setViewCamera(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="brand" className="text-right">Brand</Label>
              <ReactSelect
                className="col-span-3"
                options={brandOptions.map(opt => ({ value: String(opt.id), label: opt.value }))}
                value={brandOptions.map(opt => ({ value: String(opt.id), label: opt.value })).find(opt => opt.value === brandId)}
                onChange={(opt) => setBrandId(opt ? opt.value : null)}
                placeholder="Select Brand"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="model" className="text-right">Model</Label>
              <ReactSelect
                className="col-span-3"
                options={modelOptions.map(opt => ({ value: String(opt.id), label: opt.value }))}
                value={modelOptions.map(opt => ({ value: String(opt.id), label: opt.value })).find(opt => opt.value === modelId)}
                onChange={(opt) => setModelId(opt ? opt.value : null)}
                placeholder="Select Model"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deviceType" className="text-right">Device Type</Label>
              <ReactSelect
                className="col-span-3"
                options={deviceTypeOptions.map(opt => ({ value: String(opt.id), label: opt.value }))}
                value={deviceTypeOptions.map(opt => ({ value: String(opt.id), label: opt.value })).find(opt => opt.value === deviceTypeId)}
                onChange={(opt) => setDeviceTypeId(opt ? opt.value : null)}
                placeholder="Select Device Type"
              />
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
              <Input id="password" type="text" value={password} onChange={(e) => setPassword(e.target.value)} className="col-span-3" placeholder="Leave blank to keep unchanged" />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
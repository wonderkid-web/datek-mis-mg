import { useState, useEffect, useMemo } from "react";
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
import { toast } from "sonner";
import ReactSelect from "react-select";
import { createAssetAndCctvSpecs } from "@/lib/cctvService";
import { getCctvBrands } from "@/lib/cctvBrandService";
import { getCctvModels } from "@/lib/cctvModelService";
import { getCctvDeviceTypes } from "@/lib/cctvDeviceTypeService";
import { getCctvChannelCameras } from "@/lib/cctvChannelCameraService";
import { getAssetCategories } from "@/lib/assetCategoryService";
import { SBU_OPTIONS } from "@/lib/constants";
import { CctvBrand, CctvModel, CctvDeviceType, CctvChannelCamera, AssetCategory } from "@prisma/client";

interface AddCctvDialogProps {
  onSave: () => void;
}


const SBU_GROUP_KEY = "PT_Intan_Sejati_Andalan_(Group)";
const sbuDropdownOptions = [
  ...SBU_OPTIONS.map(s => ({ value: s, label: s.replace(/_/g, " ") })),
  { value: SBU_GROUP_KEY, label: "PT Intan Sejati Andalan (Group)" }
].sort((a, b) => a.label.localeCompare(b.label));


export function AddCctvDialog({ onSave }: AddCctvDialogProps) {
  const [open, setOpen] = useState(false);
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

  const [brandOptions, setBrandOptions] = useState<CctvBrand[]>([]);
  const [modelOptions, setModelOptions] = useState<CctvModel[]>([]);
  const [deviceTypeOptions, setDeviceTypeOptions] = useState<CctvDeviceType[]>([]);
  const [channelCameraOptions, setChannelCameraOptions] = useState<CctvChannelCamera[]>([]);
  const [assetCategories, setAssetCategories] = useState<AssetCategory[]>([]);

  useEffect(() => {
    if (!open) return; // Don't fetch if the dialog is not open
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
  }, [open]);

  // const filteredChannelCameraOptions = useMemo(() => {
  //   if (!sbu) return [];

  //   const normalize = (str: string) => str.replace(/[\s-]/g, "_").toLowerCase();

  //   if (sbu === SBU_GROUP_KEY) {
  //     const isaPrefix = normalize("PT_Intan_Sejati_Andalan");
  //     return channelCameraOptions
  //       .filter(opt => normalize(opt.sbu).startsWith(isaPrefix))
  //       .map(opt => ({ value: String(opt.id), label: `${opt.sbu.replace(/_/g, " ")} - ${opt.lokasi}` }));
  //   }

  //   const normalizedSbu = normalize(sbu);
  //   return channelCameraOptions
  //     .filter(opt => normalize(opt.sbu) === normalizedSbu)
  //     .map(opt => ({ value: String(opt.id), label: opt.lokasi }));
  // }, [sbu, channelCameraOptions]);

  const handleSubmit = async () => {
    try {
      const cctvCategory = assetCategories.find(cat => cat.slug === 'cctv');
      if (!cctvCategory) {
        toast.error("CCTV Asset Category not found.");
        return;
      }
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
        categoryId: cctvCategory.id,
        nomorSeri: serialNumber,
        statusAsset: "NEW",
      };

      const cctvSpecsData = {
        sbu: sbu === SBU_GROUP_KEY ? selectedChannel.sbu : sbu,
        viewCamera,
        systemVersion,
        power,
        ipAddress,
        macAddress,
        username,
        password,
        brandId: Number(brandId),
        modelId: Number(modelId),
        deviceTypeId: Number(deviceTypeId),
        channelCameraId: Number(channelCameraId),
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
          <DialogDescription>Fill in the details for the new CCTV asset.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sbu" className="text-right">Perusahaan</Label>
            <ReactSelect
              className="col-span-3"
              options={sbuDropdownOptions}
              onChange={(opt) => {
                setSbu(opt ? opt.value : null);
                setChannelCameraId(null); // Reset channel camera on SBU change
              }}
              placeholder="Select SBU"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="channelCamera" className="text-right">Channel Camera</Label>
            <ReactSelect
              className="col-span-3"
              options={channelCameraOptions
                .filter(opt => opt?.sbu.replaceAll(" - ", " ").replaceAll("_", " ") == sbu?.replaceAll("_", " "))
                // Tambahkan sorting di sini
                .sort((a, b) => a.lokasi.localeCompare(b.lokasi, undefined, { numeric: true }))
                .map(opt => ({ value: String(opt.id), label: `${opt.lokasi}` }))}
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
              onChange={(opt) => setBrandId(opt ? opt.value : null)}
              placeholder="Select Brand"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="model" className="text-right">Model</Label>
            <ReactSelect
              className="col-span-3"
              options={modelOptions.map(opt => ({ value: String(opt.id), label: opt.value }))}
              onChange={(opt) => setModelId(opt ? opt.value : null)}
              placeholder="Select Model"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="deviceType" className="text-right">Device Type</Label>
            <ReactSelect
              className="col-span-3"
              options={deviceTypeOptions.map(opt => ({ value: String(opt.id), label: opt.value }))}
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
            <Label htmlFor="usernamee" className="text-right">Username</Label>
            <Input id="usernamee" value={username} onChange={(e) => setUsername(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">Password</Label>
            <Input id="password" type="text" value={password} onChange={(e) => setPassword(e.target.value)} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>Save CCTV</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
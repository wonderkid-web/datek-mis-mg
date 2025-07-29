"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getLaptopRamOptions } from "@/lib/laptopRamService";
import { getLaptopProcessorOptions } from "@/lib/laptopProcessorService";
import { getLaptopStorageOptions } from "@/lib/laptopStorageService";
import { getLaptopOsOptions } from "@/lib/laptopOsService";
import { getLaptopPortOptions } from "@/lib/laptopPortService";
import { getLaptopPowerOptions } from "@/lib/laptopPowerService";
import { getLaptopMicrosoftOffices } from "@/lib/laptopMicrosoftOfficeService";
import { getLaptopColors } from "@/lib/laptopColorService";
import { getLaptopBrandOptions } from "@/lib/laptopBrandService";
import { getLaptopTypeOptions } from "@/lib/laptopTypeService";
import { createAssetAndLaptopSpecs } from "@/lib/assetService";

// Define interfaces for dropdown options
interface Option {
  id: number;
  value: string;
}

export default function AddLaptopAssetPage() {
  const router = useRouter();

  // State for common asset fields
  const [namaAsset, setNamaAsset] = useState("");
  const [nomorSeri, setNomorSeri] = useState("");
  const [tanggalPembelian, setTanggalPembelian] = useState("");
  const [tanggalGaransi, setTanggalGaransi] = useState("");
  const [nilaiPerolehan, setNilaiPerolehan] = useState("");
  const [statusAsset, setStatusAsset] = useState("GOOD"); // Default status

  // State for laptop-specific fields (dropdowns)
  const [processorOptionId, setProcessorOptionId] = useState<string | null>(
    null
  );
  const [ramOptionId, setRamOptionId] = useState<string | null>(null);
  const [storageTypeOptionId, setStorageTypeOptionId] = useState<string | null>(
    null
  );
  const [osOptionId, setOsOptionId] = useState<string | null>(null);
  const [portOptionId, setPortOptionId] = useState<string | null>(null);
  const [powerOptionId, setPowerOptionId] = useState<string | null>(null);
  const [microsoftOfficeOptionId, setMicrosoftOfficeOptionId] = useState<
    string | null
  >(null);
  const [colorOptionId, setColorOptionId] = useState<string | null>(null);
  const [brandOptionId, setBrandOptionId] = useState<string | null>(null);
  const [typeOptionId, setTypeOptionId] = useState<string | null>(null);

  // State for laptop-specific fields (text)
  const [macWlan, setMacWlan] = useState("");
  const [macLan, setMacLan] = useState("");

  // State for dropdown options
  const [ramOptions, setRamOptions] = useState<Option[]>([]);
  const [processorOptions, setProcessorOptions] = useState<Option[]>([]);
  const [storageOptions, setStorageOptions] = useState<Option[]>([]);
  const [osOptions, setOsOptions] = useState<Option[]>([]);
  const [portOptions, setPortOptions] = useState<Option[]>([]);
  const [powerOptions, setPowerOptions] = useState<Option[]>([]);
  const [microsoftOfficeOptions, setMicrosoftOfficeOptions] = useState<
    Option[]
  >([]);
  const [colorOptions, setColorOptions] = useState<Option[]>([]);
  const [brandOptions, setBrandOptions] = useState<Option[]>([]);
  const [typeOptions, setTypeOptions] = useState<Option[]>([]);

  const assetStatuses = [
    "GOOD",
    "NEED REPARATION",
    "BROKEN",
    "MISSING",
    "SELL",
  ];

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setRamOptions(await getLaptopRamOptions());
        setProcessorOptions(await getLaptopProcessorOptions());
        setStorageOptions(await getLaptopStorageOptions());
        setOsOptions(await getLaptopOsOptions());
        setPortOptions(await getLaptopPortOptions());
        setPowerOptions(await getLaptopPowerOptions());
        setMicrosoftOfficeOptions(await getLaptopMicrosoftOffices());
        setColorOptions(await getLaptopColors());
        setBrandOptions(await getLaptopBrandOptions());
        setTypeOptions(await getLaptopTypeOptions());
      } catch (error) {
        console.error("Failed to fetch options:", error);
      }
    };
    fetchOptions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const assetData = {
      namaAsset,
      categoryId: 1, // Assuming 1 is the ID for 'Laptop' category
      nomorSeri,
      tanggalPembelian: tanggalPembelian ? new Date(tanggalPembelian) : null,
      tanggalGaransi: tanggalGaransi ? new Date(tanggalGaransi) : null,
      nilaiPerolehan: nilaiPerolehan ? parseFloat(nilaiPerolehan) : null,
      statusAsset,
    };

    const laptopSpecsData = {
      processorOptionId: processorOptionId ? parseInt(processorOptionId) : null,
      ramOptionId: ramOptionId ? parseInt(ramOptionId) : null,
      storageTypeOptionId: storageTypeOptionId
        ? parseInt(storageTypeOptionId)
        : null,
      osOptionId: osOptionId ? parseInt(osOptionId) : null,
      portOptionId: portOptionId ? parseInt(portOptionId) : null,
      powerOptionId: powerOptionId ? parseInt(powerOptionId) : null,
      microsoftOfficeOptionId: microsoftOfficeOptionId
        ? parseInt(microsoftOfficeOptionId)
        : null,
      colorOptionId: colorOptionId ? parseInt(colorOptionId) : null,
      brandOptionId: brandOptionId ? parseInt(brandOptionId) : null,
      typeOptionId: typeOptionId ? parseInt(typeOptionId) : null,
      macWlan,
      macLan,
    };

    try {
      await createAssetAndLaptopSpecs(assetData, laptopSpecsData);
      alert("Laptop asset added successfully!");
      router.push("/assets"); // Redirect to assets list
    } catch (error) {
      console.error("Failed to add laptop asset:", error);
      alert("Failed to add laptop asset.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Add New Laptop Asset</h1>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Common Asset Details */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Common Asset Details</h2>
          <div>
            <Label htmlFor="namaAsset"></Label>
            <Input
              id="namaAsset"
              value={namaAsset}
              onChange={(e) => setNamaAsset(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="nomorSeri">Serial Number</Label>
            <Input
              id="nomorSeri"
              value={nomorSeri}
              onChange={(e) => setNomorSeri(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="tanggalPembelian">Purchase Date</Label>
            <Input
              type="date"
              id="tanggalPembelian"
              value={tanggalPembelian}
              onChange={(e) => setTanggalPembelian(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="tanggalGaransi">Warranty Date</Label>
            <Input
              type="date"
              id="tanggalGaransi"
              value={tanggalGaransi}
              onChange={(e) => setTanggalGaransi(e.target.value)}
            />
          </div>
          {/* <div>
            <Label htmlFor="nilaiPerolehan">Acquisition Value</Label>
            <Input type="number" id="nilaiPerolehan" value={nilaiPerolehan} onChange={(e) => setNilaiPerolehan(e.target.value)} step="0.01" />
          </div> */}
          <div>
            <Label htmlFor="statusAsset">Asset Status</Label>
            <Select onValueChange={setStatusAsset} value={statusAsset}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {assetStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Laptop Specific Details */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">
            Laptop Specific Details
          </h2>
          <div>
            <Label htmlFor="brandOption">Brand</Label>
            <Select
              onValueChange={setBrandOptionId}
              value={brandOptionId || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent>
                {brandOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id.toString()}>
                    {option.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="processorOption">Processor</Label>
            <Select
              onValueChange={setProcessorOptionId}
              value={processorOptionId || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select processor" />
              </SelectTrigger>
              <SelectContent>
                {processorOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id.toString()}>
                    {option.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="ramOption">RAM</Label>
            <Select onValueChange={setRamOptionId} value={ramOptionId || ""}>
              <SelectTrigger>
                <SelectValue placeholder="Select RAM" />
              </SelectTrigger>
              <SelectContent>
                {ramOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id.toString()}>
                    {option.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="storageTypeOption">Storage Type</Label>
            <Select
              onValueChange={setStorageTypeOptionId}
              value={storageTypeOptionId || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select storage type" />
              </SelectTrigger>
              <SelectContent>
                {storageOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id.toString()}>
                    {option.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="osOption">Operating System</Label>
            <Select onValueChange={setOsOptionId} value={osOptionId || ""}>
              <SelectTrigger>
                <SelectValue placeholder="Select OS" />
              </SelectTrigger>
              <SelectContent>
                {osOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id.toString()}>
                    {option.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="nomorSeri">License</Label>
            <Input
              id="nomorSeri"
              maxLength={29}
              value={nomorSeri}
              onChange={(e) => setNomorSeri(e.target.value)}
              required
              placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
            />
          </div>
          <div>
            <Label htmlFor="osOption">Type License</Label>
            <Select onValueChange={setOsOptionId} value={osOptionId || ""}>
              <SelectTrigger>
                <SelectValue placeholder="Select OS" />
              </SelectTrigger>
              <SelectContent>
                {osOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id.toString()}>
                    {option.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* <div>
            <Label htmlFor="portOption">Port</Label>
            <Select onValueChange={setPortOptionId} value={portOptionId || ""}>
              <SelectTrigger>
                <SelectValue placeholder="Select port" />
              </SelectTrigger>
              <SelectContent>
                {portOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id.toString()}>
                    {option.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div> */}
          <div>
            <Label htmlFor="powerOption">Power Adaptor</Label>
            <Select
              onValueChange={setPowerOptionId}
              value={powerOptionId || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select power" />
              </SelectTrigger>
              <SelectContent>
                {powerOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id.toString()}>
                    {option.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="microsoftOfficeOption">Microsoft Office</Label>
            <Select
              onValueChange={setMicrosoftOfficeOptionId}
              value={microsoftOfficeOptionId || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Microsoft Office" />
              </SelectTrigger>
              <SelectContent>
                {microsoftOfficeOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id.toString()}>
                    {option.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="colorOption">Color</Label>
            <Select
              onValueChange={setColorOptionId}
              value={colorOptionId || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent>
                {colorOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id.toString()}>
                    {option.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="typeOption">Type</Label>
            <Select onValueChange={setTypeOptionId} value={typeOptionId || ""}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id.toString()}>
                    {option.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="macWlan">MAC WLAN</Label>
            <Input
              id="macWlan"
              value={macWlan}
              onChange={(e) => setMacWlan(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="macLan">MAC LAN</Label>
            <Input
              id="macLan"
              value={macLan}
              onChange={(e) => setMacLan(e.target.value)}
            />
          </div>
        </div>

        <div className="md:col-span-2 flex justify-end">
          <Button type="submit">Add Laptop Asset</Button>
        </div>
      </form>
    </div>
  );
}

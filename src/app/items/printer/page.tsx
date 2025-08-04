"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Select from "react-select";

import { getPrinterBrandOptions } from "@/lib/printerBrandService";
import { getPrinterTypeOptions } from "@/lib/printerTypeService";
import { getPrinterModelOptions } from "@/lib/printerModelService";
import { createAssetAndPrinterSpecs } from "@/lib/printerService";
import { toast } from "sonner";
import { Asset, PrinterSpecs } from "@/lib/types";

interface Option {
  id: number;
  value: string;
}

interface ReactSelectOption {
  value: string;
  label: string;
}

export default function AddPrinterAssetPage() {
  const router = useRouter();

  const [namaAsset, setNamaAsset] = useState<string | null>(null);
  const [nomorSeri, setNomorSeri] = useState("");
  const [tanggalPembelian, setTanggalPembelian] = useState("");
  const [tanggalGaransi, setTanggalGaransi] = useState("");
  const [statusAsset, setStatusAsset] = useState<string | null>(null);

  const [brandOptions, setBrandOptions] = useState<Option[]>([]);
  const [typeOptions, setTypeOptions] = useState<Option[]>([]);
  const [modelOptions, setModelOptions] = useState<Option[]>([]);

  const [brandOptionId, setBrandOptionId] = useState<number | null>(null);
  const [typeOptionId, setTypeOptionId] = useState<number | null>(null);
  const [modelOptionId, setModelOptionId] = useState<number | null>(null);

  const assetStatuses: ReactSelectOption[] = [
    { value: "GOOD", label: "GOOD" },
    { value: "NEED REPARATION", label: "NEED REPARATION" },
    { value: "BROKEN", label: "BROKEN" },
    { value: "MISSING", label: "MISSING" },
    { value: "SELL", label: "SELL" },
  ];

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const mapOptions = (items: any[]) =>
          items.map((item: any) => ({ id: item.id, value: item.value }));

        setBrandOptions(mapOptions(await getPrinterBrandOptions()));
        setTypeOptions(mapOptions(await getPrinterTypeOptions()));
        setModelOptions(mapOptions(await getPrinterModelOptions()));
      } catch (error) {
        console.error("Failed to fetch options:", error);
      }
    };
    fetchOptions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const assetData: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'category' | 'laptopSpecs' | 'intelNucSpecs' | 'printerSpecs'> & { categoryId: number } = {
      namaAsset: namaAsset || "",
      categoryId: 3, // Corrected categoryId for printer
      nomorSeri,
      tanggalPembelian: tanggalPembelian ? new Date(tanggalPembelian) : null,
      tanggalGaransi: tanggalGaransi ? new Date(tanggalGaransi) : null,
      statusAsset: statusAsset || "GOOD",
    };

    const printerSpecsData: Omit<PrinterSpecs, 'assetId'> = {
      brandOptionId,
      typeOptionId,
      modelOptionId,
    };

    try {
      await createAssetAndPrinterSpecs(assetData, printerSpecsData );
      toast.success("Printer asset added successfully!");
      router.push("/data-center/assigned-assets");
    } catch (error) {
      console.error("Failed to add printer asset:", error);
      toast.error("Failed to add printer asset.");
    }
  };

  const getSelectedOption = (options: Option[], selectedId: number | null) => {
    if (selectedId === null) return null;
    const option = options.find((opt) => opt.id === selectedId);
    return option ? { value: option.id.toString(), label: option.value } : null;
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Add New Printer Asset 🖨️
      </h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-6 p-4 border rounded-lg md:w-1/2 mx-auto"
      >
        <h2 className="text-xl font-semibold mb-4">Printer Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-2">
          <Label>Brand</Label>
          <Select
            options={brandOptions.map(opt => ({ value: opt.id.toString(), label: opt.value }))}
            value={getSelectedOption(brandOptions, brandOptionId)}
            onChange={(selectedOption) => setBrandOptionId(selectedOption ? parseInt(selectedOption.value) : null)}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-2">
          <Label htmlFor="namaAsset">Model Printer</Label>
          <Select
            id="namaAsset"
            options={modelOptions.map(opt => ({ value: opt.id.toString(), label: opt.value }))}
            value={getSelectedOption(modelOptions, modelOptionId)}
            onChange={(selectedOption) => {
              if (selectedOption) {
                setModelOptionId(parseInt(selectedOption.value));
                setNamaAsset(selectedOption.label);
              } else {
                setModelOptionId(null);
                setNamaAsset(null);
              }
            }}
            placeholder="Select model"
            isClearable
            isSearchable
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-2">
          <Label htmlFor="nomorSeri">Serial Number</Label>
          <Input
            id="nomorSeri"
            value={nomorSeri}
               onChange={(e) => setNomorSeri(e.target.value.toUpperCase())}
         
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-2">
          <Label>Type</Label>
          <Select
            options={typeOptions.map(opt => ({ value: opt.id.toString(), label: opt.value }))}
            value={getSelectedOption(typeOptions, typeOptionId)}
            onChange={(selectedOption) => setTypeOptionId(selectedOption ? parseInt(selectedOption.value) : null)}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-2">
          <Label htmlFor="tanggalPembelian">Purchase Date</Label>
          <Input
            type="date"
            id="tanggalPembelian"
            value={tanggalPembelian}
            onChange={(e) => setTanggalPembelian(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-2">
          <Label htmlFor="tanggalGaransi">Warranty Date</Label>
          <Input
            type="date"
            id="tanggalGaransi"
            value={tanggalGaransi}
            onChange={(e) => setTanggalGaransi(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-2">
          <Label htmlFor="statusAsset">Asset Status</Label>
          <Select
            options={assetStatuses}
            value={assetStatuses.find((option) => option.value === statusAsset)}
            onChange={(selectedOption) =>
              setStatusAsset(selectedOption ? selectedOption.value : null)
            }
            placeholder="Select status"
            isClearable
            isSearchable
          />
        </div>

      

        <div className="flex justify-end mt-18">
          <Button type="submit">Add Printer Asset</Button>
        </div>
      </form>
    </div>
  );

}
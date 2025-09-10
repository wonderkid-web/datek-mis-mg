// @ts-nocheck
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Select from "react-select";
import { toast } from "sonner";

import { getPrinterBrandOptions } from "@/lib/printerBrandService";
import { getPrinterTypeOptions } from "@/lib/printerTypeService";
import { getPrinterModelOptions } from "@/lib/printerModelService";
import { getAssetById, updateAssetAndPrinterSpecs } from "@/lib/assetService";

interface Option {
  id: number;
  value: string;
}

interface ReactSelectOption {
  value: string;
  label: string;
}

export default function EditPrinterAssetPage() {
  const router = useRouter();
  const params = useParams();
  const printerId = params.printerId as string;

  // Common asset fields
  const [namaAsset, setNamaAsset] = useState<string | null>(null);
  const [nomorSeri, setNomorSeri] = useState("");
  const [tanggalPembelian, setTanggalPembelian] = useState("");
  const [tanggalGaransi, setTanggalGaransi] = useState("");
  const [statusAsset, setStatusAsset] = useState<string | null>(null);

  // Printer options
  const [brandOptions, setBrandOptions] = useState<Option[]>([]);
  const [typeOptions, setTypeOptions] = useState<Option[]>([]);
  const [modelOptions, setModelOptions] = useState<Option[]>([]);

  // Selected IDs
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

  const getSelectedOption = (options: Option[], selectedId: number | null) => {
    if (selectedId === null) return null;
    const option = options.find((opt) => opt.id === selectedId);
    return option ? { value: option.id.toString(), label: option.value } : null;
  };

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const mapOptions = (items: any[]) =>
          items.map((item: any) => ({ id: item.id, value: item.value }));

        const [brands, types, models] = await Promise.all([
          getPrinterBrandOptions(),
          getPrinterTypeOptions(),
          getPrinterModelOptions(),
        ]);

        setBrandOptions(mapOptions(brands));
        setTypeOptions(mapOptions(types));
        setModelOptions(mapOptions(models));
      } catch (error) {
        console.error("Failed to fetch options:", error);
      }
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    const loadAsset = async () => {
      if (!printerId) return;
      try {
        const asset = await getAssetById(parseInt(printerId));
        if (!asset) return;
        setNamaAsset(asset.namaAsset);
        setNomorSeri(asset.nomorSeri);
        setTanggalPembelian(asset.tanggalPembelian?.toISOString().split("T")[0] || "");
        setTanggalGaransi(asset.tanggalGaransi?.toISOString().split("T")[0] || "");
        setStatusAsset(asset.statusAsset);

        if (asset.printerSpecs) {
          setBrandOptionId(asset.printerSpecs.brandOptionId);
          setTypeOptionId(asset.printerSpecs.typeOptionId);
          setModelOptionId(asset.printerSpecs.modelOptionId);
        }
      } catch (error) {
        console.error("Failed to load asset:", error);
      }
    };
    loadAsset();
  }, [printerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const assetData = {
        namaAsset: namaAsset || "",
        categoryId: 3,
        nomorSeri,
        tanggalPembelian: tanggalPembelian ? new Date(tanggalPembelian) : null,
        tanggalGaransi: tanggalGaransi ? new Date(tanggalGaransi) : null,
        statusAsset: statusAsset || "GOOD",
      };

      const printerSpecsData = {
        brandOptionId,
        typeOptionId,
        modelOptionId,
      };

      await updateAssetAndPrinterSpecs(parseInt(printerId), assetData, printerSpecsData);
      toast.success("Printer asset updated successfully!");
      router.push("/data-center/assigned-assets");
    } catch (error) {
      console.error("Failed to update printer asset:", error);
      toast.error("Failed to update printer asset.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Edit Printer Asset</h1>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Printer Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Brand</Label>
              <Select
                options={brandOptions.map((opt) => ({ value: opt.id.toString(), label: opt.value }))}
                value={getSelectedOption(brandOptions, brandOptionId)}
                onChange={(selectedOption) => setBrandOptionId(selectedOption ? parseInt(selectedOption.value) : null)}
              />
            </div>
            <div>
              <Label htmlFor="namaAsset">Model Printer</Label>
              <Select
                id="namaAsset"
                options={modelOptions.map((opt) => ({ value: opt.id.toString(), label: opt.value }))}
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
            <div>
              <Label htmlFor="nomorSeri">Serial Number</Label>
              <Input id="nomorSeri" value={nomorSeri} onChange={(e) => setNomorSeri(e.target.value.toUpperCase())} required />
            </div>
            <div>
              <Label>Type</Label>
              <Select
                options={typeOptions.map((opt) => ({ value: opt.id.toString(), label: opt.value }))}
                value={getSelectedOption(typeOptions, typeOptionId)}
                onChange={(selectedOption) => setTypeOptionId(selectedOption ? parseInt(selectedOption.value) : null)}
              />
            </div>
            <div>
              <Label htmlFor="tanggalPembelian">Purchase Date</Label>
              <Input type="date" id="tanggalPembelian" value={tanggalPembelian} onChange={(e) => setTanggalPembelian(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="tanggalGaransi">Warranty Date</Label>
              <Input type="date" id="tanggalGaransi" value={tanggalGaransi} onChange={(e) => setTanggalGaransi(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="statusAsset">Asset Status</Label>
              <Select
                options={assetStatuses}
                value={assetStatuses.find((option) => option.value === statusAsset)}
                onChange={(selectedOption) => setStatusAsset(selectedOption ? selectedOption.value : null)}
                placeholder="Select status"
                isClearable
                isSearchable
              />
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit">Update Printer Asset</Button>
        </div>
      </form>
    </div>
  );
}

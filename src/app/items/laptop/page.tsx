"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Select from "react-select"; // Import react-select

import { getLaptopRamOptions } from "@/lib/laptopRamService";
import { getLaptopProcessorOptions } from "@/lib/laptopProcessorService";
import { getLaptopStorageOptions } from "@/lib/laptopStorageService";
import { getLaptopOsOptions } from "@/lib/laptopOsService";
import { getLaptopPowerOptions } from "@/lib/laptopPowerService";
import { getLaptopMicrosoftOffices } from "@/lib/laptopMicrosoftOfficeService";
import { getLaptopColors } from "@/lib/laptopColorService";
import { getLaptopBrandOptions } from "@/lib/laptopBrandService";
import { getLaptopTypeOptions } from "@/lib/laptopTypeService";
import { getLaptopGraphicOptions } from "@/lib/laptopGraphicService";
import { getLaptopLicenseOptions } from "@/lib/laptopLicenseService";
import { createAssetAndLaptopSpecs } from "@/lib/assetService";
import { toast } from "sonner";

// Define interfaces for dropdown options
interface Option {
  id: number;
  value: string;
}

interface ReactSelectOption {
  value: string;
  label: string;
}

export default function AddLaptopAssetPage() {
  const router = useRouter();

  // State for common asset fields
  const [namaAsset, setNamaAsset] = useState<string | null>(null);
  const [nomorSeri, setNomorSeri] = useState("");
  const [tanggalPembelian, setTanggalPembelian] = useState("");
  const [tanggalGaransi, setTanggalGaransi] = useState("");
  const [statusAsset, setStatusAsset] = useState<string | null>(null);

  // State for laptop-specific fields (text)
  const [macWlan, setMacWlan] = useState("");
  const [macLan, setMacLan] = useState("");
  const [licenseKey, setLicenseKey] = useState("");

  // State for dropdown options
  const [ramOptions, setRamOptions] = useState<Option[]>([]);
  const [processorOptions, setProcessorOptions] = useState<Option[]>([]);
  const [storageOptions, setStorageOptions] = useState<Option[]>([]);
  const [osOptions, setOsOptions] = useState<Option[]>([]);
  const [powerOptions, setPowerOptions] = useState<Option[]>([]);
  const [microsoftOfficeOptions, setMicrosoftOfficeOptions] = useState<
    Option[]
  >([]);
  const [colorOptions, setColorOptions] = useState<Option[]>([]);
  const [brandOptions, setBrandOptions] = useState<Option[]>([]);
  const [graphicOptions, setGraphicOptions] = useState<Option[]>([]);
  const [licenseOptions, setLicenseOptions] = useState<Option[]>([]);
  const [typeOptions, setTypeOptions] = useState<Option[]>([]);

  // State untuk ID dropdown
  const [brandOptionId, setBrandOptionId] = useState<number | null>(null);
  const [processorOptionId, setProcessorOptionId] = useState<number | null>(
    null
  );
  const [ramOptionId, setRamOptionId] = useState<number | null>(null);
  const [storageTypeOptionId, setStorageTypeOptionId] = useState<number | null>(
    null
  );
  const [osOptionId, setOsOptionId] = useState<number | null>(null);
  const [licenseOptionId, setLicenseOptionId] = useState<number | null>(null);
  const [powerOptionId, setPowerOptionId] = useState<number | null>(null);
  const [microsoftOfficeOptionId, setMicrosoftOfficeOptionId] = useState<
    number | null
  >(null);
  const [colorOptionId, setColorOptionId] = useState<number | null>(null);
  const [graphicOptionId, setGraphicOptionId] = useState<number | null>(null);
  const [typeOptionId, setTypeOptionId] = useState<number | null>(null);

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
          items
            .filter((item: any) => !item.isDeleted)
            .map((item: any) => ({ id: item.id, value: item.value }));

        setRamOptions(mapOptions(await getLaptopRamOptions()));
        setProcessorOptions(mapOptions(await getLaptopProcessorOptions()));
        setStorageOptions(mapOptions(await getLaptopStorageOptions()));
        setOsOptions(mapOptions(await getLaptopOsOptions()));
        setPowerOptions(mapOptions(await getLaptopPowerOptions()));
        setMicrosoftOfficeOptions(
          mapOptions(await getLaptopMicrosoftOffices())
        );
        setColorOptions(mapOptions(await getLaptopColors()));
        setBrandOptions(mapOptions(await getLaptopBrandOptions()));
        setTypeOptions(mapOptions(await getLaptopTypeOptions()));
        setGraphicOptions(mapOptions(await getLaptopGraphicOptions()));
        setLicenseOptions(mapOptions(await getLaptopLicenseOptions()));
      } catch (error) {
        console.error("Failed to fetch options:", error);
      }
    };
    fetchOptions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const assetData = {
      namaAsset: namaAsset || "",
      // ini satu karna laptop
      categoryId: 1,
      nomorSeri,
      tanggalPembelian: tanggalPembelian ? new Date(tanggalPembelian) : null,
      tanggalGaransi: tanggalGaransi ? new Date(tanggalGaransi) : null,
      statusAsset: statusAsset || "GOOD",
    };

    const laptopSpecsData = {
      processorOptionId,
      ramOptionId,
      storageTypeOptionId,
      osOptionId,
      powerOptionId,
      microsoftOfficeOptionId,
      colorOptionId,
      brandOptionId,
      typeOptionId,
      macWlan,
      macLan,
      graphicOptionId,
      licenseKey,
      licenseOptionId,
    };

    try {
      await createAssetAndLaptopSpecs(assetData, laptopSpecsData);
      toast.success("Laptop asset added successfully!");
      router.push("/data-center/assigned-assets");
    } catch (error) {
      console.error("Failed to add laptop asset:", error);
      toast.error("Failed to add laptop asset.");
    }
  };

  const getSelectedOption = (options: Option[], selectedId: number | null) => {
    if (selectedId === null) return null;
    const option = options.find((opt) => opt.id === selectedId);
    return option ? { value: option.id.toString(), label: option.value } : null;
  };

  const getSelectedOptionByValue = (
    options: Option[],
    selectedValue: string | null
  ) => {
    if (!selectedValue) return null;
    const option = options.find((opt) => opt.value === selectedValue);
    return option ? { value: option.id.toString(), label: option.value } : null;
  };

  const handleMacAddressChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const input = e.target.value.replace(/[^0-9a-fA-F]/g, "");
    let formatted = "";
    for (let i = 0; i < input.length; i++) {
      if (i > 0 && i % 2 === 0) {
        formatted += ":";
      }
      formatted += input[i];
    }
    setter(formatted.toUpperCase().slice(0, 17));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Add New Laptop Asset 💻
      </h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-6 p-4 border rounded-lg md:w-1/2 mx-auto"
      >
        <h2 className="text-xl font-semibold mb-4">Laptop Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-2">
          <Label>Brand</Label>
          <Select
            options={brandOptions.map((opt) => ({
              value: opt.id.toString(),
              label: opt.value,
            }))}
            value={getSelectedOption(brandOptions, brandOptionId)}
            onChange={(selectedOption) =>
              setBrandOptionId(
                selectedOption ? parseInt(selectedOption.value) : null
              )
            }
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-2">
          <Label htmlFor="namaAsset">Model Laptop</Label>
          <Select
            options={typeOptions.map((opt) => ({
              value: opt.value,
              label: opt.value,
            }))}
            value={getSelectedOptionByValue(typeOptions, namaAsset)}
            onChange={(selectedOption) =>
              setNamaAsset(selectedOption ? selectedOption.value : null)
            }
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
          <Label>Processor</Label>
          <Select
            options={processorOptions.map((opt) => ({
              value: opt.id.toString(),
              label: opt.value,
            }))}
            value={getSelectedOption(processorOptions, processorOptionId)}
            onChange={(selectedOption) =>
              setProcessorOptionId(
                selectedOption ? parseInt(selectedOption.value) : null
              )
            }
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-2">
          <Label>RAM</Label>
          <Select
            options={ramOptions.map((opt) => ({
              value: opt.id.toString(),
              label: opt.value,
            }))}
            value={getSelectedOption(ramOptions, ramOptionId)}
            onChange={(selectedOption) =>
              setRamOptionId(
                selectedOption ? parseInt(selectedOption.value) : null
              )
            }
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-2">
          <Label>Storage Type</Label>
          <Select
            options={storageOptions.map((opt) => ({
              value: opt.id.toString(),
              label: opt.value,
            }))}
            value={getSelectedOption(storageOptions, storageTypeOptionId)}
            onChange={(selectedOption) =>
              setStorageTypeOptionId(
                selectedOption ? parseInt(selectedOption.value) : null
              )
            }
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-2">
          <Label>Graphic</Label>
          <Select
            options={graphicOptions.map((opt) => ({
              value: opt.id.toString(),
              label: opt.value,
            }))}
            value={getSelectedOption(graphicOptions, graphicOptionId)}
            onChange={(selectedOption) =>
              setGraphicOptionId(
                selectedOption ? parseInt(selectedOption.value) : null
              )
            }
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-2">
          <Label>Power Adaptor</Label>
          <Select
            options={powerOptions.map((opt) => ({
              value: opt.id.toString(),
              label: opt.value,
            }))}
            value={getSelectedOption(powerOptions, powerOptionId)}
            onChange={(selectedOption) =>
              setPowerOptionId(
                selectedOption ? parseInt(selectedOption.value) : null
              )
            }
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-2">
          <Label>Color</Label>
          <Select
            options={colorOptions.map((opt) => ({
              value: opt.id.toString(),
              label: opt.value,
            }))}
            value={getSelectedOption(colorOptions, colorOptionId)}
            onChange={(selectedOption) =>
              setColorOptionId(
                selectedOption ? parseInt(selectedOption.value) : null
              )
            }
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-2">
          <Label>MAC WLAN</Label>
          <Input
            value={macWlan}
            onChange={(e) => handleMacAddressChange(e, setMacWlan)}
            placeholder="XX:XX:XX:XX:XX:XX"
            maxLength={17}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-2">
          <Label>MAC LAN</Label>
          <Input
            value={macLan}
            onChange={(e) => handleMacAddressChange(e, setMacLan)}
            placeholder="XX:XX:XX:XX:XX:XX"
            maxLength={17}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-2">
          <Label>Operating System</Label>
          <Select
            options={osOptions.map((opt) => ({
              value: opt.id.toString(),
              label: opt.value,
            }))}
            value={getSelectedOption(osOptions, osOptionId)}
            onChange={(selectedOption) =>
              setOsOptionId(
                selectedOption ? parseInt(selectedOption.value) : null
              )
            }
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-2">
          <Label>License Type</Label>
          <Select
            options={licenseOptions.map((opt) => ({
              value: opt.id.toString(),
              label: opt.value,
            }))}
            
            value={getSelectedOption(licenseOptions, licenseOptionId)}
            onChange={(selectedOption) =>
              setLicenseOptionId(
                selectedOption ? parseInt(selectedOption.value) : null
              )
            }
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-2">
          <Label>License Key</Label>
          <Input
            maxLength={29}
            value={licenseKey}
            onChange={(e) => {
              const value = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
              let formattedValue = "";
              for (let i = 0; i < value.length; i++) {
                if (i > 0 && i % 5 === 0) {
                  formattedValue += "-";
                }
                formattedValue += value[i];
              }
              setLicenseKey(formattedValue.slice(0, 29));
            }}
            placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-2">
          <Label>Microsoft Office</Label>
          <Select
            options={microsoftOfficeOptions.map((opt) => ({
              value: opt.id.toString(),
              label: opt.value,
            }))}
            value={getSelectedOption(
              microsoftOfficeOptions,
              microsoftOfficeOptionId
            )}
            onChange={(selectedOption) =>
              setMicrosoftOfficeOptionId(
                selectedOption ? parseInt(selectedOption.value) : null
              )
            }
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
          <Button type="submit">Add Laptop Asset</Button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import Select from "react-select";

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
import { getAssetById } from "@/lib/assetService";
import { updateAssetAndIntelNucSpecs } from "@/lib/intelNucService";
import { toast } from "sonner";

interface Option {
  id: number; 
  value: string;
}

interface ReactSelectOption {
  value: string;
  label: string;
}

export default function EditIntelNucAssetPage() {
  const router = useRouter();
  const params = useParams();
  const intelNucId = params.intelNucId as string;

  // State for common asset fields
  const [namaAsset, setNamaAsset] = useState<string | null>(null);
  const [nomorSeri, setNomorSeri] = useState("");
  const [tanggalPembelian, setTanggalPembelian] = useState("");
  const [tanggalGaransi, setTanggalGaransi] = useState("");
  const [statusAsset, setStatusAsset] = useState<string | null>(null);

  // State for Intel NUC-specific fields (text)
  const [macWlan, setMacWlan] = useState("");
  const [macLan, setMacLan] = useState("");
  const [licenseKey, setLicenseKey] = useState("");

  // --- STATE BARU UNTUK OFFICE ACCOUNT ---
  const [hasOfficeAccount, setHasOfficeAccount] = useState(false);
  const [officeEmail, setOfficeEmail] = useState("");
  const [officePassword, setOfficePassword] = useState("");
  const [officeLicenseExpiry, setOfficeLicenseExpiry] = useState(""); // Baru
  const [officeIsActive, setOfficeIsActive] = useState(true);         // Baru

  // State for dropdown options
  const [ramOptions, setRamOptions] = useState<Option[]>([]);
  const [processorOptions, setProcessorOptions] = useState<Option[]>([]);
  const [storageOptions, setStorageOptions] = useState<Option[]>([]);
  const [osOptions, setOsOptions] = useState<Option[]>([]);
  const [powerOptions, setPowerOptions] = useState<Option[]>([]);
  const [microsoftOfficeOptions, setMicrosoftOfficeOptions] = useState<Option[]>([]);
  const [colorOptions, setColorOptions] = useState<Option[]>([]);
  const [brandOptions, setBrandOptions] = useState<Option[]>([]);
  const [graphicOptions, setGraphicOptions] = useState<Option[]>([]);
  const [licenseOptions, setLicenseOptions] = useState<Option[]>([]);
  const [typeOptions, setTypeOptions] = useState<Option[]>([]);

  // State untuk ID dropdown
  const [brandOptionId, setBrandOptionId] = useState<number | null>(null);
  const [processorOptionId, setProcessorOptionId] = useState<number | null>(null);
  const [ramOptionId, setRamOptionId] = useState<number | null>(null);
  const [storageTypeOptionId, setStorageTypeOptionId] = useState<number | null>(null);
  const [osOptionId, setOsOptionId] = useState<number | null>(null);
  const [licenseOptionId, setLicenseOptionId] = useState<number | null>(null);
  const [powerOptionId, setPowerOptionId] = useState<number | null>(null);
  const [microsoftOfficeOptionId, setMicrosoftOfficeOptionId] = useState<number | null>(null);
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
        setMicrosoftOfficeOptions(mapOptions(await getLaptopMicrosoftOffices()));
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

  useEffect(() => {
    const loadAssetData = async () => {
      if (intelNucId) {
        const asset: any = await getAssetById(parseInt(intelNucId));
        if (asset) {
          setNamaAsset(asset.namaAsset);
          setNomorSeri(asset.nomorSeri);
          setTanggalPembelian(asset.tanggalPembelian?.toISOString().split('T')[0] || "");
          setTanggalGaransi(asset.tanggalGaransi?.toISOString().split('T')[0] || "");
          setStatusAsset(asset.statusAsset);

          if (asset.intelNucSpecs) {
            setMacWlan(asset.intelNucSpecs.macWlan || "");
            setMacLan(asset.intelNucSpecs.macLan || "");
            setLicenseKey(asset.intelNucSpecs.licenseKey || "");

            setBrandOptionId(asset.intelNucSpecs.brandOptionId);
            setProcessorOptionId(asset.intelNucSpecs.processorOptionId);
            setRamOptionId(asset.intelNucSpecs.ramOptionId);
            setStorageTypeOptionId(asset.intelNucSpecs.storageTypeOptionId);
            setOsOptionId(asset.intelNucSpecs.osOptionId);
            setLicenseOptionId(asset.intelNucSpecs.licenseOptionId);
            setPowerOptionId(asset.intelNucSpecs.powerOptionId);
            setMicrosoftOfficeOptionId(asset.intelNucSpecs.microsoftOfficeOptionId);
            setColorOptionId(asset.intelNucSpecs.colorOptionId);
            setGraphicOptionId(asset.intelNucSpecs.graphicOptionId);
            setTypeOptionId(asset.intelNucSpecs.typeOptionId);
          }

           // Populate Office Account Data (UPDATED)
           if (asset.officeAccount) {
            setHasOfficeAccount(true);
            setOfficeEmail(asset.officeAccount.email);
            setOfficePassword(asset.officeAccount.password);
            setOfficeLicenseExpiry(asset.officeAccount.licenseExpiry ? new Date(asset.officeAccount.licenseExpiry).toISOString().split("T")[0] : "");
            setOfficeIsActive(asset.officeAccount.isActive);
          } else {
            setHasOfficeAccount(false);
            setOfficeEmail("");
            setOfficePassword("");
            setOfficeLicenseExpiry("");
            setOfficeIsActive(true);
          }
        }
      }
    };
    loadAssetData();
  }, [intelNucId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const assetData = {
      namaAsset: namaAsset || "",
      categoryId: 2, // For Intel NUC
      nomorSeri,
      tanggalPembelian: tanggalPembelian ? new Date(tanggalPembelian) : null,
      tanggalGaransi: tanggalGaransi ? new Date(tanggalGaransi) : null,
      statusAsset: statusAsset || "GOOD", 
    };

    const intelNucSpecsData = {
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

     // Logic Office Account (UPDATED)
     const officeAccountData = hasOfficeAccount
     ? {
         email: officeEmail,
         password: officePassword,
         licenseExpiry: officeLicenseExpiry ? new Date(officeLicenseExpiry) : null,
         isActive: officeIsActive,
       }
     : null;

    try {
      await updateAssetAndIntelNucSpecs(parseInt(intelNucId), assetData, intelNucSpecsData, officeAccountData);
      toast.success("Intel NUC asset updated successfully!");
      router.push("/data-center/assigned-assets");
    } catch (error) {
      console.error("Failed to update Intel NUC asset:", error);
      toast.error("Failed to update Intel NUC asset.");
    }
  };

  const getSelectedOption = (options: Option[], selectedId: number | null) => {
    if (selectedId === null) return null;
    const option = options.find((opt) => opt.id === selectedId);
    return option ? { value: option.id.toString(), label: option.value } : null;
  };

  const getSelectedOptionByValue = (options: Option[], selectedValue: string | null) => {
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
      <h1 className="text-2xl font-bold mb-6">Edit Intel NUC Asset</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Common Asset Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Fields common: Brand, SN, Date... */}
             <div>
              <Label htmlFor="namaAsset">Model Intel NUC</Label>
              <Select
                options={typeOptions.map((opt) => ({ value: opt.value, label: opt.value }))}
                value={getSelectedOptionByValue(typeOptions, namaAsset)}
                onChange={(selectedOption) => setNamaAsset(selectedOption ? selectedOption.value : null)}
                placeholder="Select model"
                isClearable
                isSearchable
              />
            </div>
            <div>
              <Label htmlFor="nomorSeri">Serial Number</Label>
              <Input id="nomorSeri" value={nomorSeri} onChange={(e) => setNomorSeri(e.target.value)} required />
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

        <Card>
          <CardHeader>
            <CardTitle>Intel NUC Specific Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fields NUC specific */}
            <div>
              <Label>Brand</Label>
              <Select
                options={brandOptions.map(opt => ({ value: opt.id.toString(), label: opt.value }))}
                value={getSelectedOption(brandOptions, brandOptionId)}
                onChange={(selectedOption) => setBrandOptionId(selectedOption ? parseInt(selectedOption.value) : null)}
              />
            </div>
            <div>
              <Label>Processor</Label>
              <Select
                options={processorOptions.map(opt => ({ value: opt.id.toString(), label: opt.value }))}
                value={getSelectedOption(processorOptions, processorOptionId)}
                onChange={(selectedOption) => setProcessorOptionId(selectedOption ? parseInt(selectedOption.value) : null)}
              />
            </div>
            <div>
              <Label>RAM</Label>
              <Select
                options={ramOptions.map(opt => ({ value: opt.id.toString(), label: opt.value }))}
                value={getSelectedOption(ramOptions, ramOptionId)}
                onChange={(selectedOption) => setRamOptionId(selectedOption ? parseInt(selectedOption.value) : null)}
              />
            </div>
            <div>
              <Label>Storage Type</Label>
              <Select
                options={storageOptions.map(opt => ({ value: opt.id.toString(), label: opt.value }))}
                value={getSelectedOption(storageOptions, storageTypeOptionId)}
                onChange={(selectedOption) => setStorageTypeOptionId(selectedOption ? parseInt(selectedOption.value) : null)}
              />
            </div>
            <div>
              <Label>Operating System</Label>
              <Select
                options={osOptions.map(opt => ({ value: opt.id.toString(), label: opt.value }))}
                value={getSelectedOption(osOptions, osOptionId)}
                onChange={(selectedOption) => setOsOptionId(selectedOption ? parseInt(selectedOption.value) : null)}
              />
            </div>
            <div>
              <Label>License Key</Label>
              <Input
                maxLength={29}
                value={licenseKey}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                  let formattedValue = '';
                  for (let i = 0; i < value.length; i++) {
                    if (i > 0 && i % 5 === 0) {
                      formattedValue += '-';
                    }
                    formattedValue += value[i];
                  }
                  setLicenseKey(formattedValue.slice(0, 29));
                }}
                placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
              />
            </div>
            <div>
              <Label>License Type</Label>
              <Select
                options={licenseOptions.map(opt => ({ value: opt.id.toString(), label: opt.value }))}
                value={getSelectedOption(licenseOptions, licenseOptionId)}
                onChange={(selectedOption) => setLicenseOptionId(selectedOption ? parseInt(selectedOption.value) : null)}
              />
            </div>
            <div>
              <Label>Power Adaptor</Label>
              <Select
                options={powerOptions.map(opt => ({ value: opt.id.toString(), label: opt.value }))}
                value={getSelectedOption(powerOptions, powerOptionId)}
                onChange={(selectedOption) => setPowerOptionId(selectedOption ? parseInt(selectedOption.value) : null)}
              />
            </div>

             {/* --- BAGIAN MICROSOFT OFFICE (UPDATED) --- */}
             <div className="md:col-span-2 border p-4 rounded-md space-y-4 bg-slate-50 dark:bg-slate-900">
                <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-2">
                    <Label>Microsoft Office</Label>
                    <Select
                        options={microsoftOfficeOptions.map(opt => ({ value: opt.id.toString(), label: opt.value }))}
                        value={getSelectedOption(microsoftOfficeOptions, microsoftOfficeOptionId)}
                        onChange={(selectedOption) => setMicrosoftOfficeOptionId(selectedOption ? parseInt(selectedOption.value) : null)}
                    />
                </div>

                 <div className="flex items-center space-x-2 mt-2">
                    <Checkbox
                        id="officeAccount"
                        checked={hasOfficeAccount}
                        onCheckedChange={(checked) => setHasOfficeAccount(checked as boolean)}
                    />
                    <Label
                        htmlFor="officeAccount"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Update Office Account Credential?
                    </Label>
                </div>

                {hasOfficeAccount && (
                    <div className="grid grid-cols-1 gap-3 mt-2 pl-6 border-l-2 border-blue-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-2">
                            <Label htmlFor="officeEmail">Office Email</Label>
                            <Input
                                id="officeEmail"
                                type="email"
                                value={officeEmail}
                                onChange={(e) => setOfficeEmail(e.target.value)}
                                placeholder="admin@company.com"
                                required={hasOfficeAccount}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-2">
                            <Label htmlFor="officePassword">Office Password</Label>
                            <Input
                                id="officePassword"
                                type="text"
                                value={officePassword}
                                onChange={(e) => setOfficePassword(e.target.value)}
                                placeholder="Password123"
                                required={hasOfficeAccount}
                            />
                        </div>
                        {/* Tambahan Input License Expiry */}
                        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-2">
                            <Label htmlFor="officeLicenseExpiry">Office License Expiry</Label>
                            <Input
                                id="officeLicenseExpiry"
                                type="date"
                                value={officeLicenseExpiry}
                                onChange={(e) => setOfficeLicenseExpiry(e.target.value)}
                            />
                        </div>
                        {/* Tambahan Input Active Status */}
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="officeIsActive"
                                checked={officeIsActive}
                                onCheckedChange={(checked) => setOfficeIsActive(checked as boolean)}
                            />
                            <Label htmlFor="officeIsActive">Account is Active</Label>
                        </div>
                    </div>
                )}
            </div>
             {/* --- END --- */}

            <div>
              <Label>Color</Label>
              <Select
                options={colorOptions.map(opt => ({ value: opt.id.toString(), label: opt.value }))}
                value={getSelectedOption(colorOptions, colorOptionId)}
                onChange={(selectedOption) => setColorOptionId(selectedOption ? parseInt(selectedOption.value) : null)}
              />
            </div>
            <div>
              <Label>Graphic</Label>
              <Select
                options={graphicOptions.map(opt => ({ value: opt.id.toString(), label: opt.value }))}
                value={getSelectedOption(graphicOptions, graphicOptionId)}
                onChange={(selectedOption) => setGraphicOptionId(selectedOption ? parseInt(selectedOption.value) : null)}
              />
            </div>
            <div>
              <Label>MAC WLAN</Label>
              <Input value={macWlan} onChange={(e) => handleMacAddressChange(e, setMacWlan)} placeholder="XX:XX:XX:XX:XX:XX" maxLength={17} />
            </div>
            <div>
              <Label>MAC LAN</Label>
              <Input value={macLan} onChange={(e) => handleMacAddressChange(e, setMacLan)} placeholder="XX:XX:XX:XX:XX:XX" maxLength={17} />
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit">Update Intel NUC Asset</Button>
        </div>
      </form>
    </div>
  );
}
"use client";

import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Asset } from "@/lib/types";
import { getLaptopBrandOptions } from "@/lib/laptopBrandService";
import { getLaptopColors } from "@/lib/laptopColorService";
import { getLaptopGraphicOptions } from "@/lib/laptopGraphicService";
import { getLaptopLicenseOptions } from "@/lib/laptopLicenseService";
import { getLaptopMicrosoftOffices } from "@/lib/laptopMicrosoftOfficeService";
import { getLaptopOsOptions } from "@/lib/laptopOsService";
import { getLaptopPowerOptions } from "@/lib/laptopPowerService";
import { getLaptopProcessorOptions } from "@/lib/laptopProcessorService";
import { getLaptopRamOptions } from "@/lib/laptopRamService";
import { getLaptopStorageOptions } from "@/lib/laptopStorageService";
import { getPcMonitorOptions } from "@/lib/pcMonitorService";
import { getPcMotherboardOptions } from "@/lib/pcMotherboardService";
import { getPcUpsOptions } from "@/lib/pcUpsService";

interface Option {
  id: number;
  value: string;
}

interface SelectOption {
  value: string;
  label: string;
}

interface PcAssetFormValues {
  namaAsset: string;
  brandOptionId: number | null;
  nomorSeri: string;
  tanggalPembelian: string;
  tanggalGaransi: string;
  statusAsset: string | null;
  processorOptionId: number | null;
  ramOptionId: number | null;
  storageTypeOptionId: number | null;
  licenseOptionId: number | null;
  osOptionId: number | null;
  powerOptionId: number | null;
  microsoftOfficeOptionId: number | null;
  colorOptionId: number | null;
  graphicOptionId: number | null;
  monitorOptionId: number | null;
  motherboardOptionId: number | null;
  upsOptionId: number | null;
  macLan: string;
  hasOfficeAccount: boolean;
  officeEmail: string;
  officePassword: string;
  officeLicenseExpiry: string;
  officeIsActive: boolean;
}

interface PcAssetFormProps {
  mode: "create" | "edit";
  initialAsset?: Asset | null;
  onSubmit: (values: PcAssetFormValues) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}

const assetStatuses: SelectOption[] = [
  { value: "GOOD", label: "GOOD" },
  { value: "NEED REPARATION", label: "NEED REPARATION" },
  { value: "BROKEN", label: "BROKEN" },
  { value: "MISSING", label: "MISSING" },
  { value: "SELL", label: "SELL" },
];

const emptyFormValues: PcAssetFormValues = {
  namaAsset: "",
  brandOptionId: null,
  nomorSeri: "",
  tanggalPembelian: "",
  tanggalGaransi: "",
  statusAsset: "GOOD",
  processorOptionId: null,
  ramOptionId: null,
  storageTypeOptionId: null,
  licenseOptionId: null,
  osOptionId: null,
  powerOptionId: null,
  microsoftOfficeOptionId: null,
  colorOptionId: null,
  graphicOptionId: null,
  monitorOptionId: null,
  motherboardOptionId: null,
  upsOptionId: null,
  macLan: "",
  hasOfficeAccount: false,
  officeEmail: "",
  officePassword: "",
  officeLicenseExpiry: "",
  officeIsActive: true,
};

function mapOptions(items: Option[]) {
  return items.map((item) => ({
    value: item.id.toString(),
    label: item.value,
  }));
}

function formatDateValue(value: Date | string | null | undefined) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().split("T")[0];
}

export function PcAssetForm({
  mode,
  initialAsset,
  onSubmit,
  onCancel,
  submitLabel,
}: PcAssetFormProps) {
  const [formValues, setFormValues] =
    useState<PcAssetFormValues>(emptyFormValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [brandOptions, setBrandOptions] = useState<Option[]>([]);
  const [processorOptions, setProcessorOptions] = useState<Option[]>([]);
  const [ramOptions, setRamOptions] = useState<Option[]>([]);
  const [storageOptions, setStorageOptions] = useState<Option[]>([]);
  const [licenseOptions, setLicenseOptions] = useState<Option[]>([]);
  const [osOptions, setOsOptions] = useState<Option[]>([]);
  const [powerOptions, setPowerOptions] = useState<Option[]>([]);
  const [officeOptions, setOfficeOptions] = useState<Option[]>([]);
  const [colorOptions, setColorOptions] = useState<Option[]>([]);
  const [graphicOptions, setGraphicOptions] = useState<Option[]>([]);
  const [monitorOptions, setMonitorOptions] = useState<Option[]>([]);
  const [motherboardOptions, setMotherboardOptions] = useState<Option[]>([]);
  const [upsOptions, setUpsOptions] = useState<Option[]>([]);

  useEffect(() => {
    const loadOptions = async () => {
      const [
        brands,
        processors,
        rams,
        storages,
        licenses,
        operatingSystems,
        powers,
        offices,
        colors,
        graphics,
        monitors,
        motherboards,
        upses,
      ] = await Promise.all([
        getLaptopBrandOptions(),
        getLaptopProcessorOptions(),
        getLaptopRamOptions(),
        getLaptopStorageOptions(),
        getLaptopLicenseOptions(),
        getLaptopOsOptions(),
        getLaptopPowerOptions(),
        getLaptopMicrosoftOffices(),
        getLaptopColors(),
        getLaptopGraphicOptions(),
        getPcMonitorOptions(),
        getPcMotherboardOptions(),
        getPcUpsOptions(),
      ]);

      setBrandOptions(brands);
      setProcessorOptions(processors);
      setRamOptions(rams);
      setStorageOptions(storages);
      setLicenseOptions(licenses);
      setOsOptions(operatingSystems);
      setPowerOptions(powers);
      setOfficeOptions(offices);
      setColorOptions(colors);
      setGraphicOptions(graphics);
      setMonitorOptions(monitors);
      setMotherboardOptions(motherboards);
      setUpsOptions(upses);
    };

    loadOptions();
  }, []);

  useEffect(() => {
    if (!initialAsset) {
      setFormValues(emptyFormValues);
      return;
    }

    setFormValues({
      namaAsset: initialAsset.namaAsset || "",
      brandOptionId: null,
      nomorSeri: initialAsset.nomorSeri || "",
      tanggalPembelian: formatDateValue(initialAsset.tanggalPembelian),
      tanggalGaransi: formatDateValue(initialAsset.tanggalGaransi),
      statusAsset: initialAsset.statusAsset || "GOOD",
      processorOptionId: initialAsset.pcSpecs?.processorOptionId ?? null,
      ramOptionId: initialAsset.pcSpecs?.ramOptionId ?? null,
      storageTypeOptionId: initialAsset.pcSpecs?.storageTypeOptionId ?? null,
      licenseOptionId: initialAsset.pcSpecs?.licenseOptionId ?? null,
      osOptionId: initialAsset.pcSpecs?.osOptionId ?? null,
      powerOptionId: initialAsset.pcSpecs?.powerOptionId ?? null,
      microsoftOfficeOptionId:
        initialAsset.pcSpecs?.microsoftOfficeOptionId ?? null,
      colorOptionId: initialAsset.pcSpecs?.colorOptionId ?? null,
      graphicOptionId: initialAsset.pcSpecs?.graphicOptionId ?? null,
      monitorOptionId: initialAsset.pcSpecs?.monitorOptionId ?? null,
      motherboardOptionId: initialAsset.pcSpecs?.motherboardOptionId ?? null,
      upsOptionId: initialAsset.pcSpecs?.upsOptionId ?? null,
      macLan: initialAsset.pcSpecs?.macLan || "",
      hasOfficeAccount: Boolean(initialAsset.officeAccount),
      officeEmail: initialAsset.officeAccount?.email || "",
      officePassword: initialAsset.officeAccount?.password || "",
      officeLicenseExpiry: formatDateValue(
        initialAsset.officeAccount?.licenseExpiry
      ),
      officeIsActive: initialAsset.officeAccount?.isActive ?? true,
    });
  }, [initialAsset]);

  useEffect(() => {
    if (!brandOptions.length || !formValues.namaAsset.trim()) {
      return;
    }

    const matchedBrand = brandOptions.find(
      (option) =>
        option.value.trim().toLowerCase() ===
        formValues.namaAsset.trim().toLowerCase()
    );

    if (!matchedBrand || matchedBrand.id === formValues.brandOptionId) {
      return;
    }

    setFormValues((current) => ({
      ...current,
      brandOptionId: matchedBrand.id,
    }));
  }, [brandOptions, formValues.brandOptionId, formValues.namaAsset]);

  const selectOptions = useMemo(
    () => ({
      brand: mapOptions(brandOptions),
      processor: mapOptions(processorOptions),
      ram: mapOptions(ramOptions),
      storage: mapOptions(storageOptions),
      license: mapOptions(licenseOptions),
      os: mapOptions(osOptions),
      power: mapOptions(powerOptions),
      office: mapOptions(officeOptions),
      color: mapOptions(colorOptions),
      graphic: mapOptions(graphicOptions),
      monitor: mapOptions(monitorOptions),
      motherboard: mapOptions(motherboardOptions),
      ups: mapOptions(upsOptions),
    }),
    [
      brandOptions,
      colorOptions,
      graphicOptions,
      licenseOptions,
      monitorOptions,
      motherboardOptions,
      officeOptions,
      osOptions,
      powerOptions,
      processorOptions,
      ramOptions,
      storageOptions,
      upsOptions,
    ]
  );

  const rowClass =
    mode === "create"
      ? "grid grid-cols-1 gap-2 md:grid-cols-[180px_minmax(0,1fr)] md:items-center"
      : "space-y-2";
  const formClass =
    mode === "create"
      ? "space-y-6 md:mx-auto md:max-w-3xl"
      : "grid grid-cols-1 gap-6 md:grid-cols-2";
  const specsClass =
    mode === "create"
      ? "space-y-4"
      : "grid grid-cols-1 gap-4 md:grid-cols-2";
  const bottomCardClass = mode === "create" ? undefined : "md:col-span-2";
  const actionClass =
    mode === "create"
      ? "flex justify-end gap-3"
      : "flex justify-end gap-3 md:col-span-2";

  const handleMacAddressChange = (value: string) => {
    const cleanValue = value.replace(/[^0-9a-fA-F]/g, "");
    let formatted = "";

    for (let index = 0; index < cleanValue.length; index += 1) {
      if (index > 0 && index % 2 === 0) {
        formatted += ":";
      }
      formatted += cleanValue[index];
    }

    setFormValues((current) => ({
      ...current,
      macLan: formatted.toUpperCase().slice(0, 17),
    }));
  };

  const handleSelectChange = (
    field: keyof PcAssetFormValues,
    option: SelectOption | null
  ) => {
    setFormValues((current) => ({
      ...current,
      [field]: option ? Number(option.value) : null,
    }));
  };

  const handleBrandChange = (option: SelectOption | null) => {
    setFormValues((current) => ({
      ...current,
      brandOptionId: option ? Number(option.value) : null,
      namaAsset: option?.label ?? "",
    }));
  };

  const getSelectedOption = (
    options: SelectOption[],
    value: number | null
  ): SelectOption | null => {
    if (value === null) {
      return null;
    }

    return options.find((option) => Number(option.value) === value) ?? null;
  };

  const selectedBrandOption =
    getSelectedOption(selectOptions.brand, formValues.brandOptionId) ??
    (formValues.namaAsset.trim()
      ? {
          value: `custom:${formValues.namaAsset}`,
          label: formValues.namaAsset,
        }
      : null);

  const submitForm = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formValues.namaAsset.trim()) {
      toast.error("Brand wajib dipilih.");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        ...formValues,
        namaAsset: formValues.namaAsset.trim(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={submitForm} className={formClass}>
      <Card>
        <CardHeader>
          <CardTitle>Common Asset Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={rowClass}>
            <Label htmlFor="brand">Brand Casing</Label>
            <div>
              <Select
                inputId="brand"
                options={selectOptions.brand}
                value={selectedBrandOption}
                onChange={handleBrandChange}
                placeholder="Select brand"
                isClearable
                isSearchable
              />
            </div>
          </div>
          <div className={rowClass}>
            <Label htmlFor="nomorSeri">Serial Number</Label>
            <Input
              id="nomorSeri"
              value={formValues.nomorSeri}
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,
                  nomorSeri: event.target.value.toUpperCase(),
                }))
              }
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>PC Specifications</CardTitle>
        </CardHeader>
        <CardContent className={specsClass}>
          <div className={rowClass}>
            <Label>Color</Label>
            <div>
              <Select
                options={selectOptions.color}
                value={getSelectedOption(
                  selectOptions.color,
                  formValues.colorOptionId
                )}
                onChange={(option) => handleSelectChange("colorOptionId", option)}
                placeholder="Select color"
                isClearable
              />
            </div>
          </div>
          <div className={rowClass}>
            <Label>Monitor</Label>
            <div>
              <Select
                options={selectOptions.monitor}
                value={getSelectedOption(
                  selectOptions.monitor,
                  formValues.monitorOptionId
                )}
                onChange={(option) =>
                  handleSelectChange("monitorOptionId", option)
                }
                placeholder="Select monitor"
                isClearable
              />
            </div>
          </div>
          <div className={rowClass}>
            <Label>UPS</Label>
            <div>
              <Select
                options={selectOptions.ups}
                value={getSelectedOption(
                  selectOptions.ups,
                  formValues.upsOptionId
                )}
                onChange={(option) => handleSelectChange("upsOptionId", option)}
                placeholder="Select UPS"
                isClearable
              />
            </div>
          </div>
          <div className={rowClass}>
            <Label>Processor</Label>
            <div>
              <Select
                options={selectOptions.processor}
                value={getSelectedOption(
                  selectOptions.processor,
                  formValues.processorOptionId
                )}
                onChange={(option) =>
                  handleSelectChange("processorOptionId", option)
                }
                placeholder="Select processor"
                isClearable
              />
            </div>
          </div>
          <div className={rowClass}>
            <Label>Mother Board</Label>
            <div>
              <Select
                options={selectOptions.motherboard}
                value={getSelectedOption(
                  selectOptions.motherboard,
                  formValues.motherboardOptionId
                )}
                onChange={(option) =>
                  handleSelectChange("motherboardOptionId", option)
                }
                placeholder="Select motherboard"
                isClearable
              />
            </div>
          </div>
          <div className={rowClass}>
            <Label>RAM</Label>
            <div>
              <Select
                options={selectOptions.ram}
                value={getSelectedOption(selectOptions.ram, formValues.ramOptionId)}
                onChange={(option) => handleSelectChange("ramOptionId", option)}
                placeholder="Select RAM"
                isClearable
              />
            </div>
          </div>
          <div className={rowClass}>
            <Label>Storage Type</Label>
            <div>
              <Select
                options={selectOptions.storage}
                value={getSelectedOption(
                  selectOptions.storage,
                  formValues.storageTypeOptionId
                )}
                onChange={(option) =>
                  handleSelectChange("storageTypeOptionId", option)
                }
                placeholder="Select storage type"
                isClearable
              />
            </div>
          </div>
          <div className={rowClass}>
            <Label>Graphic</Label>
            <div>
              <Select
                options={selectOptions.graphic}
                value={getSelectedOption(
                  selectOptions.graphic,
                  formValues.graphicOptionId
                )}
                onChange={(option) => handleSelectChange("graphicOptionId", option)}
                placeholder="Select graphic"
                isClearable
              />
            </div>
          </div>
          <div className={rowClass}>
            <Label htmlFor="macLan">MAC LAN</Label>
            <Input
              id="macLan"
              value={formValues.macLan}
              onChange={(event) => handleMacAddressChange(event.target.value)}
              placeholder="XX:XX:XX:XX:XX:XX"
              maxLength={17}
            />
          </div>
          <div className={rowClass}>
            <Label>Power Supply</Label>
            <div>
              <Select
                options={selectOptions.power}
                value={getSelectedOption(
                  selectOptions.power,
                  formValues.powerOptionId
                )}
                onChange={(option) => handleSelectChange("powerOptionId", option)}
                placeholder="Select power supply"
                isClearable
              />
            </div>
          </div>
          <div className={rowClass}>
            <Label>Operating System</Label>
            <div>
              <Select
                options={selectOptions.os}
                value={getSelectedOption(selectOptions.os, formValues.osOptionId)}
                onChange={(option) => handleSelectChange("osOptionId", option)}
                placeholder="Select operating system"
                isClearable
              />
            </div>
          </div>
          <div className={rowClass}>
            <Label>License</Label>
            <div>
              <Select
                options={selectOptions.license}
                value={getSelectedOption(
                  selectOptions.license,
                  formValues.licenseOptionId
                )}
                onChange={(option) =>
                  handleSelectChange("licenseOptionId", option)
                }
                placeholder="Select license"
                isClearable
              />
            </div>
          </div>

          <div
            className={
              mode === "create"
                ? "rounded-md border bg-slate-50 p-4 dark:bg-slate-900"
                : "md:col-span-2 rounded-md border bg-slate-50 p-4 dark:bg-slate-900"
            }
          >
            <div
              className={
                mode === "create"
                  ? "space-y-4"
                  : "grid grid-cols-1 gap-4 md:grid-cols-2"
              }
            >
              <div className={rowClass}>
                <Label>Microsoft Office</Label>
                <div>
                  <Select
                    options={selectOptions.office}
                    value={getSelectedOption(
                      selectOptions.office,
                      formValues.microsoftOfficeOptionId
                    )}
                    onChange={(option) =>
                      handleSelectChange("microsoftOfficeOptionId", option)
                    }
                    placeholder="Select office"
                    isClearable
                  />
                </div>
              </div>
              <div className={mode === "create" ? rowClass : "flex items-center gap-2 pt-7"}>
                <Label htmlFor="hasOfficeAccount">
                  {mode === "edit"
                    ? "Update Office Account Credential?"
                    : "Include Office Account Credential?"}
                </Label>
                <Checkbox
                  id="hasOfficeAccount"
                  checked={formValues.hasOfficeAccount}
                  onCheckedChange={(checked) =>
                    setFormValues((current) => ({
                      ...current,
                      hasOfficeAccount: checked === true,
                    }))
                  }
                />
              </div>
            </div>

            {formValues.hasOfficeAccount ? (
              <div className="mt-4 grid grid-cols-1 gap-4 border-l-2 border-blue-500 pl-4">
                <div
                  className={
                    mode === "create"
                      ? "space-y-4"
                      : "grid grid-cols-1 gap-4 md:grid-cols-2"
                  }
                >
                  <div className={rowClass}>
                    <Label htmlFor="officeEmail">Office Email</Label>
                    <Input
                      id="officeEmail"
                      type="email"
                      value={formValues.officeEmail}
                      onChange={(event) =>
                        setFormValues((current) => ({
                          ...current,
                          officeEmail: event.target.value,
                        }))
                      }
                      required={formValues.hasOfficeAccount}
                    />
                  </div>
                  <div className={rowClass}>
                    <Label htmlFor="officePassword">Office Password</Label>
                    <Input
                      id="officePassword"
                      value={formValues.officePassword}
                      onChange={(event) =>
                        setFormValues((current) => ({
                          ...current,
                          officePassword: event.target.value,
                        }))
                      }
                      required={formValues.hasOfficeAccount}
                    />
                  </div>
                  <div className={rowClass}>
                    <Label htmlFor="officeLicenseExpiry">License Expiry</Label>
                    <Input
                      id="officeLicenseExpiry"
                      type="date"
                      value={formValues.officeLicenseExpiry}
                      onChange={(event) =>
                        setFormValues((current) => ({
                          ...current,
                          officeLicenseExpiry: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div
                    className={
                      mode === "create"
                        ? rowClass
                        : "flex items-center gap-2 pt-7"
                    }
                  >
                    <Label htmlFor="officeIsActive">Account is Active</Label>
                    <Checkbox
                      id="officeIsActive"
                      checked={formValues.officeIsActive}
                      onCheckedChange={(checked) =>
                        setFormValues((current) => ({
                          ...current,
                          officeIsActive: checked === true,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className={bottomCardClass}>
        <CardHeader>
          <CardTitle>Purchase & Status</CardTitle>
        </CardHeader>
        <CardContent
          className={
            mode === "create"
              ? "space-y-4"
              : "grid grid-cols-1 gap-4 md:grid-cols-3"
          }
        >
          <div className={rowClass}>
            <Label htmlFor="tanggalPembelian">Purchase Date</Label>
            <Input
              id="tanggalPembelian"
              type="date"
              value={formValues.tanggalPembelian}
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,
                  tanggalPembelian: event.target.value,
                }))
              }
            />
          </div>
          <div className={rowClass}>
            <Label htmlFor="tanggalGaransi">Warranty Date</Label>
            <Input
              id="tanggalGaransi"
              type="date"
              value={formValues.tanggalGaransi}
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,
                  tanggalGaransi: event.target.value,
                }))
              }
            />
          </div>
          <div className={rowClass}>
            <Label htmlFor="statusAsset">Asset Status</Label>
            <div>
              <Select
                inputId="statusAsset"
                options={assetStatuses}
                value={
                  assetStatuses.find(
                    (option) => option.value === formValues.statusAsset
                  ) ?? null
                }
                onChange={(option) =>
                  setFormValues((current) => ({
                    ...current,
                    statusAsset: option?.value ?? null,
                  }))
                }
                placeholder="Select status"
                isClearable
                isSearchable
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className={actionClass}>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

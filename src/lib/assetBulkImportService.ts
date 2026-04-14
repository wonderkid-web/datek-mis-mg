"use server";

import { prisma } from "@/lib/prisma";
import { createAssetAndLaptopSpecs } from "@/lib/assetService";
import { createAssetAndIntelNucSpecs } from "@/lib/intelNucService";
import { createAssetAndPcSpecs } from "@/lib/pcService";
import { AssetImportFamily, ParsedAssetImportRow } from "@/lib/assetImportConfig";
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
import { getLaptopTypeOptions } from "@/lib/laptopTypeService";
import { getPcMonitorOptions } from "@/lib/pcMonitorService";
import { getPcMotherboardOptions } from "@/lib/pcMotherboardService";
import { getPcUpsOptions } from "@/lib/pcUpsService";

type LookupOption = {
  id: number;
  value: string;
};

type LookupMap = Map<string, LookupOption>;

interface PreparedImportRow {
  rowNumber: number;
  summary: string;
  serialNumber: string;
  statusAsset: string;
  errors: string[];
  assetData?: {
    namaAsset: string;
    categoryId?: number;
    nomorSeri: string;
    tanggalPembelian?: Date | null;
    tanggalGaransi?: Date | null;
    statusAsset: string;
    lokasiFisik?: string | null;
  };
  specsData?: Record<string, unknown>;
  officeAccountData?: {
    email: string;
    password: string;
    licenseExpiry?: Date | null;
    isActive: boolean;
  } | null;
}

export interface AssetImportPreviewRow {
  rowNumber: number;
  summary: string;
  serialNumber: string;
  statusAsset: string;
  isValid: boolean;
  errors: string[];
}

export interface AssetImportPreviewResult {
  family: AssetImportFamily;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  rows: AssetImportPreviewRow[];
}

export interface AssetImportCommitResult {
  family: AssetImportFamily;
  importedRows: number;
  failedRows: Array<{
    rowNumber: number;
    summary: string;
    error: string;
  }>;
}

const STATUS_MAP = new Map<string, string>([
  ["good", "GOOD"],
  ["needreparation", "NEED REPARATION"],
  ["broken", "BROKEN"],
  ["missing", "MISSING"],
  ["sell", "SELL"],
]);

function normalizeLookupValue(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function buildLookupMap(options: LookupOption[]): LookupMap {
  return new Map(
    options.map((option) => [normalizeLookupValue(option.value), option] as const)
  );
}

function readString(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function toNullableString(value: unknown) {
  const text = readString(value);
  return text ? text : null;
}

function parseStatusAsset(value: unknown) {
  const rawValue = readString(value);
  if (!rawValue) {
    return "GOOD";
  }

  return STATUS_MAP.get(normalizeLookupValue(rawValue)) ?? "";
}

function parseDateValue(value: unknown, label: string, errors: string[]) {
  const rawValue = readString(value);
  if (!rawValue) {
    return null;
  }

  const yearFirstMatch = rawValue.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (yearFirstMatch) {
    const [, year, month, day] = yearFirstMatch;
    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  }

  const dayFirstMatch = rawValue.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dayFirstMatch) {
    const [, day, month, year] = dayFirstMatch;
    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  }

  const parsedDate = new Date(rawValue);
  if (Number.isNaN(parsedDate.getTime())) {
    errors.push(`${label} tidak valid.`);
    return null;
  }

  return parsedDate;
}

function parseBooleanValue(value: unknown, label: string, errors: string[]) {
  const rawValue = readString(value);
  if (!rawValue) {
    return true;
  }

  const normalizedValue = normalizeLookupValue(rawValue);
  if (["true", "yes", "ya", "1", "active"].includes(normalizedValue)) {
    return true;
  }
  if (["false", "no", "tidak", "0", "inactive"].includes(normalizedValue)) {
    return false;
  }

  errors.push(`${label} harus TRUE/FALSE atau Active/Inactive.`);
  return true;
}

function formatLicenseKey(value: unknown, errors: string[]) {
  const rawValue = readString(value);
  if (!rawValue) {
    return null;
  }

  const normalizedValue = rawValue.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (normalizedValue.length > 25) {
    errors.push("License Key maksimal 25 karakter alfanumerik.");
    return null;
  }

  let formattedValue = "";
  for (let index = 0; index < normalizedValue.length; index += 1) {
    if (index > 0 && index % 5 === 0) {
      formattedValue += "-";
    }
    formattedValue += normalizedValue[index];
  }

  return formattedValue || null;
}

function formatMacAddress(value: unknown, label: string, errors: string[]) {
  const rawValue = readString(value);
  if (!rawValue) {
    return null;
  }

  const normalizedValue = rawValue.replace(/[^a-fA-F0-9]/g, "").toUpperCase();
  if (normalizedValue.length !== 12) {
    errors.push(`${label} harus terdiri dari 12 digit hex.`);
    return null;
  }

  const segments: string[] = [];
  for (let index = 0; index < normalizedValue.length; index += 2) {
    segments.push(normalizedValue.slice(index, index + 2));
  }

  return segments.join(":");
}

function resolveOptionId(
  value: unknown,
  label: string,
  lookupMap: LookupMap,
  errors: string[]
) {
  const rawValue = readString(value);
  if (!rawValue) {
    return null;
  }

  const option = lookupMap.get(normalizeLookupValue(rawValue));
  if (!option) {
    errors.push(`${label} "${rawValue}" tidak ditemukan di master data.`);
    return null;
  }

  return option;
}

async function loadLookups() {
  const [
    brandOptions,
    typeOptions,
    processorOptions,
    ramOptions,
    storageOptions,
    osOptions,
    powerOptions,
    microsoftOfficeOptions,
    colorOptions,
    graphicOptions,
    licenseOptions,
    monitorOptions,
    motherboardOptions,
    upsOptions,
  ] = await Promise.all([
    getLaptopBrandOptions(),
    getLaptopTypeOptions(),
    getLaptopProcessorOptions(),
    getLaptopRamOptions(),
    getLaptopStorageOptions(),
    getLaptopOsOptions(),
    getLaptopPowerOptions(),
    getLaptopMicrosoftOffices(),
    getLaptopColors(),
    getLaptopGraphicOptions(),
    getLaptopLicenseOptions(),
    getPcMonitorOptions(),
    getPcMotherboardOptions(),
    getPcUpsOptions(),
  ]);

  return {
    brand: buildLookupMap(brandOptions),
    type: buildLookupMap(typeOptions),
    processor: buildLookupMap(processorOptions),
    ram: buildLookupMap(ramOptions),
    storageType: buildLookupMap(storageOptions),
    os: buildLookupMap(osOptions),
    power: buildLookupMap(powerOptions),
    microsoftOffice: buildLookupMap(microsoftOfficeOptions),
    color: buildLookupMap(colorOptions),
    graphic: buildLookupMap(graphicOptions),
    license: buildLookupMap(licenseOptions),
    monitor: buildLookupMap(monitorOptions),
    motherboard: buildLookupMap(motherboardOptions),
    ups: buildLookupMap(upsOptions),
  };
}

async function getExistingSerials(rows: ParsedAssetImportRow[]) {
  const normalizedSerials = Array.from(
    new Set(
      rows
        .map((row) => readString(row.serialNumber).toUpperCase())
        .filter(Boolean)
    )
  );

  if (!normalizedSerials.length) {
    return new Set<string>();
  }

  const existingAssets = await prisma.asset.findMany({
    where: {
      OR: normalizedSerials.map((serialNumber) => ({
        nomorSeri: serialNumber,
      })),
    },
    select: {
      nomorSeri: true,
    },
  });

  return new Set(existingAssets.map((asset) => asset.nomorSeri.toUpperCase()));
}

async function prepareRows(
  family: AssetImportFamily,
  rows: ParsedAssetImportRow[]
): Promise<PreparedImportRow[]> {
  const lookups = await loadLookups();
  const existingSerials = await getExistingSerials(rows);
  const fileSerialCounts = new Map<string, number>();

  rows.forEach((row) => {
    const serialNumber = readString(row.serialNumber).toUpperCase();
    if (!serialNumber) {
      return;
    }

    fileSerialCounts.set(serialNumber, (fileSerialCounts.get(serialNumber) ?? 0) + 1);
  });

  return rows.map((row, index) => {
    const errors: string[] = [];
    const rowNumber = index + 2;
    const serialNumber = readString(row.serialNumber).toUpperCase();
    const statusAsset = parseStatusAsset(row.statusAsset);

    if (!serialNumber) {
      errors.push("Serial Number wajib diisi.");
    } else {
      if ((fileSerialCounts.get(serialNumber) ?? 0) > 1) {
        errors.push("Serial Number duplikat di file import.");
      }
      if (existingSerials.has(serialNumber)) {
        errors.push("Serial Number sudah ada di database.");
      }
    }

    if (!statusAsset) {
      errors.push(`Status Asset "${readString(row.statusAsset)}" tidak valid.`);
    }

    const purchaseDate = parseDateValue(row.purchaseDate, "Purchase Date", errors);
    const warrantyDate = parseDateValue(row.warrantyDate, "Warranty Date", errors);
    const lokasiFisik = toNullableString(row.lokasiFisik);
    const licenseKey = formatLicenseKey(row.licenseKey, errors);
    const macLan = formatMacAddress(row.macLan, "MAC LAN", errors);
    const macWlan = formatMacAddress(row.macWlan, "MAC WLAN", errors);

    const processor = resolveOptionId(row.processor, "Processor", lookups.processor, errors);
    const ram = resolveOptionId(row.ram, "RAM", lookups.ram, errors);
    const storageType = resolveOptionId(row.storageType, "Storage Type", lookups.storageType, errors);
    const os = resolveOptionId(row.os, "Operating System", lookups.os, errors);
    const power = resolveOptionId(row.power, family === "PC" ? "Power Supply" : "Power", lookups.power, errors);
    const microsoftOffice = resolveOptionId(row.microsoftOffice, "Microsoft Office", lookups.microsoftOffice, errors);
    const color = resolveOptionId(row.color, "Color", lookups.color, errors);
    const graphic = resolveOptionId(row.graphic, "Graphic", lookups.graphic, errors);
    const license = resolveOptionId(row.license, "License", lookups.license, errors);

    let summary = readString(row.namaAsset || row.brand) || `Row ${rowNumber}`;

    const officeEmail = readString(row.officeEmail);
    const officePassword = readString(row.officePassword);
    const hasOfficeAccountInput =
      Boolean(officeEmail) ||
      Boolean(officePassword) ||
      Boolean(readString(row.officeLicenseExpiry)) ||
      Boolean(readString(row.officeIsActive));

    let officeAccountData: PreparedImportRow["officeAccountData"] = null;
    if (hasOfficeAccountInput) {
      if (!officeEmail) {
        errors.push("Office Email wajib diisi jika Office Account digunakan.");
      }
      if (!officePassword) {
        errors.push("Office Password wajib diisi jika Office Account digunakan.");
      }

      officeAccountData = {
        email: officeEmail,
        password: officePassword,
        licenseExpiry: parseDateValue(
          row.officeLicenseExpiry,
          "Office License Expiry",
          errors
        ),
        isActive: parseBooleanValue(
          row.officeIsActive,
          "Office Is Active",
          errors
        ),
      };
    }

    if (family === "LAPTOP" || family === "INTEL_NUC") {
      const namaAssetValue = readString(row.namaAsset);
      if (!namaAssetValue) {
        errors.push("Model wajib diisi.");
      }

      const model = resolveOptionId(namaAssetValue, "Model", lookups.type, errors);
      const brand = resolveOptionId(row.brand, "Brand", lookups.brand, errors);

      summary = namaAssetValue || summary;

      return {
        rowNumber,
        summary,
        serialNumber,
        statusAsset: statusAsset || "GOOD",
        errors,
        assetData: {
          namaAsset: model?.value || namaAssetValue,
          categoryId: family === "LAPTOP" ? 1 : 2,
          nomorSeri: serialNumber,
          tanggalPembelian: purchaseDate,
          tanggalGaransi: warrantyDate,
          statusAsset: statusAsset || "GOOD",
          lokasiFisik,
        },
        specsData: {
          processorOptionId: processor?.id ?? null,
          ramOptionId: ram?.id ?? null,
          storageTypeOptionId: storageType?.id ?? null,
          osOptionId: os?.id ?? null,
          powerOptionId: power?.id ?? null,
          microsoftOfficeOptionId: microsoftOffice?.id ?? null,
          colorOptionId: color?.id ?? null,
          brandOptionId: brand?.id ?? null,
          typeOptionId: model?.id ?? null,
          macWlan,
          macLan,
          graphicOptionId: graphic?.id ?? null,
          licenseKey,
          licenseOptionId: license?.id ?? null,
        },
        officeAccountData,
      };
    }

    const brand = resolveOptionId(row.brand, "Brand", lookups.brand, errors);
    const monitor = resolveOptionId(row.monitor, "Monitor", lookups.monitor, errors);
    const motherboard = resolveOptionId(
      row.motherboard,
      "Motherboard",
      lookups.motherboard,
      errors
    );
    const ups = resolveOptionId(row.ups, "UPS", lookups.ups, errors);

    if (!brand?.value) {
      errors.push("Brand wajib diisi.");
    }

    summary = brand?.value || summary;

    return {
      rowNumber,
      summary,
      serialNumber,
      statusAsset: statusAsset || "GOOD",
      errors,
      assetData: {
        namaAsset: brand?.value || "",
        nomorSeri: serialNumber,
        tanggalPembelian: purchaseDate,
        tanggalGaransi: warrantyDate,
        statusAsset: statusAsset || "GOOD",
        lokasiFisik,
      },
      specsData: {
        processorOptionId: processor?.id ?? null,
        ramOptionId: ram?.id ?? null,
        storageTypeOptionId: storageType?.id ?? null,
        licenseOptionId: license?.id ?? null,
        licenseKey,
        osOptionId: os?.id ?? null,
        powerOptionId: power?.id ?? null,
        microsoftOfficeOptionId: microsoftOffice?.id ?? null,
        colorOptionId: color?.id ?? null,
        graphicOptionId: graphic?.id ?? null,
        monitorOptionId: monitor?.id ?? null,
        motherboardOptionId: motherboard?.id ?? null,
        upsOptionId: ups?.id ?? null,
        macLan,
      },
      officeAccountData,
    };
  });
}

export async function previewAssetImport(
  family: AssetImportFamily,
  rows: ParsedAssetImportRow[]
): Promise<AssetImportPreviewResult> {
  const preparedRows = await prepareRows(family, rows);
  const previewRows: AssetImportPreviewRow[] = preparedRows.map((row) => ({
    rowNumber: row.rowNumber,
    summary: row.summary,
    serialNumber: row.serialNumber,
    statusAsset: row.statusAsset,
    isValid: row.errors.length === 0,
    errors: row.errors,
  }));

  return {
    family,
    totalRows: previewRows.length,
    validRows: previewRows.filter((row) => row.isValid).length,
    invalidRows: previewRows.filter((row) => !row.isValid).length,
    rows: previewRows,
  };
}

function extractErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Import gagal diproses.";
}

export async function importAssetRows(
  family: AssetImportFamily,
  rows: ParsedAssetImportRow[]
): Promise<AssetImportCommitResult> {
  const preparedRows = await prepareRows(family, rows);
  const invalidRows = preparedRows.filter((row) => row.errors.length > 0);

  if (invalidRows.length > 0) {
    return {
      family,
      importedRows: 0,
      failedRows: invalidRows.map((row) => ({
        rowNumber: row.rowNumber,
        summary: row.summary,
        error: row.errors.join(" "),
      })),
    };
  }

  let importedRows = 0;
  const failedRows: AssetImportCommitResult["failedRows"] = [];

  for (const row of preparedRows) {
    try {
      if (family === "LAPTOP") {
        await createAssetAndLaptopSpecs(
          row.assetData as NonNullable<PreparedImportRow["assetData"]> & { categoryId: number },
          row.specsData ?? {},
          row.officeAccountData
        );
      } else if (family === "INTEL_NUC") {
        await createAssetAndIntelNucSpecs(
          row.assetData as NonNullable<PreparedImportRow["assetData"]> & { categoryId: number },
          row.specsData ?? {},
          row.officeAccountData
        );
      } else {
        await createAssetAndPcSpecs(
          row.assetData as NonNullable<PreparedImportRow["assetData"]>,
          row.specsData ?? {},
          row.officeAccountData
        );
      }

      importedRows += 1;
    } catch (error) {
      failedRows.push({
        rowNumber: row.rowNumber,
        summary: row.summary,
        error: extractErrorMessage(error),
      });
    }
  }

  return {
    family,
    importedRows,
    failedRows,
  };
}

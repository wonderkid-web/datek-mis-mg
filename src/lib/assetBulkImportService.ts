"use server";

import { prisma } from "@/lib/prisma";
import { createAssetAndLaptopSpecs } from "@/lib/assetService";
import { createAssetAndIntelNucSpecs } from "@/lib/intelNucService";
import { createAssetAndPcSpecs } from "@/lib/pcService";
import { getUserFacingAssetError } from "@/lib/errorMessage";
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
type MissingMasterDataKey =
  | "brand"
  | "type"
  | "processor"
  | "ram"
  | "storageType"
  | "os"
  | "power"
  | "microsoftOffice"
  | "color"
  | "graphic"
  | "license"
  | "monitor"
  | "motherboard"
  | "ups";

interface MissingMasterDataEntry {
  key: MissingMasterDataKey;
  label: string;
  value: string;
}

interface PreparedImportRow {
  rowNumber: number;
  summary: string;
  serialNumber: string;
  statusAsset: string;
  errors: string[];
  missingMasterData: MissingMasterDataEntry[];
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
  missingMasterData: AssetImportMissingMasterDataGroup[];
  missingMasterDataSql: string | null;
}

export interface AssetImportMissingMasterDataGroup {
  key: MissingMasterDataKey;
  label: string;
  items: string[];
}

export interface AssetImportCreateMissingMasterDataResult {
  family: AssetImportFamily;
  createdItems: number;
  groups: AssetImportMissingMasterDataGroup[];
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

function escapeSqlValue(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
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
  errors: string[],
  missingEntries?: MissingMasterDataEntry[],
  missingKey?: MissingMasterDataKey
) {
  const rawValue = readString(value);
  if (!rawValue) {
    return null;
  }

  const option = lookupMap.get(normalizeLookupValue(rawValue));
  if (!option) {
    errors.push(`${label} "${rawValue}" tidak ditemukan di master data.`);
    if (missingEntries && missingKey) {
      missingEntries.push({
        key: missingKey,
        label,
        value: rawValue,
      });
    }
    return null;
  }

  return option;
}

function collectMissingMasterData(
  preparedRows: PreparedImportRow[]
): AssetImportMissingMasterDataGroup[] {
  const grouped = new Map<MissingMasterDataKey, { label: string; values: Map<string, string> }>();

  preparedRows.forEach((row) => {
    row.missingMasterData.forEach((entry) => {
      const currentGroup =
        grouped.get(entry.key) ??
        { label: entry.label, values: new Map<string, string>() };

      currentGroup.values.set(normalizeLookupValue(entry.value), entry.value);
      grouped.set(entry.key, currentGroup);
    });
  });

  return Array.from(grouped.entries())
    .map(([key, group]) => ({
      key,
      label: group.label,
      items: Array.from(group.values.values()).sort((left, right) =>
        left.localeCompare(right, "id")
      ),
    }))
    .sort((left, right) => left.label.localeCompare(right.label, "id"));
}

function buildMissingMasterDataSql(groups: AssetImportMissingMasterDataGroup[]) {
  if (!groups.length) {
    return null;
  }

  const tableMap: Record<MissingMasterDataKey, string> = {
    brand: "laptop_brand_options",
    type: "laptop_type_options",
    processor: "laptop_processor_options",
    ram: "laptop_ram_options",
    storageType: "laptop_storage_type_options",
    os: "laptop_os_options",
    power: "laptop_power_options",
    microsoftOffice: "laptop_microsoft_office_options",
    color: "laptop_color_options",
    graphic: "laptop_graphic_options",
    license: "laptop_licence_options",
    monitor: "pc_monitor_options",
    motherboard: "pc_motherboard_options",
    ups: "pc_ups_options",
  };

  return groups
    .map((group) => {
      const values = group.items
        .map((item) => `('${escapeSqlValue(item)}')`)
        .join(",\n  ");

      return `INSERT IGNORE INTO \`${tableMap[group.key]}\` (\`value\`) VALUES\n  ${values};`;
    })
    .join("\n\n");
}

async function createMissingMasterDataGroups(
  groups: AssetImportMissingMasterDataGroup[]
) {
  let createdItems = 0;

  for (const group of groups) {
    if (!group.items.length) {
      continue;
    }

    const data = group.items.map((value) => ({ value }));

    switch (group.key) {
      case "brand":
        createdItems += (await prisma.laptopBrandOption.createMany({ data, skipDuplicates: true })).count;
        break;
      case "type":
        createdItems += (await prisma.laptopTypeOption.createMany({ data, skipDuplicates: true })).count;
        break;
      case "processor":
        createdItems += (await prisma.laptopProcessorOption.createMany({ data, skipDuplicates: true })).count;
        break;
      case "ram":
        createdItems += (await prisma.laptopRamOption.createMany({ data, skipDuplicates: true })).count;
        break;
      case "storageType":
        createdItems += (await prisma.laptopStorageTypeOption.createMany({ data, skipDuplicates: true })).count;
        break;
      case "os":
        createdItems += (await prisma.laptopOsOption.createMany({ data, skipDuplicates: true })).count;
        break;
      case "power":
        createdItems += (await prisma.laptopPowerOption.createMany({ data, skipDuplicates: true })).count;
        break;
      case "microsoftOffice":
        createdItems += (await prisma.laptopMicrosoftOfficeOption.createMany({ data, skipDuplicates: true })).count;
        break;
      case "color":
        createdItems += (await prisma.laptopColorOption.createMany({ data, skipDuplicates: true })).count;
        break;
      case "graphic":
        createdItems += (await prisma.laptopGraphicOption.createMany({ data, skipDuplicates: true })).count;
        break;
      case "license":
        createdItems += (await prisma.laptopLicenseOption.createMany({ data, skipDuplicates: true })).count;
        break;
      case "monitor":
        createdItems += (await prisma.pcMonitorOption.createMany({ data, skipDuplicates: true })).count;
        break;
      case "motherboard":
        createdItems += (await prisma.pcMotherboardOption.createMany({ data, skipDuplicates: true })).count;
        break;
      case "ups":
        createdItems += (await prisma.pcUpsOption.createMany({ data, skipDuplicates: true })).count;
        break;
      default:
        break;
    }
  }

  return createdItems;
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
    const missingMasterData: MissingMasterDataEntry[] = [];
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

    const processor = resolveOptionId(row.processor, "Processor", lookups.processor, errors, missingMasterData, "processor");
    const ram = resolveOptionId(row.ram, "RAM", lookups.ram, errors, missingMasterData, "ram");
    const storageType = resolveOptionId(row.storageType, "Storage Type", lookups.storageType, errors, missingMasterData, "storageType");
    const os = resolveOptionId(row.os, "Operating System", lookups.os, errors, missingMasterData, "os");
    const power = resolveOptionId(
      row.power,
      family === "PC" ? "Power Supply" : "Power",
      lookups.power,
      errors,
      missingMasterData,
      "power"
    );
    const microsoftOffice = resolveOptionId(
      row.microsoftOffice,
      "Microsoft Office",
      lookups.microsoftOffice,
      errors,
      missingMasterData,
      "microsoftOffice"
    );
    const color = resolveOptionId(row.color, "Color", lookups.color, errors, missingMasterData, "color");
    const graphic = resolveOptionId(row.graphic, "Graphic", lookups.graphic, errors, missingMasterData, "graphic");
    const license = resolveOptionId(row.license, "License", lookups.license, errors, missingMasterData, "license");

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

      const model = resolveOptionId(
        namaAssetValue,
        "Model",
        lookups.type,
        errors,
        missingMasterData,
        "type"
      );
      const brand = resolveOptionId(
        row.brand,
        "Brand",
        lookups.brand,
        errors,
        missingMasterData,
        "brand"
      );

      summary = namaAssetValue || summary;

      return {
        rowNumber,
        summary,
        serialNumber,
        statusAsset: statusAsset || "GOOD",
        errors,
        missingMasterData,
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

    const brand = resolveOptionId(
      row.brand,
      "Brand",
      lookups.brand,
      errors,
      missingMasterData,
      "brand"
    );
    const monitor = resolveOptionId(
      row.monitor,
      "Monitor",
      lookups.monitor,
      errors,
      missingMasterData,
      "monitor"
    );
    const motherboard = resolveOptionId(
      row.motherboard,
      "Motherboard",
      lookups.motherboard,
      errors,
      missingMasterData,
      "motherboard"
    );
    const ups = resolveOptionId(row.ups, "UPS", lookups.ups, errors, missingMasterData, "ups");

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
      missingMasterData,
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
  const missingMasterData = collectMissingMasterData(preparedRows);
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
    missingMasterData,
    missingMasterDataSql: buildMissingMasterDataSql(missingMasterData),
  };
}

export async function createMissingAssetImportMasterData(
  family: AssetImportFamily,
  rows: ParsedAssetImportRow[]
): Promise<AssetImportCreateMissingMasterDataResult> {
  const preparedRows = await prepareRows(family, rows);
  const missingMasterData = collectMissingMasterData(preparedRows);

  if (!missingMasterData.length) {
    return {
      family,
      createdItems: 0,
      groups: [],
    };
  }

  const createdItems = await createMissingMasterDataGroups(missingMasterData);

  return {
    family,
    createdItems,
    groups: missingMasterData,
  };
}

function extractErrorMessage(error: unknown) {
  return getUserFacingAssetError(error, "Import gagal diproses.");
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

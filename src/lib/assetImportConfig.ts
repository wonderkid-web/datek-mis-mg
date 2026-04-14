export type AssetImportFamily = "LAPTOP" | "INTEL_NUC" | "PC";

export type AssetImportFieldKey =
  | "namaAsset"
  | "brand"
  | "serialNumber"
  | "purchaseDate"
  | "warrantyDate"
  | "statusAsset"
  | "lokasiFisik"
  | "processor"
  | "ram"
  | "storageType"
  | "os"
  | "power"
  | "microsoftOffice"
  | "color"
  | "graphic"
  | "license"
  | "licenseKey"
  | "macWlan"
  | "macLan"
  | "monitor"
  | "motherboard"
  | "ups"
  | "officeEmail"
  | "officePassword"
  | "officeLicenseExpiry"
  | "officeIsActive";

export type ParsedAssetImportRow = Partial<Record<AssetImportFieldKey, string>>;

export interface AssetImportColumn {
  key: AssetImportFieldKey;
  templateHeader: string;
  label: string;
  aliases: string[];
}

export interface AssetImportFamilyConfig {
  label: string;
  description: string;
  columns: AssetImportColumn[];
  sampleRow: Record<string, string>;
}

const commonColumns: AssetImportColumn[] = [
  {
    key: "serialNumber",
    templateHeader: "serial_number",
    label: "Serial Number",
    aliases: ["serial_number", "serial number", "serial", "nomor_seri", "nomor seri"],
  },
  {
    key: "purchaseDate",
    templateHeader: "purchase_date",
    label: "Purchase Date",
    aliases: ["purchase_date", "purchase date", "tanggal_pembelian", "tanggal pembelian"],
  },
  {
    key: "warrantyDate",
    templateHeader: "warranty_date",
    label: "Warranty Date",
    aliases: ["warranty_date", "warranty date", "tanggal_garansi", "tanggal garansi"],
  },
  {
    key: "statusAsset",
    templateHeader: "status_asset",
    label: "Status Asset",
    aliases: ["status_asset", "status asset", "status"],
  },
  {
    key: "lokasiFisik",
    templateHeader: "lokasi_fisik",
    label: "Lokasi Fisik",
    aliases: ["lokasi_fisik", "lokasi fisik", "location", "lokasi"],
  },
  {
    key: "processor",
    templateHeader: "processor",
    label: "Processor",
    aliases: ["processor"],
  },
  {
    key: "ram",
    templateHeader: "ram",
    label: "RAM",
    aliases: ["ram"],
  },
  {
    key: "storageType",
    templateHeader: "storage_type",
    label: "Storage Type",
    aliases: ["storage_type", "storage type", "storage"],
  },
  {
    key: "os",
    templateHeader: "os",
    label: "Operating System",
    aliases: ["os", "operating_system", "operating system"],
  },
  {
    key: "power",
    templateHeader: "power",
    label: "Power",
    aliases: ["power", "power_supply", "power supply", "power_adaptor", "power adaptor"],
  },
  {
    key: "microsoftOffice",
    templateHeader: "microsoft_office",
    label: "Microsoft Office",
    aliases: ["microsoft_office", "microsoft office", "office"],
  },
  {
    key: "color",
    templateHeader: "color",
    label: "Color",
    aliases: ["color", "colour"],
  },
  {
    key: "graphic",
    templateHeader: "graphic",
    label: "Graphic",
    aliases: ["graphic", "graphics"],
  },
  {
    key: "license",
    templateHeader: "license",
    label: "License",
    aliases: ["license", "license_type", "license type"],
  },
  {
    key: "licenseKey",
    templateHeader: "license_key",
    label: "License Key",
    aliases: ["license_key", "license key"],
  },
  {
    key: "macLan",
    templateHeader: "mac_lan",
    label: "MAC LAN",
    aliases: ["mac_lan", "mac lan"],
  },
  {
    key: "officeEmail",
    templateHeader: "office_email",
    label: "Office Email",
    aliases: ["office_email", "office email"],
  },
  {
    key: "officePassword",
    templateHeader: "office_password",
    label: "Office Password",
    aliases: ["office_password", "office password"],
  },
  {
    key: "officeLicenseExpiry",
    templateHeader: "office_license_expiry",
    label: "Office License Expiry",
    aliases: ["office_license_expiry", "office license expiry"],
  },
  {
    key: "officeIsActive",
    templateHeader: "office_is_active",
    label: "Office Is Active",
    aliases: ["office_is_active", "office is active", "office_active", "office active"],
  },
];

export const ASSET_IMPORT_CONFIG: Record<AssetImportFamily, AssetImportFamilyConfig> = {
  LAPTOP: {
    label: "Laptop",
    description: "Bulk create asset Laptop dari file Excel dengan nama master data, bukan ID.",
    columns: [
      {
        key: "namaAsset",
        templateHeader: "model",
        label: "Model Laptop",
        aliases: ["model", "model_laptop", "model laptop", "nama_asset", "nama asset", "asset_name", "asset name"],
      },
      {
        key: "brand",
        templateHeader: "brand",
        label: "Brand",
        aliases: ["brand"],
      },
      ...commonColumns,
      {
        key: "macWlan",
        templateHeader: "mac_wlan",
        label: "MAC WLAN",
        aliases: ["mac_wlan", "mac wlan"],
      },
    ],
    sampleRow: {
      model: "IdeaPad 320",
      brand: "Lenovo",
      serial_number: "LAPTOP-001",
      purchase_date: "2026-04-14",
      warranty_date: "2027-04-14",
      status_asset: "GOOD",
      lokasi_fisik: "Head Office",
      processor: "Intel Core i5",
      ram: "8 GB DDR4",
      storage_type: "256 GB NVMe SSD",
      os: "Windows 11 Pro",
      power: "Adaptor 65 Watt",
      microsoft_office: "Office 365",
      color: "Black",
      graphic: "Intel Iris Xe",
      license: "OEM",
      license_key: "XXXXX-XXXXX-XXXXX-XXXXX-XXXXX",
      mac_wlan: "AA:BB:CC:DD:EE:FF",
      mac_lan: "11:22:33:44:55:66",
      office_email: "",
      office_password: "",
      office_license_expiry: "",
      office_is_active: "TRUE",
    },
  },
  INTEL_NUC: {
    label: "Intel NUC",
    description: "Bulk create asset Intel NUC dari file Excel dengan nama master data, bukan ID.",
    columns: [
      {
        key: "namaAsset",
        templateHeader: "model",
        label: "Model Intel NUC",
        aliases: ["model", "model_intel_nuc", "model intel nuc", "nama_asset", "nama asset", "asset_name", "asset name"],
      },
      {
        key: "brand",
        templateHeader: "brand",
        label: "Brand",
        aliases: ["brand"],
      },
      ...commonColumns,
      {
        key: "macWlan",
        templateHeader: "mac_wlan",
        label: "MAC WLAN",
        aliases: ["mac_wlan", "mac wlan"],
      },
    ],
    sampleRow: {
      model: "NUC14MNK3",
      brand: "Intel",
      serial_number: "NUC-001",
      purchase_date: "2026-04-14",
      warranty_date: "2027-04-14",
      status_asset: "GOOD",
      lokasi_fisik: "Head Office",
      processor: "Intel Core i3",
      ram: "8 GB DDR4",
      storage_type: "512 GB NVMe SSD",
      os: "Windows 11 Pro",
      power: "Adaptor 90 Watt",
      microsoft_office: "Office 365",
      color: "Black",
      graphic: "Intel UHD Graphics",
      license: "OEM",
      license_key: "XXXXX-XXXXX-XXXXX-XXXXX-XXXXX",
      mac_wlan: "AA:BB:CC:DD:EE:FF",
      mac_lan: "11:22:33:44:55:66",
      office_email: "",
      office_password: "",
      office_license_expiry: "",
      office_is_active: "TRUE",
    },
  },
  PC: {
    label: "PC",
    description: "Bulk create asset PC dari file Excel dengan nama master data, bukan ID.",
    columns: [
      {
        key: "brand",
        templateHeader: "brand",
        label: "Brand Casing",
        aliases: ["brand", "brand_casing", "brand casing", "nama_asset", "nama asset", "asset_name", "asset name"],
      },
      ...commonColumns,
      {
        key: "monitor",
        templateHeader: "monitor",
        label: "Monitor",
        aliases: ["monitor"],
      },
      {
        key: "motherboard",
        templateHeader: "motherboard",
        label: "Motherboard",
        aliases: ["motherboard", "mother_board", "mother board"],
      },
      {
        key: "ups",
        templateHeader: "ups",
        label: "UPS",
        aliases: ["ups"],
      },
    ],
    sampleRow: {
      brand: "Power UP",
      serial_number: "PC-001",
      purchase_date: "2026-04-14",
      warranty_date: "2027-04-14",
      status_asset: "GOOD",
      lokasi_fisik: "Head Office",
      processor: "Intel Celeron J3455 1.50GHz",
      ram: "8 GB DDR3 SODIMM",
      storage_type: "480 GB SATA SSD",
      os: "Windows 11 Home SL 64 Bit",
      power: "Corsair 450 Watt",
      microsoft_office: "Office 365",
      color: "Blue",
      graphic: "Intel UHD Graphics 620",
      monitor: "LG 15' LED A21L2",
      motherboard: "ASUS H110M",
      ups: "ICA 600 VA",
      license: "OEM",
      license_key: "XXXXX-XXXXX-XXXXX-XXXXX-XXXXX",
      mac_lan: "11:22:33:44:55:66",
      office_email: "",
      office_password: "",
      office_license_expiry: "",
      office_is_active: "TRUE",
    },
  },
};

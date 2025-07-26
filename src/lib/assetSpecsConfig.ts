import { Manufacture } from "./types";

interface AssetFieldConfig {
  id: keyof Manufacture;
  label: string;
  type: 'text' | 'select';
  optionsKey?: 'assetTypes' | 'brands' | 'processors' | 'storages' | 'rams' | 'vgas' | 'screenSizes' | 'colors';
  optional?: boolean;
  fromMasterData?: boolean; // Existing property
  fromManufacturedData?: boolean; // New property
}

type AssetTypeSpecs = {
  [key: string]: AssetFieldConfig[];
};

export const ASSET_SPECS_CONFIG: AssetTypeSpecs = {
  "Laptop": [
    { id: "processor", label: "Processor", type: "select", optionsKey: "processors" },
    { id: "storage", label: "Penyimpanan", type: "select", optionsKey: "storages" },
    { id: "ram", label: "RAM", type: "select", optionsKey: "rams" },
    { id: "vga", label: "VGA (Opsional)", type: "select", optionsKey: "vgas", optional: true },
    { id: "screenSize", label: "Ukuran Layar (Opsional)", type: "select", optionsKey: "screenSizes", optional: true },
    { id: "color", label: "Warna (Opsional)", type: "select", optionsKey: "colors", optional: true },
    { id: "macAddressLan", label: "MAC Address LAN (Opsional)", type: "text", optional: true },
    { id: "macAddressWlan", label: "MAC Address WLAN (Opsional)", type: "text", optional: true },
  ],
  "Monitor": [
    { id: "screenSize", label: "Ukuran Layar", type: "select", optionsKey: "screenSizes" },
    { id: "color", label: "Warna (Opsional)", type: "select", optionsKey: "colors", optional: true },
  ],
  "Printer": [
    { id: "color", label: "Warna (Opsional)", type: "select", optionsKey: "colors", optional: true },
    // Contoh: Tambahkan spesifikasi khusus printer di sini
    // { id: "printSpeed", label: "Kecepatan Cetak", type: "text" },
  ],
  "Keyboard": [
    { id: "color", label: "Warna (Opsional)", type: "select", optionsKey: "colors", optional: true },
  ],
  "Mouse": [
    { id: "color", label: "Warna (Opsional)", type: "select", optionsKey: "colors", optional: true },
  ],
  "Switch": [
    { id: "type", label: "Tipe Switch", type: "select", fromMasterData: true },
    { id: "brand", label: "Merek", type: "select", fromMasterData: true },
    { id: "model", label: "Model", type: "text" },
    { id: "port", label: "Port", type: "select", fromMasterData: true },
    { id: "power", label: "Power", type: "select", fromMasterData: true },
  ],
  // Tambahkan konfigurasi untuk jenis aset lainnya di sini
};

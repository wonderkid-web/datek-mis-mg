export interface Item {
  id?: string;
  name: string; // This will be the description from the Unit data, e.g., "AULA", "LAPTOP"
  description: string; // For specific details like Brand/Model/Serial Number

  // Fields from the new form, representing the current state of the asset
  unit: string; // The type from the Unit data, e.g., "BL-G01"
  sbu: string;
  department: string;
  status: string;
  user: string; // User ID

  // Other asset-specific details
  assetNumber: string; // This should be unique.
  guaranteeDate?: Date;
  registrationDate?: Date;
  acquisitionDate?: Date;
  ipAddress?: string;
  remote?: string;

  // Metadata
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Manufactured Item Details (optional, if linked to a manufactured item)
  manufacturedItemId?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  processor?: string;
  storage?: string;
  ram?: string;
  vga?: string; // Optional, as not all items might have VGA
  screenSize?: string;
  color?: string;
  macAddressLan?: string;
  macAddressWlan?: string;
}



export interface User {
  id?: string;
  name: string;
  sbu: string;
  department: string;
  createdAt: Date;
}

export interface StockMove {
  id?: string;
  itemId: string; // Added to link to the Item
  assetNumber: string;
  createdAt: Date;
  department: string;
  guaranteeDate?: Date;
  ipAddress?: string;
  item: string; // This is likely the item's name
  remote?: string;
  sbu: string;
  user: string;
}

export interface Manufacture {
  id?: string;
  type: string;
  brand: string;
  model?: string;
  serialNumber: string;
  processor?: string;
  storage?: string;
  ram?: string;
  vga?: string; // Optional, as not all items might have VGA
  screenSize?: string; // Optional, specific to laptops/monitors
  color?: string;
  macAddressLan?: string;
  macAddressWlan?: string;
  port?: number; // New field for Switch
  power?: string; // New field for Switch
  assetCategory: string;
  assetNumber?: string; // New field for asset number
  user?: string; // New field for user ID
  createdAt: Date;
  updatedAt: Date;
}

export interface MasterDataItem {
  id?: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetType extends MasterDataItem { _?: string; }
export interface Brand extends MasterDataItem { _?: string; }
export interface Processor extends MasterDataItem { _?: string; }
export interface Storage extends MasterDataItem { _?: string; }
export interface Ram extends MasterDataItem { _?: string; }
export interface Vga extends MasterDataItem { _?: string; }
export interface ScreenSize extends MasterDataItem { _?: string; }
export interface Color extends MasterDataItem { _?: string; }

export interface Switch {
  id?: string;
  type: string;
  brand: string;
  port: number;
  power: string;
  createdAt: Date;
  updatedAt: Date;
}



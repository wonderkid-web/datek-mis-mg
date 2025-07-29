// This file defines custom TypeScript types for the application.
// While Prisma generates types, these custom types can be useful for specific client-side views or components.

// --- CORE MODELS ---

export interface User {
  id: number;
  nik: string;
  namaLengkap: string;
  email: string;
  departemen: string | null;
  jabatan: string | null;
  lokasiKantor: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetCategory {
  id: number;
  nama: string;
  slug: string;
}

// --- MASTER DATA / LOOKUP TYPES ---

// A generic interface for simple master data options that just have an ID and a value.
// This fits many of our laptop specification options.
export interface MasterDataOption {
  id: number;
  value: string;
}

// Specific types for laptop options, using the generic MasterDataOption interface.
// These names now match the Prisma schema models (e.g., LaptopRamOption).
export type LaptopRamOption = MasterDataOption;
export type LaptopProcessorOption = MasterDataOption;
export type LaptopStorageTypeOption = MasterDataOption;
export type LaptopOsOption = MasterDataOption;
export type LaptopPortOption = MasterDataOption;
export type LaptopPowerOption = MasterDataOption;
export type LaptopMicrosoftOfficeOption = MasterDataOption;
export type LaptopColorOption = MasterDataOption;
export type LaptopBrandOption = MasterDataOption;
export type LaptopTypeOption = MasterDataOption;

// The old types like 'Processor', 'Ram', 'Color' have been renamed to be more specific
// and match the schema. 'Brand', 'Vga', and 'ScreenSize' have been removed as they
// do not have corresponding lookup tables in the Prisma schema.
// 'AssetType' has been replaced by the more accurate 'AssetCategory'.
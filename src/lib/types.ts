export interface User {
  id: number;
  nik: string;
  namaLengkap: string;
  email: string;
  departemen?: string;
  jabatan?: string;
  lokasiKantor?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MasterDataItem {
  id: string;
  name: string;
}

export interface AssetType extends MasterDataItem { _?: string; }
export interface Brand extends MasterDataItem { _?: string; }
export interface Processor extends MasterDataItem { _?: string; }
export interface Storage extends MasterDataItem { _?: string; }
export interface Ram extends MasterDataItem { _?: string; }
export interface Vga extends MasterDataItem { _?: string; }
export interface ScreenSize extends MasterDataItem { _?: string; }
export interface Color extends MasterDataItem { _?: string; }
export interface MicrosoftOffice extends MasterDataItem { _?: string; }
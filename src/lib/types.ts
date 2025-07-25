export interface Item {
  id?: string;
  name: string; // This will be the description from the Unit data, e.g., "AULA", "LAPTOP"
  description: string; // For specific details like Brand/Model/Serial Number

  // Fields from the new form, representing the current state of the asset
  unit: string; // The type from the Unit data, e.g., "BL-G01"
  category: string;
  company: string;
  department: string;
  location: string;
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



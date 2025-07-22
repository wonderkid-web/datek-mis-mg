export interface Item {
  id?: string;
  name: string;
  description: string;
  quantity: number;
  minQuantity: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockMove {
  id?: string;
  assetNumber: string;
  createdAt: Date;
  sbu: string;
  department: string;
  guaranteeDate: Date;
  ipAddress: string;
  item: string; // This will still store the item ID
  itemName: string; // Denormalized item name
  itemDescription: string; // Denormalized item description
  remote: string;
  user: string;
  quantity: number;
}

export interface User {
  id?: string;
  name: string;
  createdAt: Date;
}

export interface Department {
  id?: string;
  name: string;
  createdAt: Date;
}

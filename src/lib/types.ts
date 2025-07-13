
export interface Item {
  id?: string;
  name: string;
  description: string;
  quantity: number;
  minQuantity?: number; // New field for low stock alert
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean;
}

export interface StockMove {
  id?: string;
  itemId: string;
  itemName: string; // Denormalized from Item
  fromSBU: string;
  toSBU: string;
  quantity: number;
  moveDate: Date;
  createdAt: Date;
}

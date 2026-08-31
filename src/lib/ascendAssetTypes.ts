export type AscendAssetState = "all" | "active" | "disabled";

export type AscendAssetSortDirection = "asc" | "desc";

export type AscendAssetSortField =
  | "assetId"
  | "assetCode"
  | "assetName"
  | "barcode"
  | "companyCode"
  | "categoryCode"
  | "locationCode"
  | "departmentCode"
  | "unitCode"
  | "userName"
  | "acquisitionDate"
  | "registerDate"
  | "acquisitionCost"
  | "statusCode"
  | "disabled";

export type AscendAssetGroupBy =
  | "none"
  | "companyCode"
  | "categoryCode"
  | "locationCode"
  | "departmentCode"
  | "unitCode"
  | "statusCode"
  | "disabled";

export interface AscendAssetFilters {
  assetCode?: string;
  assetName?: string;
  barcode?: string;
  companyCode?: string;
  categoryCode?: string;
  locationCode?: string;
  departmentCode?: string;
  unitCode?: string;
  userName?: string;
  statusCode?: string;
  state?: AscendAssetState;
  acquisitionDateFrom?: string;
  acquisitionDateTo?: string;
  registerDateFrom?: string;
  registerDateTo?: string;
  minimumCost?: string;
  maximumCost?: string;
}

export interface AscendAsset {
  assetId: number;
  assetCode: string;
  assetName: string;
  acquisitionDate: string | null;
  acquisitionCost: number;
  companyCode: string;
  supplierName: string;
  unitCode: string;
  locationCode: string;
  categoryCode: string;
  remarks: string;
  statusCode: string;
  departmentCode: string;
  userName: string;
  registerDate: string | null;
  capex: boolean;
  disabled: boolean;
  externalUnitCode: string;
  barcode: string;
  inactiveDateTime: string | null;
  isLow: boolean;
  lastModifiedAt: string | null;
}

export interface AscendAssetQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  state?: AscendAssetState;
  filters?: AscendAssetFilters;
  sortBy?: AscendAssetSortField;
  sortDirection?: AscendAssetSortDirection;
}

export interface AscendAssetPage {
  items: AscendAsset[];
  page: number;
  pageSize: number;
  total: number;
}

export interface AscendAssetGroup {
  value: string;
  total: number;
  active: number;
  inactive: number;
  totalCost: number;
}

export interface AscendAssetGroupQuery {
  search?: string;
  filters?: AscendAssetFilters;
  groupBy: Exclude<AscendAssetGroupBy, "none">;
}

export interface AscendAssetFilterOptions {
  companies: string[];
  regions: string[];
  locations: string[];
  departments: string[];
  units: string[];
  statuses: string[];
}

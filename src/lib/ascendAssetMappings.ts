import { COMPANIES, STATUSES } from "@/lib/constants";

// Only mappings that have been verified against the Ascend screen/data belong
// here. Unknown codes intentionally fall back to the original value.
export const ASCEND_REGION_LABELS: Record<string, string> = {
  "3": "MILL",
};

export const ASCEND_LOCATION_LABELS: Record<string, string> = {
  "1": "Office",
};

export const ASCEND_DEPARTMENT_LABELS: Record<string, string> = {
  "39": "Accounting",
  "46": "Warehouse",
};

export function getAscendCompanyLabel(code: string) {
  return COMPANIES.find((company) => company.type === code)?.description ?? code;
}

export function getAscendRegionLabel(code: string) {
  return ASCEND_REGION_LABELS[code] ?? code;
}

export function getAscendLocationLabel(code: string) {
  return ASCEND_LOCATION_LABELS[code] ?? code;
}

export function getAscendDepartmentLabel(code: string) {
  return ASCEND_DEPARTMENT_LABELS[code] ?? code;
}

export function getAscendStatusLabel(code: string) {
  const status = STATUSES.find((item) => item.type === code);
  return status ? `${code} ${status.description}` : code || "-";
}

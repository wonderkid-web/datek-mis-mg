export type EmployeeImportFieldKey =
  | "namaLengkap"
  | "email"
  | "departemen"
  | "jabatan"
  | "lokasiKantor"
  | "isActive"
  | "role"
  | "password";

export type ParsedEmployeeImportRow = Partial<Record<EmployeeImportFieldKey, string>>;

export interface EmployeeImportColumn {
  key: EmployeeImportFieldKey;
  templateHeader: string;
  label: string;
  aliases: string[];
}

export const EMPLOYEE_IMPORT_COLUMNS: EmployeeImportColumn[] = [
  {
    key: "namaLengkap",
    templateHeader: "full_name",
    label: "Full Name",
    aliases: ["full_name", "full name", "nama_lengkap", "nama lengkap", "name", "nama"],
  },
  {
    key: "email",
    templateHeader: "email",
    label: "Email",
    aliases: ["email"],
  },
  {
    key: "departemen",
    templateHeader: "department",
    label: "Department",
    aliases: ["department", "departemen"],
  },
  {
    key: "jabatan",
    templateHeader: "homebase",
    label: "Homebase",
    aliases: ["homebase", "position", "jabatan"],
  },
  {
    key: "lokasiKantor",
    templateHeader: "corporate",
    label: "Corporate",
    aliases: ["corporate", "lokasi_kantor", "lokasi kantor", "company"],
  },
  {
    key: "isActive",
    templateHeader: "active",
    label: "Active",
    aliases: ["active", "is_active", "is active", "status_active"],
  },
  {
    key: "role",
    templateHeader: "authorization",
    label: "Authorization",
    aliases: ["authorization", "role", "otorisasi"],
  },
  {
    key: "password",
    templateHeader: "password",
    label: "Password",
    aliases: ["password"],
  },
];

export const EMPLOYEE_IMPORT_SAMPLE_ROW: Record<string, string> = {
  full_name: "Andi Saputra",
  email: "andi@mahkotagrouptbk.onmicrosoft.com",
  department: "MIS - Manajemen Information System",
  homebase: "HOLDING",
  corporate: "PT Mahkota Group Tbk",
  active: "TRUE",
  authorization: "operator",
  password: "",
};

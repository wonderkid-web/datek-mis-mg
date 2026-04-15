"use server";

import { prisma } from "@/lib/prisma";
import { COMPANIES, DEPARTMENTS } from "@/lib/constants";
import type { ParsedEmployeeImportRow } from "@/lib/employeeImportConfig";

interface PreparedEmployeeImportRow {
  rowNumber: number;
  summary: string;
  email: string | null;
  isActive: boolean;
  errors: string[];
  userData?: {
    namaLengkap: string;
    email: string | null;
    departemen: string | null;
    jabatan: string | null;
    lokasiKantor: string | null;
    isActive: boolean;
    role: string | null;
    password: string | null;
  };
}

export interface EmployeeImportPreviewRow {
  rowNumber: number;
  summary: string;
  email: string | null;
  isActive: boolean;
  isValid: boolean;
  errors: string[];
}

export interface EmployeeImportPreviewResult {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  rows: EmployeeImportPreviewRow[];
}

export interface EmployeeImportCommitResult {
  importedRows: number;
  failedRows: Array<{
    rowNumber: number;
    summary: string;
    error: string;
  }>;
}

const HOMEBASE_OPTIONS = ["HOLDING", "SBU"] as const;
const ROLE_OPTIONS = ["operator", "administrator"] as const;

function normalizeLookupValue(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function readString(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function toNullableString(value: unknown) {
  const text = readString(value);
  return text ? text : null;
}

function parseBooleanValue(value: unknown, errors: string[]) {
  const rawValue = readString(value);
  if (!rawValue) {
    return true;
  }

  const normalizedValue = normalizeLookupValue(rawValue);
  if (["true", "yes", "ya", "1", "active"].includes(normalizedValue)) {
    return true;
  }
  if (["false", "no", "tidak", "0", "inactive"].includes(normalizedValue)) {
    return false;
  }

  errors.push(`Active "${rawValue}" tidak valid.`);
  return true;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

const departmentLookup = new Map(
  DEPARTMENTS.map((department) => [normalizeLookupValue(department), department] as const)
);

const companyLookup = new Map(
  COMPANIES.map((company) => [
    normalizeLookupValue(company.description),
    company.description,
  ] as const)
);

const homebaseLookup = new Map(
  HOMEBASE_OPTIONS.map((option) => [normalizeLookupValue(option), option] as const)
);

const roleLookup = new Map(
  ROLE_OPTIONS.map((option) => [normalizeLookupValue(option), option] as const)
);

async function getExistingEmails(rows: ParsedEmployeeImportRow[]) {
  const normalizedEmails = Array.from(
    new Set(
      rows
        .map((row) => readString(row.email).toLowerCase())
        .filter(Boolean)
    )
  );

  if (!normalizedEmails.length) {
    return new Set<string>();
  }

  const existingUsers = await prisma.user.findMany({
    where: {
      email: {
        in: normalizedEmails,
      },
    },
    select: {
      email: true,
    },
  });

  return new Set(
    existingUsers
      .map((user) => user.email?.toLowerCase())
      .filter((email): email is string => Boolean(email))
  );
}

async function prepareRows(
  rows: ParsedEmployeeImportRow[]
): Promise<PreparedEmployeeImportRow[]> {
  const existingEmails = await getExistingEmails(rows);
  const fileEmailCounts = new Map<string, number>();

  rows.forEach((row) => {
    const email = readString(row.email).toLowerCase();
    if (!email) {
      return;
    }

    fileEmailCounts.set(email, (fileEmailCounts.get(email) ?? 0) + 1);
  });

  return rows.map((row, index) => {
    const errors: string[] = [];
    const rowNumber = index + 2;
    const namaLengkap = readString(row.namaLengkap);
    const email = readString(row.email).toLowerCase();
    const isActive = parseBooleanValue(row.isActive, errors);

    if (!namaLengkap) {
      errors.push("Full Name wajib diisi.");
    }

    if (email) {
      if (!isValidEmail(email)) {
        errors.push(`Email "${readString(row.email)}" tidak valid.`);
      }

      if ((fileEmailCounts.get(email) ?? 0) > 1) {
        errors.push("Email duplikat di file import.");
      }

      if (existingEmails.has(email)) {
        errors.push("Email sudah ada di database.");
      }
    }

    const departemenRaw = readString(row.departemen);
    const departemen =
      departmentLookup.get(normalizeLookupValue(departemenRaw)) ?? null;
    if (departemenRaw && !departemen) {
      errors.push(`Department "${departemenRaw}" tidak valid.`);
    }

    const lokasiKantorRaw = readString(row.lokasiKantor);
    const lokasiKantor =
      companyLookup.get(normalizeLookupValue(lokasiKantorRaw)) ?? null;
    if (lokasiKantorRaw && !lokasiKantor) {
      errors.push(`Corporate "${lokasiKantorRaw}" tidak valid.`);
    }

    const jabatanRaw = readString(row.jabatan);
    const jabatan = homebaseLookup.get(normalizeLookupValue(jabatanRaw)) ?? null;
    if (jabatanRaw && !jabatan) {
      errors.push(`Homebase "${jabatanRaw}" tidak valid.`);
    }

    const roleRaw = readString(row.role);
    const role = roleLookup.get(normalizeLookupValue(roleRaw)) ?? null;
    if (roleRaw && !role) {
      errors.push(`Authorization "${roleRaw}" tidak valid.`);
    }

    return {
      rowNumber,
      summary: namaLengkap || `Row ${rowNumber}`,
      email: email || null,
      isActive,
      errors,
      userData: namaLengkap
        ? {
            namaLengkap,
            email: email || null,
            departemen,
            jabatan,
            lokasiKantor,
            isActive,
            role,
            password: toNullableString(row.password),
          }
        : undefined,
    };
  });
}

function extractErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Import employee gagal diproses.";
}

export async function previewEmployeeImport(
  rows: ParsedEmployeeImportRow[]
): Promise<EmployeeImportPreviewResult> {
  const preparedRows = await prepareRows(rows);
  const previewRows: EmployeeImportPreviewRow[] = preparedRows.map((row) => ({
    rowNumber: row.rowNumber,
    summary: row.summary,
    email: row.email,
    isActive: row.isActive,
    isValid: row.errors.length === 0,
    errors: row.errors,
  }));

  return {
    totalRows: previewRows.length,
    validRows: previewRows.filter((row) => row.isValid).length,
    invalidRows: previewRows.filter((row) => !row.isValid).length,
    rows: previewRows,
  };
}

export async function importEmployeeRows(
  rows: ParsedEmployeeImportRow[]
): Promise<EmployeeImportCommitResult> {
  const preparedRows = await prepareRows(rows);
  const invalidRows = preparedRows.filter((row) => row.errors.length > 0);

  if (invalidRows.length > 0) {
    return {
      importedRows: 0,
      failedRows: invalidRows.map((row) => ({
        rowNumber: row.rowNumber,
        summary: row.summary,
        error: row.errors.join(" "),
      })),
    };
  }

  let importedRows = 0;
  const failedRows: EmployeeImportCommitResult["failedRows"] = [];

  for (const row of preparedRows) {
    if (!row.userData) {
      failedRows.push({
        rowNumber: row.rowNumber,
        summary: row.summary,
        error: "Data employee tidak lengkap.",
      });
      continue;
    }

    try {
      await prisma.user.create({
        data: row.userData,
      });
      importedRows += 1;
    } catch (error) {
      failedRows.push({
        rowNumber: row.rowNumber,
        summary: row.summary,
        error: extractErrorMessage(error),
      });
    }
  }

  return {
    importedRows,
    failedRows,
  };
}

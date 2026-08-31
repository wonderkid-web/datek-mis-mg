"use server";

import type { IRecordSet, Request } from "mssql";
import { ascendSql, getAscendPool } from "@/lib/ascendDb";
import { getCurrentSession } from "@/lib/session";
import type {
  AscendAsset,
  AscendAssetFilterOptions,
  AscendAssetFilters,
  AscendAssetGroup,
  AscendAssetGroupBy,
  AscendAssetGroupQuery,
  AscendAssetPage,
  AscendAssetQuery,
  AscendAssetSortField,
  AscendAssetState,
} from "@/lib/ascendAssetTypes";

interface AscendAssetRecord {
  assetId: number;
  assetCode: string;
  assetName: string;
  acquisitionDate: Date | null;
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
  registerDate: Date | null;
  capex: boolean;
  disabled: boolean;
  externalUnitCode: string;
  barcode: string;
  inactiveDateTime: Date | null;
  isLow: boolean;
  lastModifiedAt: Date | null;
}

const VALID_STATES = new Set<AscendAssetState>(["all", "active", "disabled"]);

const SORT_COLUMNS: Record<AscendAssetSortField, string> = {
  assetId: "AssetID",
  assetCode: "AssetCode",
  assetName: "AssetName",
  barcode: "Barcode",
  companyCode: "CompanyCode",
  categoryCode: "CategoryCode",
  locationCode: "LocationCode",
  departmentCode: "DepartmentCode",
  unitCode: "UnitCode",
  userName: "UserName",
  acquisitionDate: "AcquisitionDate",
  registerDate: "RegisterDate",
  acquisitionCost: "AcquisitionCost",
  statusCode: "StatusCode",
  disabled: "Disabled",
};

const GROUP_COLUMNS: Record<Exclude<AscendAssetGroupBy, "none">, string> = {
  companyCode: "CompanyCode",
  categoryCode: "CategoryCode",
  locationCode: "LocationCode",
  departmentCode: "DepartmentCode",
  unitCode: "UnitCode",
  statusCode: "StatusCode",
  disabled: "Disabled",
};

function asPositiveInteger(value: number | undefined, fallback: number) {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(1, Math.floor(value as number));
}

function toIsoString(value: Date | null) {
  return value instanceof Date ? value.toISOString() : null;
}

function mapAsset(record: AscendAssetRecord): AscendAsset {
  return {
    ...record,
    acquisitionDate: toIsoString(record.acquisitionDate),
    registerDate: toIsoString(record.registerDate),
    inactiveDateTime: toIsoString(record.inactiveDateTime),
    lastModifiedAt: toIsoString(record.lastModifiedAt),
    acquisitionCost: Number(record.acquisitionCost),
    capex: Boolean(record.capex),
    disabled: Boolean(record.disabled),
    isLow: Boolean(record.isLow),
  };
}

function cleanText(value: string | undefined, maximumLength = 100) {
  return value?.trim().slice(0, maximumLength) ?? "";
}

function validDate(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function validMoney(value: string | undefined) {
  if (value === undefined || value.trim() === "") return null;
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}

function addLikeFilter(
  request: Request,
  clauses: string[],
  column: string,
  parameter: string,
  value: string | undefined
) {
  const cleaned = cleanText(value);
  if (!cleaned) return;
  request.input(parameter, ascendSql.VarChar(100), cleaned);
  clauses.push(`${column} LIKE '%' + @${parameter} + '%'`);
}

function addExactFilter(
  request: Request,
  clauses: string[],
  column: string,
  parameter: string,
  value: string | undefined
) {
  const cleaned = cleanText(value, 50);
  if (!cleaned) return;
  request.input(parameter, ascendSql.VarChar(50), cleaned);
  clauses.push(`${column} = @${parameter}`);
}

function applyFilters(
  request: Request,
  searchValue: string | undefined,
  filters: AscendAssetFilters = {},
  legacyState?: AscendAssetState
) {
  const clauses: string[] = [];
  const search = cleanText(searchValue);

  if (search) {
    request.input("globalSearch", ascendSql.VarChar(100), search);
    clauses.push(`(
      AssetCode LIKE '%' + @globalSearch + '%'
      OR AssetName LIKE '%' + @globalSearch + '%'
      OR Barcode LIKE '%' + @globalSearch + '%'
      OR UserName LIKE '%' + @globalSearch + '%'
      OR CompanyCode LIKE '%' + @globalSearch + '%'
      OR UnitCode LIKE '%' + @globalSearch + '%'
      OR Remarks LIKE '%' + @globalSearch + '%'
    )`);
  }

  addLikeFilter(request, clauses, "AssetCode", "assetCode", filters.assetCode);
  addLikeFilter(request, clauses, "AssetName", "assetName", filters.assetName);
  addLikeFilter(request, clauses, "Barcode", "barcode", filters.barcode);
  addLikeFilter(request, clauses, "UnitCode", "unitCode", filters.unitCode);
  addLikeFilter(request, clauses, "UserName", "userName", filters.userName);
  addExactFilter(request, clauses, "CompanyCode", "companyCode", filters.companyCode);
  addExactFilter(request, clauses, "CategoryCode", "categoryCode", filters.categoryCode);
  addExactFilter(request, clauses, "LocationCode", "locationCode", filters.locationCode);
  addExactFilter(request, clauses, "DepartmentCode", "departmentCode", filters.departmentCode);
  addExactFilter(request, clauses, "StatusCode", "statusCode", filters.statusCode);

  const state = VALID_STATES.has(filters.state ?? legacyState ?? "all")
    ? (filters.state ?? legacyState ?? "all")
    : "all";
  if (state === "active") clauses.push("Disabled = 0");
  if (state === "disabled") clauses.push("Disabled = 1");

  const dateFrom = validDate(filters.acquisitionDateFrom);
  if (dateFrom) {
    request.input("acquisitionDateFrom", ascendSql.Date, dateFrom);
    clauses.push("AcquisitionDate >= @acquisitionDateFrom");
  }

  const dateTo = validDate(filters.acquisitionDateTo);
  if (dateTo) {
    request.input("acquisitionDateTo", ascendSql.Date, dateTo);
    clauses.push("AcquisitionDate < DATEADD(day, 1, @acquisitionDateTo)");
  }

  const registerDateFrom = validDate(filters.registerDateFrom);
  if (registerDateFrom) {
    request.input("registerDateFrom", ascendSql.Date, registerDateFrom);
    clauses.push("RegisterDate >= @registerDateFrom");
  }

  const registerDateTo = validDate(filters.registerDateTo);
  if (registerDateTo) {
    request.input("registerDateTo", ascendSql.Date, registerDateTo);
    clauses.push("RegisterDate < DATEADD(day, 1, @registerDateTo)");
  }

  const minimumCost = validMoney(filters.minimumCost);
  if (minimumCost !== null) {
    request.input("minimumCost", ascendSql.Money, minimumCost);
    clauses.push("AcquisitionCost >= @minimumCost");
  }

  const maximumCost = validMoney(filters.maximumCost);
  if (maximumCost !== null) {
    request.input("maximumCost", ascendSql.Money, maximumCost);
    clauses.push("AcquisitionCost <= @maximumCost");
  }

  return clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
}

async function requireAuthenticatedSession() {
  const session = await getCurrentSession();
  if (!session?.user) {
    throw new Error("Sesi tidak valid. Silakan login kembali.");
  }
}

export async function getAscendAssets(
  query: AscendAssetQuery = {}
): Promise<AscendAssetPage> {
  await requireAuthenticatedSession();

  const page = asPositiveInteger(query.page, 1);
  const pageSize = Math.min(asPositiveInteger(query.pageSize, 20), 100);
  const offset = (page - 1) * pageSize;
  const sortBy = query.sortBy && SORT_COLUMNS[query.sortBy] ? query.sortBy : "assetId";
  const sortColumn = SORT_COLUMNS[sortBy];
  const sortDirection = query.sortDirection === "asc" ? "ASC" : "DESC";
  const orderByClause =
    sortColumn === "AssetID"
      ? `AssetID ${sortDirection}`
      : `${sortColumn} ${sortDirection}, AssetID DESC`;

  try {
    const pool = await getAscendPool();
    const request = pool
      .request()
      .input("offset", ascendSql.Int, offset)
      .input("pageSize", ascendSql.Int, pageSize);
    const whereClause = applyFilters(request, query.search, query.filters, query.state);

    const result = await request.query(`
      SELECT COUNT(*) AS total FROM dbo.AA_Assets ${whereClause};

      SELECT
        AssetID AS assetId,
        AssetCode AS assetCode,
        AssetName AS assetName,
        AcquisitionDate AS acquisitionDate,
        AcquisitionCost AS acquisitionCost,
        CompanyCode AS companyCode,
        SupplierName AS supplierName,
        UnitCode AS unitCode,
        LocationCode AS locationCode,
        CategoryCode AS categoryCode,
        Remarks AS remarks,
        StatusCode AS statusCode,
        DepartmentCode AS departmentCode,
        UserName AS userName,
        RegisterDate AS registerDate,
        Capex AS capex,
        Disabled AS disabled,
        ExUnitCode AS externalUnitCode,
        Barcode AS barcode,
        InactiveDateTime AS inactiveDateTime,
        IsLow AS isLow,
        LastMod AS lastModifiedAt
      FROM dbo.AA_Assets
      ${whereClause}
      ORDER BY ${orderByClause}
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;
    `);

    const recordsets = result.recordsets as unknown as IRecordSet<unknown>[];
    const countRows = recordsets[0] as IRecordSet<{ total: number }>;
    const assetRows = recordsets[1] as IRecordSet<AscendAssetRecord>;

    return {
      items: assetRows.map(mapAsset),
      page,
      pageSize,
      total: Number(countRows[0]?.total ?? 0),
    };
  } catch (error) {
    console.error("Failed to read Ascend assets:", error);
    throw new Error(
      "Data Ascend belum dapat dimuat. Periksa koneksi SQL Server dan konfigurasi environment."
    );
  }
}

export async function getAscendAssetGroups(
  query: AscendAssetGroupQuery
): Promise<AscendAssetGroup[]> {
  await requireAuthenticatedSession();

  const groupColumn = GROUP_COLUMNS[query.groupBy];
  if (!groupColumn) return [];
  const groupValueExpression =
    query.groupBy === "disabled"
      ? "CASE WHEN Disabled = 1 THEN 'inactive' ELSE 'active' END"
      : `COALESCE(NULLIF(CONVERT(varchar(100), ${groupColumn}), ''), '(blank)')`;

  try {
    const pool = await getAscendPool();
    const request = pool.request();
    const whereClause = applyFilters(request, query.search, query.filters);
    const result = await request.query(`
      SELECT
        ${groupValueExpression} AS value,
        COUNT(*) AS total,
        SUM(CASE WHEN Disabled = 0 THEN 1 ELSE 0 END) AS active,
        SUM(CASE WHEN Disabled = 1 THEN 1 ELSE 0 END) AS inactive,
        SUM(CONVERT(decimal(19, 2), AcquisitionCost)) AS totalCost
      FROM dbo.AA_Assets
      ${whereClause}
      GROUP BY ${groupColumn}
      ORDER BY total DESC, value ASC;
    `);

    return result.recordset.map((row) => ({
      value: String(row.value),
      total: Number(row.total),
      active: Number(row.active),
      inactive: Number(row.inactive),
      totalCost: Number(row.totalCost),
    }));
  } catch (error) {
    console.error("Failed to group Ascend assets:", error);
    throw new Error("Grouping data Ascend gagal dimuat.");
  }
}

export async function getAscendAssetFilterOptions(): Promise<AscendAssetFilterOptions> {
  await requireAuthenticatedSession();

  try {
    const pool = await getAscendPool();
    const result = await pool.request().query(`
      SELECT DISTINCT CompanyCode AS value FROM dbo.AA_Assets WHERE CompanyCode <> '' ORDER BY value;
      SELECT DISTINCT CategoryCode AS value FROM dbo.AA_Assets WHERE CategoryCode <> '' ORDER BY value;
      SELECT DISTINCT LocationCode AS value FROM dbo.AA_Assets WHERE LocationCode <> '' ORDER BY value;
      SELECT DISTINCT DepartmentCode AS value FROM dbo.AA_Assets WHERE DepartmentCode <> '' ORDER BY value;
      SELECT DISTINCT UnitCode AS value FROM dbo.AA_Assets WHERE UnitCode <> '' ORDER BY value;
      SELECT DISTINCT StatusCode AS value FROM dbo.AA_Assets WHERE StatusCode <> '' ORDER BY value;
    `);
    const sets = result.recordsets as unknown as Array<IRecordSet<{ value: string }>>;
    const values = (index: number) => sets[index]?.map((row) => row.value) ?? [];

    return {
      companies: values(0),
      regions: values(1),
      locations: values(2),
      departments: values(3),
      units: values(4),
      statuses: values(5),
    };
  } catch (error) {
    console.error("Failed to load Ascend filter options:", error);
    throw new Error("Pilihan filter Ascend gagal dimuat.");
  }
}

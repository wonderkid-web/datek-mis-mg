"use server";

import { CCTVStatus, Prisma } from "@prisma/client";
import { revalidateTag, unstable_cache } from "next/cache";
import { prisma } from "./prisma";

const REVALIDATE_TAG = "cctv-repetitive-maintenance";
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

export type CctvMaintenanceSummary = {
  id: number;
  periode: Date;
  perusahaan: string;
  status: CCTVStatus;
  remarks: string | null;
  channelCamera: {
    id: number;
    lokasi: string;
    sbu: string;
    cctvSpecs: Array<{
      asset: {
        id: number;
      };
      channelCamera: {
        lokasi: string;
      } | null;
      ipAddress: string | null;
      viewCamera: string | null;
    }>;
  } | null;
};

export type CctvMaintenancePageResult = {
  data: CctvMaintenanceSummary[];
  totalCount: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

type CctvMaintenanceQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  year?: string;
  month?: string;
};

type RawCctvMaintenanceRow = {
  id: number;
  periode: Date;
  perusahaan: string;
  status: CCTVStatus;
  remarks: string | null;
  channelCameraId: number | null;
  channelCameraLokasi: string | null;
  channelCameraSbu: string | null;
  assetId: number | null;
  viewCamera: string | null;
  ipAddress: string | null;
};

function normalizePositiveInteger(value: number | undefined, fallback: number) {
  if (!value || !Number.isFinite(value) || value < 1) {
    return fallback;
  }

  return Math.floor(value);
}

function buildCctvMaintenanceWhere({
  search,
  year,
  month,
}: Omit<CctvMaintenanceQuery, "page" | "pageSize">) {
  const clauses: Prisma.Sql[] = [];
  const trimmedSearch = search?.trim();

  if (trimmedSearch) {
    const likeValue = `%${trimmedSearch}%`;
    clauses.push(Prisma.sql`
      (
        REPLACE(m.perusahaan, '_', ' ') LIKE ${likeValue}
        OR cc.lokasi LIKE ${likeValue}
        OR COALESCE(cs.ipAddress, '') LIKE ${likeValue}
        OR COALESCE(m.remarks, '') LIKE ${likeValue}
        OR m.status LIKE ${likeValue}
      )
    `);
  }

  const yearNumber = Number(year);
  if (year && year !== "all" && Number.isFinite(yearNumber)) {
    clauses.push(Prisma.sql`YEAR(m.periode) = ${yearNumber}`);
  }

  const monthNumber = Number(month);
  if (month && month !== "all" && Number.isFinite(monthNumber)) {
    clauses.push(Prisma.sql`MONTH(m.periode) = ${monthNumber}`);
  }

  if (!clauses.length) {
    return Prisma.empty;
  }

  return Prisma.sql`WHERE ${Prisma.join(clauses, " AND ")}`;
}

function mapRawCctvMaintenanceRow(
  row: RawCctvMaintenanceRow
): CctvMaintenanceSummary {
  const specSummary =
    row.assetId === null
      ? []
      : [
          {
            asset: {
              id: row.assetId,
            },
            channelCamera: row.channelCameraLokasi
              ? {
                  lokasi: row.channelCameraLokasi,
                }
              : null,
            ipAddress: row.ipAddress,
            viewCamera: row.viewCamera,
          },
        ];

  return {
    id: row.id,
    periode: row.periode,
    perusahaan: row.perusahaan,
    status: row.status,
    remarks: row.remarks,
    channelCamera:
      row.channelCameraId === null ||
      row.channelCameraLokasi === null ||
      row.channelCameraSbu === null
        ? null
        : {
            id: row.channelCameraId,
            lokasi: row.channelCameraLokasi,
            sbu: row.channelCameraSbu,
            cctvSpecs: specSummary,
          },
  };
}

export const createCctvRepetitiveMaintenance = async (data: {
  periode: Date;
  perusahaan: string;
  channelCameraId: number;
  status: CCTVStatus;
  remarks?: string;
  assetId: number;
}) => {
  const { assetId, status, ...maintenanceData } = data;

  const maintenanceRecord = await prisma.$transaction(async (tx) => {
    // 1. Create the maintenance record
    const record = await tx.cctvRepetitiveMaintenance.create({
      data: {
        ...maintenanceData,
        status: status,
      },
    });

    // 2. Update the parent asset's status
    await tx.asset.update({
      where: { id: assetId },
      data: { statusAsset: status },
    });

    return record;
  });

  revalidateTag(REVALIDATE_TAG);
  return maintenanceRecord;
};

export const deleteCctvRepetitiveMaintenance = async (id: number) => {
  const record = await prisma.cctvRepetitiveMaintenance.delete({
    where: { id },
  });
  revalidateTag(REVALIDATE_TAG);
  return record;
};

export const updateCctvRepetitiveMaintenance = async (
  id: number,
  data: {
    periode?: Date;
    status?: CCTVStatus;
    remarks?: string;
    assetId?: number;
  }
) => {
  const { assetId, ...maintenanceData } = data;

  const updatedRecord = await prisma.$transaction(async (tx) => {
    // 1. Update the maintenance record
    const record = await tx.cctvRepetitiveMaintenance.update({
      where: { id },
      data: maintenanceData,
    });

    // 2. If status and assetId are provided, update the parent asset's status
    if (data.status && assetId) {
      await tx.asset.update({
        where: { id: assetId },
        data: { statusAsset: data.status },
      });
    }

    return record;
  });

  revalidateTag(REVALIDATE_TAG);
  return updatedRecord;
};

export async function getCctvRepetitiveMaintenancesPage(
  query: CctvMaintenanceQuery = {}
): Promise<CctvMaintenancePageResult> {
  const page = normalizePositiveInteger(query.page, 1);
  const pageSize = Math.min(
    normalizePositiveInteger(query.pageSize, DEFAULT_PAGE_SIZE),
    MAX_PAGE_SIZE
  );
  const offset = (page - 1) * pageSize;
  const whereSql = buildCctvMaintenanceWhere(query);

  const [countRows, rows] = await Promise.all([
    prisma.$queryRaw<Array<{ total: bigint | number }>>(Prisma.sql`
      SELECT COUNT(*) AS total
      FROM \`cctv_repetitive_maintenances\` m
      LEFT JOIN \`cctv_channel_cameras\` cc ON m.\`channelCameraId\` = cc.\`id\`
      LEFT JOIN \`cctv_specs\` cs ON cc.\`id\` = cs.\`channelCameraId\`
      ${whereSql}
    `),
    prisma.$queryRaw<RawCctvMaintenanceRow[]>(Prisma.sql`
      SELECT
        m.\`id\` AS id,
        m.\`periode\` AS periode,
        m.\`perusahaan\` AS perusahaan,
        m.\`status\` AS status,
        m.\`remarks\` AS remarks,
        cc.\`id\` AS channelCameraId,
        cc.\`lokasi\` AS channelCameraLokasi,
        cc.\`sbu\` AS channelCameraSbu,
        cs.\`assetId\` AS assetId,
        cs.\`viewCamera\` AS viewCamera,
        cs.\`ipAddress\` AS ipAddress
      FROM \`cctv_repetitive_maintenances\` m
      LEFT JOIN \`cctv_channel_cameras\` cc ON m.\`channelCameraId\` = cc.\`id\`
      LEFT JOIN \`cctv_specs\` cs ON cc.\`id\` = cs.\`channelCameraId\`
      ${whereSql}
      ORDER BY m.\`periode\` DESC, m.\`id\` DESC
      LIMIT ${pageSize} OFFSET ${offset}
    `),
  ]);

  const totalCount = Number(countRows[0]?.total ?? 0);
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));

  return {
    data: rows.map(mapRawCctvMaintenanceRow),
    totalCount,
    page,
    pageSize,
    pageCount,
  };
}

export async function getCctvRepetitiveMaintenanceExportData(
  query: Omit<CctvMaintenanceQuery, "page" | "pageSize"> = {}
) {
  const whereSql = buildCctvMaintenanceWhere(query);
  const rows = await prisma.$queryRaw<RawCctvMaintenanceRow[]>(Prisma.sql`
    SELECT
      m.\`id\` AS id,
      m.\`periode\` AS periode,
      m.\`perusahaan\` AS perusahaan,
      m.\`status\` AS status,
      m.\`remarks\` AS remarks,
      cc.\`id\` AS channelCameraId,
      cc.\`lokasi\` AS channelCameraLokasi,
      cc.\`sbu\` AS channelCameraSbu,
      cs.\`assetId\` AS assetId,
      cs.\`viewCamera\` AS viewCamera,
      cs.\`ipAddress\` AS ipAddress
    FROM \`cctv_repetitive_maintenances\` m
    LEFT JOIN \`cctv_channel_cameras\` cc ON m.\`channelCameraId\` = cc.\`id\`
    LEFT JOIN \`cctv_specs\` cs ON cc.\`id\` = cs.\`channelCameraId\`
    ${whereSql}
    ORDER BY m.\`periode\` DESC, m.\`id\` DESC
  `);

  return rows.map(mapRawCctvMaintenanceRow);
}

export const getCctvRepetitiveMaintenanceYears = unstable_cache(
  async () => {
    const rows = await prisma.$queryRaw<Array<{ year: number | null }>>(Prisma.sql`
      SELECT DISTINCT YEAR(\`periode\`) AS year
      FROM \`cctv_repetitive_maintenances\`
      WHERE \`periode\` IS NOT NULL
      ORDER BY year DESC
    `);

    return rows
      .map((row) => row.year)
      .filter((year): year is number => Number.isFinite(year));
  },
  [`${REVALIDATE_TAG}:years`],
  {
    tags: [REVALIDATE_TAG],
  }
);

export const getCctvRepetitiveMaintenances = async () => {
  return getCctvRepetitiveMaintenanceExportData();
};

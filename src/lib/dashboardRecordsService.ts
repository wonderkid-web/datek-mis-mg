import { prisma } from "./prisma";

export const DASHBOARD_RECORD_TYPES = [
  "service-record",
  "computer-maintenance",
  "printer-maintenance",
  "cctv-maintenance",
  "isp-report",
] as const;

export type DashboardRecordType = (typeof DASHBOARD_RECORD_TYPES)[number];

export type DashboardRecordRow = {
  id: number;
  date: string | null;
  [key: string]: string | number | null;
};

export type DashboardRecordsResult = {
  data: DashboardRecordRow[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 1000;

export function isDashboardRecordType(
  value: string | null | undefined
): value is DashboardRecordType {
  return DASHBOARD_RECORD_TYPES.includes(value as DashboardRecordType);
}

const toIso = (value: Date | null | undefined) =>
  value ? new Date(value).toISOString() : null;

const buildDateFilter = (days: number | undefined) => {
  if (!days || days <= 0) {
    return undefined;
  }

  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  return { gte: since };
};

const normalizePositiveInteger = (value: number | undefined, fallback: number) =>
  !value || !Number.isFinite(value) || value < 1 ? fallback : Math.floor(value);

export async function getDashboardRecords({
  type,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  search,
  days,
}: {
  type: DashboardRecordType;
  page?: number;
  pageSize?: number;
  search?: string;
  days?: number;
}): Promise<DashboardRecordsResult> {
  const safePage = normalizePositiveInteger(page, 1);
  const safePageSize = Math.min(
    normalizePositiveInteger(pageSize, DEFAULT_PAGE_SIZE),
    MAX_PAGE_SIZE
  );
  const skip = (safePage - 1) * safePageSize;
  const term = search?.trim() || undefined;
  const dateFilter = buildDateFilter(days);

  const buildResult = (rows: DashboardRecordRow[], total: number) => ({
    data: rows,
    total,
    page: safePage,
    pageSize: safePageSize,
    pageCount: Math.ceil(total / safePageSize),
  });

  if (type === "service-record") {
    const where = {
      ...(dateFilter ? { createdAt: dateFilter } : {}),
      ...(term
        ? {
            OR: [
              { ticketHelpdesk: { contains: term } },
              { repairType: { contains: term } },
              { remarks: { contains: term } },
              { assetAssignment: { is: { nomorAsset: { contains: term } } } },
              {
                assetAssignment: {
                  is: { asset: { is: { namaAsset: { contains: term } } } },
                },
              },
              {
                assetAssignment: {
                  is: { user: { is: { namaLengkap: { contains: term } } } },
                },
              },
            ],
          }
        : {}),
    };

    const [records, total] = await prisma.$transaction([
      prisma.serviceRecord.findMany({
        where,
        skip,
        take: safePageSize,
        orderBy: { createdAt: "desc" },
        include: {
          assetAssignment: {
            select: {
              nomorAsset: true,
              asset: { select: { namaAsset: true } },
              user: { select: { namaLengkap: true } },
            },
          },
        },
      }),
      prisma.serviceRecord.count({ where }),
    ]);

    return buildResult(
      records.map((record) => ({
        id: record.id,
        date: toIso(record.createdAt),
        ticketHelpdesk: record.ticketHelpdesk,
        assetNumber: record.assetAssignment?.nomorAsset ?? null,
        assetName: record.assetAssignment?.asset?.namaAsset ?? null,
        user: record.assetAssignment?.user?.namaLengkap ?? null,
        repairType: record.repairType,
        cost: Number(record.cost),
        remarks: record.remarks,
      })),
      total
    );
  }

  if (type === "computer-maintenance") {
    const where = {
      ...(dateFilter ? { periode: dateFilter } : {}),
      ...(term
        ? {
            OR: [
              { remarks: { contains: term } },
              { health: { contains: term } },
              { assetAssignment: { is: { nomorAsset: { contains: term } } } },
              {
                assetAssignment: {
                  is: { asset: { is: { namaAsset: { contains: term } } } },
                },
              },
              {
                assetAssignment: {
                  is: { user: { is: { namaLengkap: { contains: term } } } },
                },
              },
            ],
          }
        : {}),
    };

    const [records, total] = await prisma.$transaction([
      prisma.computerMaintenance.findMany({
        where,
        skip,
        take: safePageSize,
        orderBy: { periode: "desc" },
        include: {
          assetAssignment: {
            select: {
              nomorAsset: true,
              asset: { select: { namaAsset: true } },
              user: {
                select: { namaLengkap: true, lokasiKantor: true },
              },
            },
          },
        },
      }),
      prisma.computerMaintenance.count({ where }),
    ]);

    return buildResult(
      records.map((record) => ({
        id: record.id,
        date: toIso(record.periode),
        assetNumber: record.assetAssignment?.nomorAsset ?? null,
        assetName: record.assetAssignment?.asset?.namaAsset ?? null,
        user: record.assetAssignment?.user?.namaLengkap ?? null,
        company: record.assetAssignment?.user?.lokasiKantor ?? null,
        connection: record.connection,
        storageSystemC: record.storageSystemC,
        storageDataD: record.storageDataD,
        health: record.health,
        temperature: record.temperature,
        remarks: record.remarks,
      })),
      total
    );
  }

  if (type === "printer-maintenance") {
    const where = {
      ...(dateFilter ? { reportDate: dateFilter } : {}),
      ...(term
        ? {
            OR: [
              { assetDetails: { contains: term } },
              { remarks: { contains: term } },
              { catatan: { contains: term } },
            ],
          }
        : {}),
    };

    const [records, total] = await prisma.$transaction([
      prisma.printerRepetitiveMaintenance.findMany({
        where,
        skip,
        take: safePageSize,
        orderBy: { reportDate: "desc" },
      }),
      prisma.printerRepetitiveMaintenance.count({ where }),
    ]);

    return buildResult(
      records.map((record) => ({
        id: record.id,
        date: toIso(record.reportDate),
        assetDetails: record.assetDetails,
        totalPages: record.totalPages,
        blackCount: record.blackCount,
        yellowCount: record.yellowCount,
        magentaCount: record.magentaCount,
        cyanCount: record.cyanCount,
        remarks: record.remarks ?? record.catatan,
      })),
      total
    );
  }

  if (type === "cctv-maintenance") {
    const where = {
      ...(dateFilter ? { periode: dateFilter } : {}),
      ...(term
        ? {
            OR: [
              { perusahaan: { contains: term } },
              { remarks: { contains: term } },
              { channelCamera: { is: { lokasi: { contains: term } } } },
              { channelCamera: { is: { sbu: { contains: term } } } },
            ],
          }
        : {}),
    };

    const [records, total] = await prisma.$transaction([
      prisma.cctvRepetitiveMaintenance.findMany({
        where,
        skip,
        take: safePageSize,
        orderBy: { periode: "desc" },
        include: {
          channelCamera: { select: { lokasi: true, sbu: true } },
        },
      }),
      prisma.cctvRepetitiveMaintenance.count({ where }),
    ]);

    return buildResult(
      records.map((record) => ({
        id: record.id,
        date: toIso(record.periode),
        perusahaan: record.perusahaan,
        lokasi: record.channelCamera?.lokasi ?? null,
        sbu: record.channelCamera?.sbu ?? null,
        status: record.status,
        remarks: record.remarks,
      })),
      total
    );
  }

  const where = {
    ...(dateFilter ? { reportDate: dateFilter } : {}),
    ...(term
      ? {
          OR: [
            { sbu: { contains: term } },
            { link: { contains: term } },
            { isp: { is: { isp: { contains: term } } } },
          ],
        }
      : {}),
  };

  const [records, total] = await prisma.$transaction([
    prisma.ispReport.findMany({
      where,
      skip,
      take: safePageSize,
      orderBy: { reportDate: "desc" },
      include: { isp: { select: { isp: true } } },
    }),
    prisma.ispReport.count({ where }),
  ]);

  return buildResult(
    records.map((record) => ({
      id: record.id,
      date: toIso(record.reportDate),
      sbu: record.sbu,
      isp: record.isp?.isp ?? null,
      bandwidth: record.bandwidth,
      downloadSpeed: record.downloadSpeed,
      uploadSpeed: record.uploadSpeed,
      link: record.link,
    })),
    total
  );
}

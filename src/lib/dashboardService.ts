"use server";

import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "./prisma";

const UNKNOWN_LOCATION = "Tanpa Company";

const normalizeLocation = (value: string | null | undefined) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : UNKNOWN_LOCATION;
};

const formatDurationShort = (milliseconds: number) => {
  if (!Number.isFinite(milliseconds) || milliseconds <= 0) {
    return "0m";
  }

  const totalMinutes = Math.floor(milliseconds / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

const toCurrencyNumber = (value: unknown) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

export async function getDashboardData() {
  noStore();

  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalAssets,
    assignedAssets,
    unassignedAssets,
    totalUsers,
    activeUsers,
    totalIpAddresses,
    totalPhoneAccounts,
    categoryCounts,
    categories,
    assignedAssetLocations,
    ipLocationCounts,
    activeUserLocationCounts,
    activeUserLocationHomebaseCounts,
    laptopOsCounts,
    intelNucOsCounts,
    osOptions,
    currentMonthBilling,
    topBillingUsersRaw,
    recentBillingRecords,
    recentProblemSequences,
    problemSequencesLast30Days,
    recentServiceRecords,
    serviceRecordsLast30Days,
    computerMaintenancesLast30Days,
    printerMaintenancesLast30Days,
    cctvMaintenancesLast30Days,
    ispReportsLast30Days,
    recentIspReports,
  ] = await Promise.all([
    prisma.asset.count(),
    prisma.asset.count({
      where: {
        assignments: {
          some: {},
        },
      },
    }),
    prisma.asset.count({
      where: {
        assignments: {
          none: {},
        },
      },
    }),
    prisma.user.count(),
    prisma.user.count({
      where: {
        isActive: true,
      },
    }),
    prisma.ipAddress.count(),
    prisma.phoneAccount.count(),
    prisma.asset.groupBy({
      by: ["categoryId"],
      _count: {
        _all: true,
      },
    }),
    prisma.assetCategory.findMany({
      select: {
        id: true,
        nama: true,
      },
    }),
    prisma.assetAssignment.findMany({
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        assetId: true,
        user: {
          select: {
            lokasiKantor: true,
            jabatan: true,
          },
        },
        asset: {
          select: {
            categoryId: true,
          },
        },
      },
    }),
    prisma.ipAddress.groupBy({
      by: ["company"],
      _count: {
        _all: true,
      },
    }),
    prisma.user.groupBy({
      by: ["lokasiKantor"],
      where: {
        isActive: true,
      },
      _count: {
        _all: true,
      },
    }),
    prisma.user.groupBy({
      by: ["lokasiKantor", "jabatan"],
      where: {
        isActive: true,
      },
      _count: {
        _all: true,
      },
    }),
    prisma.laptopSpecs.groupBy({
      by: ["osOptionId"],
      _count: {
        _all: true,
      },
    }),
    prisma.intelNucSpecs.groupBy({
      by: ["osOptionId"],
      _count: {
        _all: true,
      },
    }),
    prisma.laptopOsOption.findMany({
      select: {
        id: true,
        value: true,
      },
    }),
    prisma.bilingRecord.aggregate({
      where: {
        callDate: {
          gte: currentMonthStart,
        },
      },
      _sum: {
        cost: true,
      },
      _count: {
        _all: true,
      },
    }),
    prisma.bilingRecord.groupBy({
      by: ["userId"],
      where: {
        callDate: {
          gte: currentMonthStart,
        },
      },
      _sum: {
        cost: true,
      },
      _count: {
        _all: true,
      },
    }),
    prisma.bilingRecord.findMany({
      take: 6,
      orderBy: {
        callDate: "desc",
      },
      include: {
        user: {
          select: {
            namaLengkap: true,
          },
        },
      },
    }),
    prisma.problemSequence.findMany({
      take: 6,
      orderBy: {
        dateDown: "desc",
      },
      include: {
        isp: {
          select: {
            isp: true,
          },
        },
      },
    }),
    prisma.problemSequence.findMany({
      where: {
        dateDown: {
          gte: thirtyDaysAgo,
        },
      },
      include: {
        isp: {
          select: {
            isp: true,
          },
        },
      },
      orderBy: {
        dateDown: "desc",
      },
    }),
    prisma.serviceRecord.findMany({
      take: 6,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        assetAssignment: {
          select: {
            nomorAsset: true,
            asset: {
              select: {
                namaAsset: true,
              },
            },
            user: {
              select: {
                namaLengkap: true,
              },
            },
          },
        },
      },
    }),
    prisma.serviceRecord.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    }),
    prisma.computerMaintenance.count({
      where: {
        periode: {
          gte: thirtyDaysAgo,
        },
      },
    }),
    prisma.printerRepetitiveMaintenance.count({
      where: {
        reportDate: {
          gte: thirtyDaysAgo,
        },
      },
    }),
    prisma.cctvRepetitiveMaintenance.count({
      where: {
        periode: {
          gte: thirtyDaysAgo,
        },
      },
    }),
    prisma.ispReport.aggregate({
      where: {
        reportDate: {
          gte: thirtyDaysAgo,
        },
      },
      _count: {
        _all: true,
      },
      _avg: {
        downloadSpeed: true,
        uploadSpeed: true,
      },
    }),
    prisma.ispReport.findMany({
      take: 6,
      orderBy: {
        reportDate: "desc",
      },
      include: {
        isp: {
          select: {
            isp: true,
          },
        },
      },
    }),
  ]);

  const categoryNameById = new Map(categories.map((category) => [category.id, category.nama]));
  const osNameById = new Map(osOptions.map((option) => [option.id, option.value]));

  const assetDistributionByCategory = categoryCounts
    .map((row) => ({
      name: categoryNameById.get(row.categoryId) ?? `Kategori ${row.categoryId}`,
      total: row._count._all,
      categoryId: row.categoryId,
    }))
    .sort((left, right) => right.total - left.total);

  const assignmentLocationCategoryMap = new Map<
    string,
    {
      id: number;
      name: string;
      total: number;
    }[]
  >();
  const assignedAssetCountByLocation = new Map<string, number>();
  const processedAssignedAssetIds = new Set<number>();
  const homebasesByLocation = new Map<string, Set<string>>();

  for (const row of assignedAssetLocations) {
    if (processedAssignedAssetIds.has(row.assetId)) {
      continue;
    }

    processedAssignedAssetIds.add(row.assetId);

    const location = normalizeLocation(row.user.lokasiKantor);
    assignedAssetCountByLocation.set(
      location,
      (assignedAssetCountByLocation.get(location) ?? 0) + 1
    );

    const bucket = assignmentLocationCategoryMap.get(location) ?? [];
    const homebase = row.user.jabatan?.trim();
    const homebaseBucket = homebasesByLocation.get(location) ?? new Set<string>();
    if (homebase) {
      homebaseBucket.add(homebase);
      homebasesByLocation.set(location, homebaseBucket);
    }
    const categoryName =
      categoryNameById.get(row.asset.categoryId) ?? `Kategori ${row.asset.categoryId}`;
    const existingCategory = bucket.find((category) => category.id === row.asset.categoryId);

    if (existingCategory) {
      existingCategory.total += 1;
    } else {
      bucket.push({
        id: row.asset.categoryId,
        name: categoryName,
        total: 1,
      });
    }

    assignmentLocationCategoryMap.set(location, bucket);
  }

  const ipCountByLocation = new Map(
    ipLocationCounts.map((row) => [normalizeLocation(row.company), row._count._all])
  );
  const activeUserCountByLocation = new Map(
    activeUserLocationCounts.map((row) => [normalizeLocation(row.lokasiKantor), row._count._all])
  );

  for (const row of activeUserLocationHomebaseCounts) {
    const location = normalizeLocation(row.lokasiKantor);
    const homebase = row.jabatan?.trim();
    if (!homebase) {
      continue;
    }

    const bucket = homebasesByLocation.get(location) ?? new Set<string>();
    bucket.add(homebase);
    homebasesByLocation.set(location, bucket);
  }

  const locationKeys = new Set([
    ...assignedAssetCountByLocation.keys(),
    ...ipCountByLocation.keys(),
    ...activeUserCountByLocation.keys(),
  ]);

  const locationSummary = Array.from(locationKeys)
    .map((location) => {
      const categoriesAtLocation = assignmentLocationCategoryMap.get(location) ?? [];
      let topCategory = "-";
      let topCategoryCount = 0;

      for (const category of categoriesAtLocation) {
        if (category.total > topCategoryCount) {
          topCategory = category.name;
          topCategoryCount = category.total;
        }
      }

      return {
        location,
        totalAssets: assignedAssetCountByLocation.get(location) ?? 0,
        totalIpAddresses: ipCountByLocation.get(location) ?? 0,
        activeUsers: activeUserCountByLocation.get(location) ?? 0,
        topCategory,
        topCategoryCount,
        homebases: Array.from(homebasesByLocation.get(location) ?? []).sort(),
        categoryIds: categoriesAtLocation.map((category) => category.id),
        categories: categoriesAtLocation.map((category) => category.name),
      };
    })
    .sort((left, right) => right.totalAssets - left.totalAssets || right.totalIpAddresses - left.totalIpAddresses);

  const assetDistributionByLocation = Array.from(assignedAssetCountByLocation.entries())
    .map(([location, total]) => ({
      location,
      total,
    }))
    .filter((item) => item.total > 0)
    .sort((left, right) => right.total - left.total);

  const operatingSystemTotals = new Map<number, number>();

  for (const row of laptopOsCounts) {
    if (row.osOptionId === null) continue;
    operatingSystemTotals.set(
      row.osOptionId,
      (operatingSystemTotals.get(row.osOptionId) ?? 0) + row._count._all
    );
  }

  for (const row of intelNucOsCounts) {
    if (row.osOptionId === null) continue;
    operatingSystemTotals.set(
      row.osOptionId,
      (operatingSystemTotals.get(row.osOptionId) ?? 0) + row._count._all
    );
  }

  const operatingSystemDistribution = Array.from(operatingSystemTotals.entries())
    .map(([osOptionId, total]) => ({
      name: osNameById.get(osOptionId) ?? `OS ${osOptionId}`,
      total,
      percentage: totalAssets > 0 ? (total / totalAssets) * 100 : 0,
    }))
    .sort((left, right) => right.total - left.total);

  const currentMonthBillingTotal = toCurrencyNumber(currentMonthBilling._sum.cost);

  const billingUserIds = topBillingUsersRaw.map((row) => row.userId);
  const billingUsers = billingUserIds.length
    ? await prisma.user.findMany({
        where: {
          id: {
            in: billingUserIds,
          },
        },
        select: {
          id: true,
          namaLengkap: true,
        },
      })
    : [];

  const billingUserNameById = new Map(billingUsers.map((user) => [user.id, user.namaLengkap]));

  const topBillingUsers = topBillingUsersRaw
    .map((row) => ({
      userId: row.userId,
      name: billingUserNameById.get(row.userId) ?? `User ${row.userId}`,
      totalCost: toCurrencyNumber(row._sum.cost),
      totalRecords: row._count._all,
    }))
    .sort((left, right) => right.totalCost - left.totalCost)
    .slice(0, 5);

  const problemSlaDurations = problemSequencesLast30Days.map((record) =>
    Math.max(new Date(record.dateDoneUp).getTime() - new Date(record.dateDown).getTime(), 0)
  );

  const averageProblemSlaMs = problemSlaDurations.length
    ? problemSlaDurations.reduce((sum, value) => sum + value, 0) / problemSlaDurations.length
    : 0;

  const longestProblemEntry = problemSequencesLast30Days.reduce<null | {
    ticketNumber: string;
    sbu: string;
    isp: string;
    durationMs: number;
  }>((current, record) => {
    const durationMs = Math.max(
      new Date(record.dateDoneUp).getTime() - new Date(record.dateDown).getTime(),
      0
    );

    if (!current || durationMs > current.durationMs) {
      return {
        ticketNumber: record.ticketNumber,
        sbu: record.sbu,
        isp: record.isp.isp,
        durationMs,
      };
    }

    return current;
  }, null);

  const recentActivity = [
    ...recentProblemSequences.map((record) => ({
      id: `problem-${record.id}`,
      type: "Problem Sequence",
      title: record.ticketNumber,
      subtitle: `${record.sbu} • ${record.isp.isp}`,
      date: record.dateDown.toISOString(),
      value: formatDurationShort(
        Math.max(
          new Date(record.dateDoneUp).getTime() - new Date(record.dateDown).getTime(),
          0
        )
      ),
    })),
    ...recentServiceRecords.map((record) => ({
      id: `service-${record.id}`,
      type: "Service Record",
      title: record.assetAssignment.asset.namaAsset,
      subtitle: `${record.assetAssignment.user.namaLengkap} • ${record.repairType}`,
      date: record.createdAt.toISOString(),
      value: `Rp ${toCurrencyNumber(record.cost).toLocaleString("id-ID")}`,
    })),
    ...recentBillingRecords.map((record) => ({
      id: `billing-${record.id}`,
      type: "Billing Record",
      title: record.user.namaLengkap,
      subtitle: `EXT ${record.extension} • ${record.dial}`,
      date: record.callDate.toISOString(),
      value: `Rp ${toCurrencyNumber(record.cost).toLocaleString("id-ID")}`,
    })),
    ...recentIspReports.map((record) => ({
      id: `isp-${record.id}`,
      type: "ISP Speed Test",
      title: record.sbu,
      subtitle: record.isp.isp,
      date: record.reportDate.toISOString(),
      value: `${record.downloadSpeed.toFixed(1)} / ${record.uploadSpeed.toFixed(1)} Mbps`,
    })),
  ]
    .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
    .slice(0, 8);

  return {
    generatedAt: now.toISOString(),
    metrics: {
      totalAssets,
      assignedAssets,
      unassignedAssets,
      totalUsers,
      activeUsers,
      totalIpAddresses,
      totalPhoneAccounts,
      currentMonthBillingRecords: currentMonthBilling._count._all,
      currentMonthBillingTotal,
      problemTicketsLast30Days: problemSequencesLast30Days.length,
      averageProblemSlaMs,
      serviceRecordsLast30Days,
      computerMaintenancesLast30Days,
      printerMaintenancesLast30Days,
      cctvMaintenancesLast30Days,
      ispReportsLast30Days: ispReportsLast30Days._count._all,
      averageDownloadLast30Days: ispReportsLast30Days._avg.downloadSpeed ?? 0,
      averageUploadLast30Days: ispReportsLast30Days._avg.uploadSpeed ?? 0,
    },
    assetDistributionByCategory,
    assetDistributionByLocation,
    operatingSystemDistribution,
    locationSummary: locationSummary.slice(0, 10),
    locationSummaryFilters: {
      homebases: ["HOLDING", "SBU"],
      categories: categories
        .map((category) => ({
          id: category.id,
          name: category.nama,
        }))
        .sort((left, right) => left.name.localeCompare(right.name)),
    },
    topBillingUsers,
    recentActivity,
    recentProblemSequences: recentProblemSequences.map((record) => ({
      id: record.id,
      ticketNumber: record.ticketNumber,
      sbu: record.sbu,
      isp: record.isp.isp,
      dateDown: record.dateDown.toISOString(),
      slaLabel: formatDurationShort(
        Math.max(
          new Date(record.dateDoneUp).getTime() - new Date(record.dateDown).getTime(),
          0
        )
      ),
    })),
    longestProblem: longestProblemEntry
      ? {
          ticketNumber: longestProblemEntry.ticketNumber,
          sbu: longestProblemEntry.sbu,
          isp: longestProblemEntry.isp,
          durationLabel: formatDurationShort(longestProblemEntry.durationMs),
        }
      : null,
  };
}

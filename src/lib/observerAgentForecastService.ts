import { unstable_noStore as noStore } from "next/cache";

import { computeObserverDeviceStatus } from "@/lib/observerAgentService";
import { prisma } from "@/lib/prisma";

const MS_PER_DAY = 86_400_000;
const FORECAST_LOOKBACK_DAYS = 90;
const MAX_DAILY_POINTS = 30;
const MIN_HISTORY_POINTS = 3;
const MIN_HISTORY_SPAN_DAYS = 3;
const MIN_FORECAST_DECLINE_PER_DAY = 0.03;
const WARNING_THRESHOLD = 15;
const CRITICAL_THRESHOLD = 10;
const FULL_THRESHOLD = 0;

export type ObserverCapacityForecastSeverity =
  | "CRITICAL"
  | "WARNING"
  | "WATCH"
  | "STABLE";

export type ObserverCapacityRecommendationKind =
  | "UPGRADE"
  | "CLEANUP"
  | "MONITOR"
  | "NONE";

export type ObserverCapacityTrendPoint = {
  collectedAt: Date;
  freePercent: number;
};

export type ObserverCapacityForecastRow = {
  id: number;
  deviceId: string;
  hostname: string;
  aliasName: string | null;
  username: string | null;
  ipAddress: string | null;
  publicIp: string | null;
  lastSeen: Date | null;
  lastReportAt: Date | null;
  operationLabel: "ONLINE" | "OFFLINE/STALE" | "UNKNOWN";
  driveLetter: string;
  totalGb: number | null;
  freeGb: number | null;
  latestFreePercent: number | null;
  latestCollectedAt: Date | null;
  sampleCount: number;
  historySpanDays: number;
  trendPoints: ObserverCapacityTrendPoint[];
  forecastReady: boolean;
  slopePercentPerDay: number | null;
  slopePercentPerWeek: number | null;
  projectedCriticalAt: Date | null;
  projectedFullAt: Date | null;
  daysToCritical: number | null;
  daysToFull: number | null;
  severity: ObserverCapacityForecastSeverity;
  recommendationKind: ObserverCapacityRecommendationKind;
  recommendationLabel: string;
  recommendationDetail: string;
  reasoning: string[];
  hasPredictedFailure: boolean;
  hasWearConcern: boolean;
};

export type ObserverCapacityForecastOverview = {
  generatedAt: Date;
  lookbackDays: number;
  summary: {
    totalDevices: number;
    criticalDevices: number;
    warningDevices: number;
    watchDevices: number;
    forecastThirtyDays: number;
    upgradeCandidates: number;
    cleanupCandidates: number;
    insufficientHistory: number;
    staleOrOfflineDevices: number;
    noStorageData: number;
  };
  rows: ObserverCapacityForecastRow[];
  noStorageData: Array<{
    id: number;
    deviceId: string;
    hostname: string;
    aliasName: string | null;
    lastSeen: Date | null;
  }>;
};

type RegressionResult = {
  slope: number;
  intercept: number;
};

function daysBetween(start: Date, end: Date) {
  return (end.getTime() - start.getTime()) / MS_PER_DAY;
}

function getOperationLabel(input: {
  online: boolean;
  offline: boolean;
  stale: boolean;
}): ObserverCapacityForecastRow["operationLabel"] {
  if (input.online) return "ONLINE";
  if (input.offline || input.stale) return "OFFLINE/STALE";
  return "UNKNOWN";
}

function getDailyPointKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function collapseDailyPoints(points: ObserverCapacityTrendPoint[]) {
  const byDay = new Map<string, ObserverCapacityTrendPoint>();

  for (const point of points) {
    byDay.set(getDailyPointKey(point.collectedAt), point);
  }

  return Array.from(byDay.values())
    .sort((a, b) => a.collectedAt.getTime() - b.collectedAt.getTime())
    .slice(-MAX_DAILY_POINTS);
}

function calculateRegression(
  points: ObserverCapacityTrendPoint[]
): RegressionResult | null {
  if (points.length < 2) return null;

  const origin = points[0]?.collectedAt;
  if (!origin) return null;

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (const point of points) {
    const x = daysBetween(origin, point.collectedAt);
    const y = point.freePercent;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }

  const count = points.length;
  const denominator = count * sumXX - sumX * sumX;
  if (denominator === 0) return null;

  const slope = (count * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / count;

  if (!Number.isFinite(slope) || !Number.isFinite(intercept)) {
    return null;
  }

  return { slope, intercept };
}

function projectThreshold(
  latestAt: Date | null,
  latestFreePercent: number | null,
  slopePercentPerDay: number | null,
  threshold: number
) {
  if (!latestAt) return null;
  if (typeof latestFreePercent !== "number") return null;
  if (typeof slopePercentPerDay !== "number") return null;
  if (slopePercentPerDay >= -MIN_FORECAST_DECLINE_PER_DAY) return null;
  if (latestFreePercent <= threshold) {
    return { days: 0, at: latestAt };
  }

  const days = (threshold - latestFreePercent) / slopePercentPerDay;
  if (!Number.isFinite(days) || days < 0) return null;

  return {
    days,
    at: new Date(latestAt.getTime() + days * MS_PER_DAY),
  };
}

function classifySeverity(input: {
  latestFreePercent: number | null;
  daysToCritical: number | null;
  hasPredictedFailure: boolean;
  hasWearConcern: boolean;
  slopePercentPerDay: number | null;
}): ObserverCapacityForecastSeverity {
  if (input.hasPredictedFailure || input.hasWearConcern) return "CRITICAL";
  if (
    typeof input.latestFreePercent === "number" &&
    input.latestFreePercent < CRITICAL_THRESHOLD
  ) {
    return "CRITICAL";
  }
  if (
    typeof input.daysToCritical === "number" &&
    input.daysToCritical <= 7
  ) {
    return "CRITICAL";
  }
  if (
    typeof input.latestFreePercent === "number" &&
    input.latestFreePercent < WARNING_THRESHOLD
  ) {
    return "WARNING";
  }
  if (
    typeof input.daysToCritical === "number" &&
    input.daysToCritical <= 30
  ) {
    return "WARNING";
  }
  if (
    typeof input.daysToCritical === "number" &&
    input.daysToCritical <= 60
  ) {
    return "WATCH";
  }
  if (
    typeof input.slopePercentPerDay === "number" &&
    input.slopePercentPerDay <= -MIN_FORECAST_DECLINE_PER_DAY
  ) {
    return "WATCH";
  }
  return "STABLE";
}

function buildRecommendation(input: {
  totalGb: number | null;
  latestFreePercent: number | null;
  daysToCritical: number | null;
  hasPredictedFailure: boolean;
  hasWearConcern: boolean;
}): Pick<
  ObserverCapacityForecastRow,
  "recommendationKind" | "recommendationLabel" | "recommendationDetail"
> {
  if (input.hasPredictedFailure || input.hasWearConcern) {
    return {
      recommendationKind: "UPGRADE",
      recommendationLabel: "Review upgrade SSD",
      recommendationDetail:
        "Health storage menunjukkan indikasi risiko hardware. Prioritaskan penggantian atau right-size storage.",
    };
  }

  if (
    typeof input.latestFreePercent === "number" &&
    input.latestFreePercent < CRITICAL_THRESHOLD
  ) {
    return {
      recommendationKind: "CLEANUP",
      recommendationLabel: "Cleanup segera",
      recommendationDetail:
        "Free space sudah di bawah 10%. Bersihkan storage secepatnya untuk menurunkan risiko crash/failed update.",
    };
  }

  if (
    typeof input.daysToCritical === "number" &&
    input.daysToCritical <= 30
  ) {
    if (typeof input.totalGb === "number" && input.totalGb <= 256) {
      return {
        recommendationKind: "UPGRADE",
        recommendationLabel: "Upgrade atau cleanup massal",
        recommendationDetail:
          "Kapasitas drive relatif kecil dan tren turun menuju critical kurang dari 30 hari.",
      };
    }

    return {
      recommendationKind: "CLEANUP",
      recommendationLabel: "Jadwalkan cleanup",
      recommendationDetail:
        "Tren pemakaian storage saat ini diproyeksikan menyentuh zona critical dalam 30 hari.",
    };
  }

  if (
    typeof input.latestFreePercent === "number" &&
    input.latestFreePercent < WARNING_THRESHOLD
  ) {
    return {
      recommendationKind: "CLEANUP",
      recommendationLabel: "Cleanup storage",
      recommendationDetail:
        "Free space sudah berada di zona warning meskipun belum masuk critical.",
    };
  }

  if (
    typeof input.daysToCritical === "number" &&
    input.daysToCritical <= 60
  ) {
    return {
      recommendationKind: "MONITOR",
      recommendationLabel: "Monitor mingguan",
      recommendationDetail:
        "Belum butuh aksi besar, tapi tren turun sudah cukup jelas untuk dipantau per minggu.",
    };
  }

  return {
    recommendationKind: "NONE",
    recommendationLabel: "Normal",
    recommendationDetail:
      "Belum ada indikasi kebutuhan cleanup massal atau upgrade storage.",
  };
}

function buildReasoning(input: {
  latestFreePercent: number | null;
  sampleCount: number;
  daysToCritical: number | null;
  slopePercentPerWeek: number | null;
  hasPredictedFailure: boolean;
  hasWearConcern: boolean;
  forecastReady: boolean;
}) {
  const reasoning: string[] = [];

  if (typeof input.latestFreePercent === "number") {
    reasoning.push(`Free space saat ini ${input.latestFreePercent.toFixed(1)}%.`);
  }

  if (input.hasPredictedFailure) {
    reasoning.push("SMART/health storage mengindikasikan predicted failure.");
  } else if (input.hasWearConcern) {
    reasoning.push("Cadangan wear/available spare storage sudah menipis.");
  }

  if (
    typeof input.slopePercentPerWeek === "number" &&
    input.slopePercentPerWeek < 0
  ) {
    reasoning.push(
      `Tren turun sekitar ${Math.abs(input.slopePercentPerWeek).toFixed(2)}% per minggu.`
    );
  }

  if (typeof input.daysToCritical === "number") {
    reasoning.push(
      `Estimasi menyentuh 10% free space dalam ${Math.max(
        0,
        Math.round(input.daysToCritical)
      )} hari.`
    );
  } else if (!input.forecastReady) {
    reasoning.push(
      `Histori belum cukup untuk forecast stabil (baru ${input.sampleCount} snapshot harian).`
    );
  }

  return reasoning;
}

function severityRank(severity: ObserverCapacityForecastSeverity) {
  if (severity === "CRITICAL") return 0;
  if (severity === "WARNING") return 1;
  if (severity === "WATCH") return 2;
  return 3;
}

function sortRows(a: ObserverCapacityForecastRow, b: ObserverCapacityForecastRow) {
  const severity = severityRank(a.severity) - severityRank(b.severity);
  if (severity !== 0) return severity;

  const etaA =
    typeof a.daysToCritical === "number" ? a.daysToCritical : Number.POSITIVE_INFINITY;
  const etaB =
    typeof b.daysToCritical === "number" ? b.daysToCritical : Number.POSITIVE_INFINITY;
  if (etaA !== etaB) return etaA - etaB;

  const freeA =
    typeof a.latestFreePercent === "number" ? a.latestFreePercent : Number.POSITIVE_INFINITY;
  const freeB =
    typeof b.latestFreePercent === "number" ? b.latestFreePercent : Number.POSITIVE_INFINITY;
  if (freeA !== freeB) return freeA - freeB;

  const seenA = a.lastSeen ? a.lastSeen.getTime() : 0;
  const seenB = b.lastSeen ? b.lastSeen.getTime() : 0;
  return seenB - seenA;
}

export async function getObserverCapacityForecastOverview(): Promise<ObserverCapacityForecastOverview> {
  noStore();

  const generatedAt = new Date();
  const cutoff = new Date(generatedAt.getTime() - FORECAST_LOOKBACK_DAYS * MS_PER_DAY);

  const [devices, snapshots] = await Promise.all([
    prisma.observerDevice.findMany({
      include: {
        hardwareSpec: true,
        storageDrives: true,
        storageHealth: true,
      },
      orderBy: [{ lastSeen: "desc" }, { id: "desc" }],
    }),
    prisma.observerStorageSnapshot.findMany({
      where: {
        collectedAt: {
          gte: cutoff,
        },
      },
      orderBy: [
        { deviceRefId: "asc" },
        { driveLetter: "asc" },
        { collectedAt: "asc" },
      ],
    }),
  ]);

  const snapshotMap = new Map<string, ObserverCapacityTrendPoint[]>();
  for (const snapshot of snapshots) {
    if (typeof snapshot.freePercent !== "number") continue;
    const key = `${snapshot.deviceRefId}:::${snapshot.driveLetter}`;
    const points = snapshotMap.get(key) ?? [];
    points.push({
      collectedAt: snapshot.collectedAt,
      freePercent: snapshot.freePercent,
    });
    snapshotMap.set(key, points);
  }

  const rows: ObserverCapacityForecastRow[] = [];
  const noStorageData: ObserverCapacityForecastOverview["noStorageData"] = [];

  for (const device of devices) {
    const status = computeObserverDeviceStatus({
      lastSeen: device.lastSeen,
      lastReportAt: device.lastReportAt,
      ramGb: device.hardwareSpec?.ramGb ?? null,
      drives: device.storageDrives.map((drive) => ({
        freePercent: drive.freePercent,
        status: drive.status,
      })),
    });

    if (device.storageDrives.length === 0) {
      noStorageData.push({
        id: device.id,
        deviceId: device.deviceId,
        hostname: device.hostname,
        aliasName: device.aliasName,
        lastSeen: device.lastSeen,
      });
      continue;
    }

    const hasPredictedFailure = device.storageHealth.some(
      (health) => health.predictedFailure === true
    );
    const hasWearConcern = device.storageHealth.some((health) => {
      if (
        typeof health.availableSparePercent === "number" &&
        health.availableSparePercent <= 10
      ) {
        return true;
      }
      if (
        typeof health.wearLevelPercent === "number" &&
        health.wearLevelPercent <= 10
      ) {
        return true;
      }
      return false;
    });

    const perDriveRows = device.storageDrives.map((drive) => {
      const key = `${device.id}:::${drive.driveLetter}`;
      const rawPoints = snapshotMap.get(key) ?? [];
      const trendPoints = collapseDailyPoints(rawPoints);
      const latestPoint = trendPoints[trendPoints.length - 1] ?? null;
      const latestCollectedAt = latestPoint?.collectedAt ?? device.lastReportAt ?? null;
      const latestFreePercent =
        typeof drive.freePercent === "number"
          ? drive.freePercent
          : latestPoint?.freePercent ?? null;
      const historySpanDays =
        trendPoints.length >= 2
          ? daysBetween(trendPoints[0].collectedAt, trendPoints[trendPoints.length - 1].collectedAt)
          : 0;
      const regression = calculateRegression(trendPoints);
      const forecastReady =
        trendPoints.length >= MIN_HISTORY_POINTS &&
        historySpanDays >= MIN_HISTORY_SPAN_DAYS &&
        regression !== null;
      const slopePercentPerDay = forecastReady ? regression!.slope : null;
      const slopePercentPerWeek =
        typeof slopePercentPerDay === "number" ? slopePercentPerDay * 7 : null;
      const criticalProjection = projectThreshold(
        latestCollectedAt,
        latestFreePercent,
        slopePercentPerDay,
        CRITICAL_THRESHOLD
      );
      const fullProjection = projectThreshold(
        latestCollectedAt,
        latestFreePercent,
        slopePercentPerDay,
        FULL_THRESHOLD
      );

      const severity = classifySeverity({
        latestFreePercent,
        daysToCritical: criticalProjection?.days ?? null,
        hasPredictedFailure,
        hasWearConcern,
        slopePercentPerDay,
      });

      const recommendation = buildRecommendation({
        totalGb: drive.totalGb,
        latestFreePercent,
        daysToCritical: criticalProjection?.days ?? null,
        hasPredictedFailure,
        hasWearConcern,
      });

      return {
        id: device.id,
        deviceId: device.deviceId,
        hostname: device.hostname,
        aliasName: device.aliasName,
        username: device.username,
        ipAddress: device.ipAddress,
        publicIp: device.publicIp,
        lastSeen: device.lastSeen,
        lastReportAt: device.lastReportAt,
        operationLabel: getOperationLabel(status),
        driveLetter: drive.driveLetter,
        totalGb: drive.totalGb,
        freeGb: drive.freeGb,
        latestFreePercent,
        latestCollectedAt,
        sampleCount: trendPoints.length,
        historySpanDays,
        trendPoints,
        forecastReady,
        slopePercentPerDay,
        slopePercentPerWeek,
        projectedCriticalAt: criticalProjection?.at ?? null,
        projectedFullAt: fullProjection?.at ?? null,
        daysToCritical: criticalProjection?.days ?? null,
        daysToFull: fullProjection?.days ?? null,
        severity,
        ...recommendation,
        reasoning: buildReasoning({
          latestFreePercent,
          sampleCount: trendPoints.length,
          daysToCritical: criticalProjection?.days ?? null,
          slopePercentPerWeek,
          hasPredictedFailure,
          hasWearConcern,
          forecastReady,
        }),
        hasPredictedFailure,
        hasWearConcern,
      } satisfies ObserverCapacityForecastRow;
    });

    perDriveRows.sort(sortRows);
    rows.push(perDriveRows[0]);
  }

  const sortedRows = rows.sort(sortRows);

  const summary = sortedRows.reduce(
    (acc, row) => {
      acc.totalDevices += 1;
      if (row.severity === "CRITICAL") acc.criticalDevices += 1;
      if (row.severity === "WARNING") acc.warningDevices += 1;
      if (row.severity === "WATCH") acc.watchDevices += 1;
      if (
        typeof row.daysToCritical === "number" &&
        row.daysToCritical <= 30
      ) {
        acc.forecastThirtyDays += 1;
      }
      if (row.recommendationKind === "UPGRADE") acc.upgradeCandidates += 1;
      if (row.recommendationKind === "CLEANUP") acc.cleanupCandidates += 1;
      if (!row.forecastReady) acc.insufficientHistory += 1;
      if (row.operationLabel === "OFFLINE/STALE") acc.staleOrOfflineDevices += 1;
      return acc;
    },
    {
      totalDevices: 0,
      criticalDevices: 0,
      warningDevices: 0,
      watchDevices: 0,
      forecastThirtyDays: 0,
      upgradeCandidates: 0,
      cleanupCandidates: 0,
      insufficientHistory: 0,
      staleOrOfflineDevices: 0,
      noStorageData: noStorageData.length,
    }
  );

  return {
    generatedAt,
    lookbackDays: FORECAST_LOOKBACK_DAYS,
    summary,
    rows: sortedRows,
    noStorageData,
  };
}

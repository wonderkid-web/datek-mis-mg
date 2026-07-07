import { unstable_noStore as noStore } from "next/cache";

import { prisma } from "@/lib/prisma";

export const OBSERVER_RUNTIME_CONFIG_DEFAULTS = {
  heartbeat_interval_minutes: 3,
  full_report_interval_hours: 24,
} as const;

export const OBSERVER_RUNTIME_CONFIG_LIMITS = {
  heartbeat_interval_minutes: { min: 1, max: 1440 },
  full_report_interval_hours: { min: 1, max: 720 },
} as const;

const GLOBAL_SCOPE_TYPE = "GLOBAL";
const GLOBAL_SCOPE_KEY = "global";
const DEVICE_SCOPE_TYPE = "DEVICE";

type RuntimeConfigRow = {
  id: number;
  scopeType: string;
  scopeKey: string;
  heartbeatIntervalMinutes: number;
  fullReportIntervalHours: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ObserverRuntimeConfigPayload = {
  heartbeat_interval_minutes: number;
  full_report_interval_hours: number;
};

export type ObserverRuntimeConfigView = {
  id: number | null;
  scopeType: string;
  scopeKey: string;
  isActive: boolean;
  isDefault: boolean;
  runtimeConfig: ObserverRuntimeConfigPayload;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export class ObserverRuntimeConfigValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ObserverRuntimeConfigValidationError";
  }
}

function normalizeInteger(
  value: unknown,
  fieldLabel: string,
  limits: { min: number; max: number }
) {
  const numberValue =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : Number.NaN;

  if (!Number.isInteger(numberValue)) {
    throw new ObserverRuntimeConfigValidationError(`${fieldLabel} harus berupa angka bulat.`);
  }

  if (numberValue < limits.min || numberValue > limits.max) {
    throw new ObserverRuntimeConfigValidationError(
      `${fieldLabel} harus di antara ${limits.min} dan ${limits.max}.`
    );
  }

  return numberValue;
}

function isValidInteger(value: unknown, limits: { min: number; max: number }) {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= limits.min &&
    value <= limits.max
  );
}

function normalizeRuntimeConfig(row: RuntimeConfigRow | null): ObserverRuntimeConfigView {
  const heartbeatIntervalMinutes = isValidInteger(
    row?.heartbeatIntervalMinutes,
    OBSERVER_RUNTIME_CONFIG_LIMITS.heartbeat_interval_minutes
  )
    ? row!.heartbeatIntervalMinutes
    : OBSERVER_RUNTIME_CONFIG_DEFAULTS.heartbeat_interval_minutes;
  const fullReportIntervalHours = isValidInteger(
    row?.fullReportIntervalHours,
    OBSERVER_RUNTIME_CONFIG_LIMITS.full_report_interval_hours
  )
    ? row!.fullReportIntervalHours
    : OBSERVER_RUNTIME_CONFIG_DEFAULTS.full_report_interval_hours;

  return {
    id: row?.id ?? null,
    scopeType: row?.scopeType ?? GLOBAL_SCOPE_TYPE,
    scopeKey: row?.scopeKey ?? GLOBAL_SCOPE_KEY,
    isActive: row?.isActive ?? true,
    isDefault: !row,
    runtimeConfig: {
      heartbeat_interval_minutes: heartbeatIntervalMinutes,
      full_report_interval_hours: fullReportIntervalHours,
    },
    createdAt: row?.createdAt ?? null,
    updatedAt: row?.updatedAt ?? null,
  };
}

export function getDefaultObserverRuntimeConfigView() {
  return normalizeRuntimeConfig(null);
}

export function validateObserverRuntimeConfigInput(input: {
  heartbeatIntervalMinutes: unknown;
  fullReportIntervalHours: unknown;
}) {
  return {
    heartbeatIntervalMinutes: normalizeInteger(
      input.heartbeatIntervalMinutes,
      "Heartbeat Interval",
      OBSERVER_RUNTIME_CONFIG_LIMITS.heartbeat_interval_minutes
    ),
    fullReportIntervalHours: normalizeInteger(
      input.fullReportIntervalHours,
      "Full Report Interval",
      OBSERVER_RUNTIME_CONFIG_LIMITS.full_report_interval_hours
    ),
  };
}

export async function getGlobalObserverRuntimeConfig() {
  noStore();

  const row = await prisma.observerRuntimeConfig.findFirst({
    where: {
      scopeType: GLOBAL_SCOPE_TYPE,
      scopeKey: GLOBAL_SCOPE_KEY,
      isActive: true,
    },
  });

  return normalizeRuntimeConfig(row);
}

export async function getObserverRuntimeConfigForAgent(input: {
  deviceId: string;
}) {
  const rows = await prisma.observerRuntimeConfig.findMany({
    where: {
      isActive: true,
      OR: [
        {
          scopeType: DEVICE_SCOPE_TYPE,
          scopeKey: input.deviceId,
        },
        {
          scopeType: GLOBAL_SCOPE_TYPE,
          scopeKey: GLOBAL_SCOPE_KEY,
        },
      ],
    },
  });

  const deviceConfig = rows.find(
    (row) => row.scopeType === DEVICE_SCOPE_TYPE && row.scopeKey === input.deviceId
  );
  const globalConfig = rows.find(
    (row) => row.scopeType === GLOBAL_SCOPE_TYPE && row.scopeKey === GLOBAL_SCOPE_KEY
  );

  return normalizeRuntimeConfig(deviceConfig ?? globalConfig ?? null).runtimeConfig;
}

export async function updateGlobalObserverRuntimeConfig(input: {
  heartbeatIntervalMinutes: unknown;
  fullReportIntervalHours: unknown;
}) {
  const values = validateObserverRuntimeConfigInput(input);

  const existing = await prisma.observerRuntimeConfig.findFirst({
    where: {
      scopeType: GLOBAL_SCOPE_TYPE,
      scopeKey: GLOBAL_SCOPE_KEY,
    },
  });

  const row = existing
    ? await prisma.observerRuntimeConfig.update({
        where: { id: existing.id },
        data: {
          heartbeatIntervalMinutes: values.heartbeatIntervalMinutes,
          fullReportIntervalHours: values.fullReportIntervalHours,
          isActive: true,
        },
      })
    : await prisma.observerRuntimeConfig.create({
        data: {
          scopeType: GLOBAL_SCOPE_TYPE,
          scopeKey: GLOBAL_SCOPE_KEY,
          heartbeatIntervalMinutes: values.heartbeatIntervalMinutes,
          fullReportIntervalHours: values.fullReportIntervalHours,
          isActive: true,
        },
      });

  return normalizeRuntimeConfig(row);
}

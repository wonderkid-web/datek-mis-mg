import { prisma } from "@/lib/prisma";
import { unstable_noStore as noStore } from "next/cache";
type RegisterPayload = {
  device_id: string;
  hostname: string;
  username?: string;
  agent_version?: string;
  os_name?: string;
};

type HeartbeatPayload = {
  device_id: string;
  hostname?: string;
  agent_version?: string;
  timestamp?: string;
};

type ReportPayload = {
  device_id: string;
  hostname: string;
  username?: string;
  ip_address?: string;
  os?: {
    name?: string;
    version?: string;
    build?: string;
  };
  hardware?: {
    cpu?: string;
    ram_gb?: number;
    manufacturer?: string;
    model?: string;
    serial_number?: string;
    gpu?: string;
    motherboard?: string;
  };
  storage?: Array<{
    drive?: string;
    total_gb?: number;
    free_gb?: number;
    free_percent?: number;
  }>;
  storage_health?: Array<{
    device_id?: string;
    device_name?: string;
    serial_number?: string;
    model?: string;
    media_type?: string;
    bus_type?: string;
    firmware_version?: string;
    health_status?: string;
    operational_status?: string;
    predicted_failure?: boolean;
    temperature_c?: number;
    temperature_f?: number;
    power_on_hours?: number | null;
    wear_level_percent?: number | null;
    available_spare_percent?: number | null;
    read_errors?: number | null;
    write_errors?: number | null;
    collected_at?: string;
  }>;
  installed_apps?: Array<{
    name?: string;
    version?: string;
    publisher?: string;
    install_date?: string;
  }>;
  agent_version?: string;
  collected_at?: string;
  logs?: Array<{
    event_type?: string;
    message?: string;
    log_level?: string;
    created_at?: string;
  }>;
};

function safeDate(value: unknown): Date | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
}

function driveStatusFromFreePercent(freePercent: number | null | undefined) {
  if (freePercent === null || freePercent === undefined) return null;
  if (!Number.isFinite(freePercent)) return null;
  if (freePercent < 10) return "CRITICAL";
  if (freePercent < 15) return "WARNING";
  return "OK";
}

export async function upsertDeviceFromRegister(payload: RegisterPayload) {
  const now = new Date();

  const device = await prisma.observerDevice.upsert({
    where: { deviceId: payload.device_id },
    create: {
      deviceId: payload.device_id,
      hostname: payload.hostname,
      username: payload.username ?? null,
      osName: payload.os_name ?? null,
      agentVersion: payload.agent_version ?? null,
      lastSeen: now,
      lastReportAt: null,
    },
    update: {
      hostname: payload.hostname,
      username: payload.username ?? undefined,
      osName: payload.os_name ?? undefined,
      agentVersion: payload.agent_version ?? undefined,
      lastSeen: now,
    },
  });

  await prisma.observerSyncHistory.create({
    data: {
      deviceRefId: device.id,
      syncKind: "register",
      collectedAt: null,
      receivedAt: now,
    },
  });

  return device;
}

export async function recordDeviceHeartbeat(payload: HeartbeatPayload) {
  const now = new Date();
  const collectedAt = safeDate(payload.timestamp) ?? now;

  const device = await prisma.observerDevice.upsert({
    where: { deviceId: payload.device_id },
    create: {
      deviceId: payload.device_id,
      hostname: payload.hostname ?? payload.device_id,
      agentVersion: payload.agent_version ?? null,
      lastSeen: collectedAt,
      lastReportAt: null,
    },
    update: {
      hostname: payload.hostname ?? undefined,
      agentVersion: payload.agent_version ?? undefined,
      lastSeen: collectedAt,
    },
  });

  await prisma.observerSyncHistory.create({
    data: {
      deviceRefId: device.id,
      syncKind: "heartbeat",
      collectedAt,
      receivedAt: now,
    },
  });

  return device;
}

export async function ingestDeviceReport(payload: ReportPayload) {
  const now = new Date();
  const collectedAt = safeDate(payload.collected_at) ?? now;

  const device = await prisma.observerDevice.upsert({
    where: { deviceId: payload.device_id },
    create: {
      deviceId: payload.device_id,
      hostname: payload.hostname,
      username: payload.username ?? null,
      ipAddress: payload.ip_address ?? null,
      osName: payload.os?.name ?? null,
      osVersion: payload.os?.version ?? null,
      osBuild: payload.os?.build ?? null,
      agentVersion: payload.agent_version ?? null,
      lastSeen: collectedAt,
      lastReportAt: collectedAt,
    },
    update: {
      hostname: payload.hostname,
      username: payload.username ?? undefined,
      ipAddress: payload.ip_address ?? undefined,
      osName: payload.os?.name ?? undefined,
      osVersion: payload.os?.version ?? undefined,
      osBuild: payload.os?.build ?? undefined,
      agentVersion: payload.agent_version ?? undefined,
      lastSeen: collectedAt,
      lastReportAt: collectedAt,
    },
  });

  await prisma.$transaction(async (tx) => {
    await tx.observerHardwareSpec.upsert({
      where: { deviceRefId: device.id },
      create: {
        deviceRefId: device.id,
        cpu: payload.hardware?.cpu ?? null,
        ramGb:
          typeof payload.hardware?.ram_gb === "number"
            ? Math.round(payload.hardware.ram_gb)
            : null,
        manufacturer: payload.hardware?.manufacturer ?? null,
        model: payload.hardware?.model ?? null,
        serialNumber: payload.hardware?.serial_number ?? null,
        gpu: payload.hardware?.gpu ?? null,
        motherboard: payload.hardware?.motherboard ?? null,
      },
      update: {
        cpu: payload.hardware?.cpu ?? undefined,
        ramGb:
          typeof payload.hardware?.ram_gb === "number"
            ? Math.round(payload.hardware.ram_gb)
            : undefined,
        manufacturer: payload.hardware?.manufacturer ?? undefined,
        model: payload.hardware?.model ?? undefined,
        serialNumber: payload.hardware?.serial_number ?? undefined,
        gpu: payload.hardware?.gpu ?? undefined,
        motherboard: payload.hardware?.motherboard ?? undefined,
      },
    });

    // Replace drives/apps each report (MVP).
    await tx.observerStorageDrive.deleteMany({
      where: { deviceRefId: device.id },
    });
    await tx.observerStorageHealth.deleteMany({
      where: { deviceRefId: device.id },
    });
    await tx.observerInstalledApp.deleteMany({
      where: { deviceRefId: device.id },
    });

    const drives = payload.storage ?? [];
    if (drives.length) {
      await tx.observerStorageDrive.createMany({
        data: drives
          .filter((d) => d && typeof d.drive === "string" && d.drive.trim())
          .map((drive) => ({
            deviceRefId: device.id,
            driveLetter: drive.drive!.trim(),
            totalGb:
              typeof drive.total_gb === "number" ? Math.round(drive.total_gb) : null,
            freeGb:
              typeof drive.free_gb === "number" ? Math.round(drive.free_gb) : null,
            freePercent:
              typeof drive.free_percent === "number"
                ? drive.free_percent
                : null,
            status: driveStatusFromFreePercent(drive.free_percent),
          })),
      });
    }

    const healthRows = payload.storage_health ?? [];
    if (healthRows.length) {
      await tx.observerStorageHealth.createMany({
        data: healthRows
          .filter((h) => h && typeof h.device_id === "string" && h.device_id.trim())
          .map((h) => ({
            deviceRefId: device.id,
            diskDeviceId: h.device_id!.trim(),
            deviceName: h.device_name ?? null,
            serialNumber: h.serial_number ?? null,
            model: h.model ?? null,
            mediaType: h.media_type ?? null,
            busType: h.bus_type ?? null,
            firmwareVersion: h.firmware_version ?? null,
            healthStatus: h.health_status ?? null,
            operationalStatus: h.operational_status ?? null,
            predictedFailure: typeof h.predicted_failure === "boolean" ? h.predicted_failure : null,
            temperatureC: typeof h.temperature_c === "number" ? h.temperature_c : null,
            temperatureF: typeof h.temperature_f === "number" ? h.temperature_f : null,
            powerOnHours: typeof h.power_on_hours === "number" ? Math.round(h.power_on_hours) : null,
            wearLevelPercent: typeof h.wear_level_percent === "number" ? h.wear_level_percent : null,
            availableSparePercent: typeof h.available_spare_percent === "number" ? h.available_spare_percent : null,
            readErrors: typeof h.read_errors === "number" ? Math.round(h.read_errors) : null,
            writeErrors: typeof h.write_errors === "number" ? Math.round(h.write_errors) : null,
            collectedAt: safeDate(h.collected_at) ?? null,
          })),
        skipDuplicates: true,
      });
    }

    const apps = payload.installed_apps ?? [];
    if (apps.length) {
      await tx.observerInstalledApp.createMany({
        data: apps
          .filter((a) => a && typeof a.name === "string" && a.name.trim())
          .map((app) => ({
            deviceRefId: device.id,
            appName: app.name!.trim(),
            appVersion: app.version ?? null,
            publisher: app.publisher ?? null,
            installDate: safeDate(app.install_date),
          })),
      });
    }

    const logs = payload.logs ?? [];
    if (logs.length) {
      await tx.observerAgentLog.createMany({
        data: logs
          .filter((l) => l && typeof l.message === "string" && l.message.trim())
          .map((log) => ({
            deviceRefId: device.id,
            eventType: (log.event_type ?? "event").slice(0, 100),
            message: log.message!.slice(0, 5000),
            logLevel: log.log_level ?? null,
            createdAt: safeDate(log.created_at) ?? now,
          })),
      });
    }

    await tx.observerSyncHistory.create({
      data: {
        deviceRefId: device.id,
        syncKind: "report",
        collectedAt,
        receivedAt: now,
      },
    });
  });

  return device;
}

export async function getObserverDeviceList() {
  noStore();

  return prisma.observerDevice.findMany({
    include: {
      hardwareSpec: true,
      storageDrives: true,
    },
    orderBy: [{ lastSeen: "desc" }, { id: "desc" }],
  });
}

export async function getObserverDeviceByDeviceId(deviceId: string) {
  noStore();

  return prisma.observerDevice.findUnique({
    where: { deviceId },
    include: {
      hardwareSpec: true,
      storageDrives: true,
      storageHealth: {
        orderBy: [{ predictedFailure: "desc" }, { temperatureC: "desc" }, { id: "desc" }],
      },
      installedApps: true,
      agentLogs: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      syncHistory: {
        orderBy: { receivedAt: "desc" },
        take: 50,
      },
    },
  });
}

export async function getObserverSoftwareInventory() {
  noStore();

  const apps = await prisma.observerInstalledApp.findMany({
    select: {
      appName: true,
      appVersion: true,
      publisher: true,
      deviceRefId: true,
    },
  });

  const map = new Map<string, { appName: string; appVersion: string | null; publisher: string | null; devices: Set<number> }>();
  for (const app of apps) {
    const key = `${app.appName}|||${app.appVersion ?? ""}|||${app.publisher ?? ""}`;
    const existing = map.get(key);
    if (existing) {
      existing.devices.add(app.deviceRefId);
    } else {
      map.set(key, {
        appName: app.appName,
        appVersion: app.appVersion,
        publisher: app.publisher,
        devices: new Set([app.deviceRefId]),
      });
    }
  }

  return Array.from(map.values())
    .map((item) => ({
      appName: item.appName,
      appVersion: item.appVersion,
      publisher: item.publisher,
      deviceCount: item.devices.size,
    }))
    .sort((a, b) => b.deviceCount - a.deviceCount || a.appName.localeCompare(b.appName));
}

export async function deleteObserverDeviceByDeviceId(deviceId: string) {
  return prisma.observerDevice.delete({
    where: { deviceId },
  });
}

export function computeObserverDeviceStatus(input: {
  lastSeen: Date | null;
  lastReportAt: Date | null;
  ramGb: number | null | undefined;
  drives: Array<{ freePercent: number | null; status: string | null }>;
}) {
  const now = Date.now();
  const lastSeenMs = input.lastSeen ? input.lastSeen.getTime() : null;
  const lastReportMs = input.lastReportAt ? input.lastReportAt.getTime() : null;

  const minutesSinceSeen = lastSeenMs ? (now - lastSeenMs) / 60000 : null;
  const hoursSinceSeen = lastSeenMs ? (now - lastSeenMs) / 3600000 : null;
  const daysSinceReport = lastReportMs ? (now - lastReportMs) / 86400000 : null;

  const online = minutesSinceSeen !== null && minutesSinceSeen <= 15;
  const offline = hoursSinceSeen !== null && hoursSinceSeen > 24;
  const stale = daysSinceReport !== null && daysSinceReport > 7;

  const diskCritical = input.drives.some((d) => d.status === "CRITICAL" || (typeof d.freePercent === "number" && d.freePercent < 10));
  const diskWarning = input.drives.some((d) => d.status === "WARNING" || (typeof d.freePercent === "number" && d.freePercent < 15));

  const ramBelowStandard = typeof input.ramGb === "number" && input.ramGb < 8;

  return {
    online,
    offline,
    stale,
    diskCritical,
    diskWarning,
    ramBelowStandard,
  };
}

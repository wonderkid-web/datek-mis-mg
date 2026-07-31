import { randomBytes } from "crypto";
import { unstable_noStore as noStore } from "next/cache";

import { prisma } from "@/lib/prisma";

export const OBSERVER_AGENT_COMMAND_TYPES = {
  sendFullReportNow: "send_full_report_now",
  runScreenshotToolNow: "run_screenshot_tool_now",
} as const;

export const OBSERVER_AGENT_COMMAND_STATUS = {
  pending: "pending",
  delivered: "delivered",
  completed: "completed",
  expired: "expired",
  cancelled: "cancelled",
} as const;

const TARGET_SCOPE_ALL = "all";
const TARGET_SCOPE_DEVICE = "device";
const COMMAND_TTL_MS = 30 * 60 * 1000;
const DUPLICATE_WINDOW_MS = 2 * 60 * 1000;
const ACTIVE_DEVICE_WINDOW_MS = 24 * 60 * 60 * 1000;

type Requester = {
  name?: string | null;
  email?: string | null;
};

type ObserverAgentCommandType =
  (typeof OBSERVER_AGENT_COMMAND_TYPES)[keyof typeof OBSERVER_AGENT_COMMAND_TYPES];

export class ObserverAgentCommandError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ObserverAgentCommandError";
  }
}

function stampDate(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return [
    date.getUTCFullYear(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate()),
    "_",
    pad(date.getUTCHours()),
    pad(date.getUTCMinutes()),
    pad(date.getUTCSeconds()),
  ].join("");
}

function commandId(prefix: "cmd" | "batch", date: Date) {
  return `${prefix}_${stampDate(date)}_${randomBytes(3).toString("hex")}`;
}

function requesterLabel(requester: Requester) {
  return requester.name?.trim() || requester.email?.trim() || "Unknown";
}

async function expireStaleCommands(now = new Date()) {
  await prisma.observerAgentCommand.updateMany({
    where: {
      status: {
        in: [
          OBSERVER_AGENT_COMMAND_STATUS.pending,
          OBSERVER_AGENT_COMMAND_STATUS.delivered,
        ],
      },
      expiresAt: {
        lte: now,
      },
    },
    data: {
      status: OBSERVER_AGENT_COMMAND_STATUS.expired,
    },
  });
}

async function getRecentlyRequestedDeviceIds(input: {
  commandType: ObserverAgentCommandType;
  deviceIds: string[];
  targetScope: string;
  now: Date;
}) {
  if (!input.deviceIds.length) return new Set<string>();

  const duplicateSince = new Date(input.now.getTime() - DUPLICATE_WINDOW_MS);
  const rows = await prisma.observerAgentCommand.findMany({
    where: {
      commandType: input.commandType,
      targetScope: input.targetScope,
      targetDeviceId: {
        in: input.deviceIds,
      },
      requestedAt: {
        gte: duplicateSince,
      },
      expiresAt: {
        gt: input.now,
      },
      status: {
        in: [
          OBSERVER_AGENT_COMMAND_STATUS.pending,
          OBSERVER_AGENT_COMMAND_STATUS.delivered,
        ],
      },
    },
    select: {
      targetDeviceId: true,
    },
  });

  return new Set(
    rows
      .map((row) => row.targetDeviceId)
      .filter((deviceId): deviceId is string => Boolean(deviceId))
  );
}

async function createCommandForDevice(input: {
  commandType: ObserverAgentCommandType;
  duplicateMessage: string;
  deviceId: string;
  requester: Requester;
}) {
  const now = new Date();
  await expireStaleCommands(now);

  const device = await prisma.observerDevice.findUnique({
    where: { deviceId: input.deviceId },
    select: { deviceId: true },
  });

  if (!device) {
    throw new ObserverAgentCommandError("Device tidak ditemukan.");
  }

  const duplicates = await getRecentlyRequestedDeviceIds({
    commandType: input.commandType,
    deviceIds: [device.deviceId],
    targetScope: TARGET_SCOPE_DEVICE,
    now,
  });

  if (duplicates.has(device.deviceId)) {
    throw new ObserverAgentCommandError(input.duplicateMessage);
  }

  const command = await prisma.observerAgentCommand.create({
    data: {
      id: commandId("cmd", now),
      commandType: input.commandType,
      targetScope: TARGET_SCOPE_DEVICE,
      targetDeviceId: device.deviceId,
      requestedBy: requesterLabel(input.requester),
      requestedByEmail: input.requester.email?.trim() || null,
      requestedAt: now,
      expiresAt: new Date(now.getTime() + COMMAND_TTL_MS),
      status: OBSERVER_AGENT_COMMAND_STATUS.pending,
    },
  });

  return {
    createdCount: 1,
    duplicateCount: 0,
    batchId: command.batchId,
    expiresAt: command.expiresAt,
  };
}

async function createCommandsForActiveDevices(input: {
  commandType: ObserverAgentCommandType;
  duplicateMessage: string;
  requester: Requester;
}) {
  const now = new Date();
  await expireStaleCommands(now);

  const activeSince = new Date(now.getTime() - ACTIVE_DEVICE_WINDOW_MS);
  const devices = await prisma.observerDevice.findMany({
    where: {
      lastSeen: {
        gte: activeSince,
      },
    },
    select: {
      deviceId: true,
    },
    orderBy: [{ lastSeen: "desc" }, { id: "desc" }],
  });

  if (!devices.length) {
    throw new ObserverAgentCommandError(
      "Tidak ada agent aktif dalam 24 jam terakhir."
    );
  }

  const deviceIds = devices.map((device) => device.deviceId);
  const duplicateIds = await getRecentlyRequestedDeviceIds({
    commandType: input.commandType,
    deviceIds,
    targetScope: TARGET_SCOPE_ALL,
    now,
  });
  const targetDeviceIds = deviceIds.filter((deviceId) => !duplicateIds.has(deviceId));

  if (!targetDeviceIds.length) {
    throw new ObserverAgentCommandError(input.duplicateMessage);
  }

  const batchId = commandId("batch", now);
  const expiresAt = new Date(now.getTime() + COMMAND_TTL_MS);

  await prisma.observerAgentCommand.createMany({
    data: targetDeviceIds.map((deviceId) => ({
      id: commandId("cmd", now),
      commandType: input.commandType,
      targetScope: TARGET_SCOPE_ALL,
      targetDeviceId: deviceId,
      requestedBy: requesterLabel(input.requester),
      requestedByEmail: input.requester.email?.trim() || null,
      requestedAt: now,
      expiresAt,
      status: OBSERVER_AGENT_COMMAND_STATUS.pending,
      batchId,
    })),
  });

  return {
    createdCount: targetDeviceIds.length,
    duplicateCount: duplicateIds.size,
    batchId,
    expiresAt,
  };
}

export async function createSendFullReportCommandForDevice(input: {
  deviceId: string;
  requester: Requester;
}) {
  return createCommandForDevice({
    ...input,
    commandType: OBSERVER_AGENT_COMMAND_TYPES.sendFullReportNow,
    duplicateMessage: "Command full report untuk device ini baru saja dibuat.",
  });
}

export async function createSendFullReportCommandsForActiveDevices(input: {
  requester: Requester;
}) {
  return createCommandsForActiveDevices({
    ...input,
    commandType: OBSERVER_AGENT_COMMAND_TYPES.sendFullReportNow,
    duplicateMessage:
      "Command global full report baru saja dibuat untuk semua agent aktif.",
  });
}

export async function createRunScreenshotToolCommandForDevice(input: {
  deviceId: string;
  requester: Requester;
}) {
  return createCommandForDevice({
    ...input,
    commandType: OBSERVER_AGENT_COMMAND_TYPES.runScreenshotToolNow,
    duplicateMessage:
      "Command screenshot untuk device ini baru saja dibuat.",
  });
}

export async function createRunScreenshotToolCommandsForActiveDevices(input: {
  requester: Requester;
}) {
  return createCommandsForActiveDevices({
    ...input,
    commandType: OBSERVER_AGENT_COMMAND_TYPES.runScreenshotToolNow,
    duplicateMessage:
      "Command global screenshot baru saja dibuat untuk semua agent aktif.",
  });
}

export async function getPendingCommandsForHeartbeat(input: {
  deviceId: string;
}) {
  const now = new Date();
  await expireStaleCommands(now);

  const commands = await prisma.observerAgentCommand.findMany({
    where: {
      commandType: {
        in: Object.values(OBSERVER_AGENT_COMMAND_TYPES),
      },
      targetDeviceId: input.deviceId,
      status: OBSERVER_AGENT_COMMAND_STATUS.pending,
      expiresAt: {
        gt: now,
      },
    },
    orderBy: [{ requestedAt: "asc" }, { id: "asc" }],
    take: 10,
  });

  if (!commands.length) return [];

  const deliveredAt = new Date();
  await prisma.observerAgentCommand.updateMany({
    where: {
      id: {
        in: commands.map((command) => command.id),
      },
      status: OBSERVER_AGENT_COMMAND_STATUS.pending,
    },
    data: {
      status: OBSERVER_AGENT_COMMAND_STATUS.delivered,
      deliveredAt,
      deliveryCount: {
        increment: 1,
      },
    },
  });

  return commands.map((command) => ({
    id: command.id,
    type: command.commandType,
    requested_at: command.requestedAt.toISOString(),
    expires_at: command.expiresAt.toISOString(),
  }));
}

async function completeCommandsForDevice(input: {
  commandType: ObserverAgentCommandType;
  deviceId: string;
  collectedAt: Date;
}) {
  const now = new Date();
  await expireStaleCommands(now);

  await prisma.observerAgentCommand.updateMany({
    where: {
      commandType: input.commandType,
      targetDeviceId: input.deviceId,
      status: {
        in: [
          OBSERVER_AGENT_COMMAND_STATUS.pending,
          OBSERVER_AGENT_COMMAND_STATUS.delivered,
        ],
      },
      requestedAt: {
        lte: input.collectedAt,
      },
      expiresAt: {
        gte: input.collectedAt,
      },
    },
    data: {
      status: OBSERVER_AGENT_COMMAND_STATUS.completed,
      completedAt: now,
    },
  });
}

export async function completeSendFullReportCommandsForDevice(input: {
  deviceId: string;
  collectedAt: Date;
}) {
  await completeCommandsForDevice({
    ...input,
    commandType: OBSERVER_AGENT_COMMAND_TYPES.sendFullReportNow,
  });
}

export async function completeRunScreenshotToolCommandsForDevice(input: {
  deviceId: string;
  collectedAt: Date;
}) {
  await completeCommandsForDevice({
    ...input,
    commandType: OBSERVER_AGENT_COMMAND_TYPES.runScreenshotToolNow,
  });
}

export async function listObserverAgentCommands(limit = 30) {
  noStore();
  await expireStaleCommands();

  return prisma.observerAgentCommand.findMany({
    take: limit,
    orderBy: [{ requestedAt: "desc" }, { id: "desc" }],
  });
}

export async function listObserverAgentCommandsForDevice(
  deviceId: string,
  limit = 12
) {
  noStore();
  await expireStaleCommands();

  return prisma.observerAgentCommand.findMany({
    where: {
      targetDeviceId: deviceId,
    },
    take: limit,
    orderBy: [{ requestedAt: "desc" }, { id: "desc" }],
  });
}

import { NextRequest, NextResponse } from "next/server";

import {
  assertObject,
  badRequestResponse,
  getRequestIp,
  logAgentRequest,
  normalizeNumber,
  normalizeString,
  unauthorizedResponse,
  validateAgentToken,
} from "@/app/api/agent/_shared";
import {
  OBSERVER_AGENT_SCREENSHOT_MAX_BYTES,
  ObserverAgentScreenshotError,
  saveObserverAgentScreenshot,
  type ObserverAgentGpuReading,
} from "@/lib/observerAgentScreenshotStorage";
import { completeRunScreenshotToolCommandsForDevice } from "@/lib/observerAgentCommandService";

const MAX_REQUEST_BYTES = OBSERVER_AGENT_SCREENSHOT_MAX_BYTES + 1024 * 1024;

export type MonitoringUpload = {
  buffer: Buffer | null;
  originalName: string | null;
  deviceId: string | null;
  hostname: string | null;
  source: string | null;
  commandId: string | null;
  capturedAt: string | null;
  cpuTemperatureC: number | null;
  cpuLoadPercent: number | null;
  fanRpm: number | null;
  memoryAvailableGb: number | null;
  memoryLoadPercent: number | null;
  batteryChargePercent: number | null;
  batteryRemainingCapacity: number | null;
  gpu: ObserverAgentGpuReading[];
  /** Nama + isi field mentah yang benar-benar diterima, untuk diagnosa. */
  rawFields: Record<string, string>;
  /** Isi field `file` kalau ternyata JSON payload, bukan gambar. */
  filePayload: Record<string, unknown> | null;
};

const FIELD_ALIASES = {
  deviceId: ["device_id", "deviceId"],
  hostname: ["hostname", "host_name", "hostName"],
  source: ["source", "app", "app_name", "appName"],
  commandId: ["command_id", "commandId"],
  capturedAt: ["captured_at", "capturedAt", "timestamp"],
  cpuTemperature: [
    "cpu_temperature",
    "cpuTemperature",
    "cpu_temp",
    "cpuTemp",
    "cpu_temperature_c",
    "cpuTemperatureC",
  ],
  cpuLoad: ["cpu_load", "cpuLoad", "cpu_load_percent", "cpuLoadPercent"],
  fanSpeed: ["fan_speed", "fanSpeed", "fan_rpm", "fanRpm"],
  memoryAvailableGb: [
    "memory_available_gb",
    "memoryAvailableGb",
    "ram_available_gb",
  ],
  memoryLoadPercent: [
    "memory_load_percent",
    "memoryLoadPercent",
    "ram_load_percent",
  ],
  batteryChargePercent: [
    "battery_charge_percent",
    "batteryChargePercent",
    "battery_percent",
  ],
  batteryRemainingCapacity: [
    "battery_remaining_capacity",
    "batteryRemainingCapacity",
  ],
  gpu: ["gpu", "gpus", "gpu_json"],
  fileName: ["file_name", "fileName", "filename"],
} as const;

/**
 * Agent mengirim "" untuk sensor yang tidak tersedia di device tersebut.
 * Itu kondisi normal, jadi diperlakukan sebagai null, bukan error.
 */
function toNullableNumber(value: unknown) {
  if (typeof value === "string" && !value.trim()) return null;
  return normalizeNumber(value);
}

function parseGpuField(value: unknown): ObserverAgentGpuReading[] {
  if (Array.isArray(value)) return normalizeGpuArray(value);

  const raw = normalizeString(value);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? normalizeGpuArray(parsed) : [];
  } catch {
    return [];
  }
}

function normalizeGpuArray(value: unknown[]): ObserverAgentGpuReading[] {
  return value
    .filter((entry): entry is Record<string, unknown> => assertObject(entry))
    .map((entry) => ({
      name: normalizeString(entry.name),
      temperature: toNullableNumber(entry.temperature),
      load: toNullableNumber(entry.load),
    }));
}

function pickFormString(formData: FormData, keys: readonly string[]) {
  for (const key of keys) {
    const value = formData.get(key);
    if (typeof value !== "string") continue;
    const normalized = normalizeString(value);
    if (normalized) return normalized;
  }
  return null;
}

function pickFormNumber(formData: FormData, keys: readonly string[]) {
  for (const key of keys) {
    const value = formData.get(key);
    if (typeof value !== "string") continue;
    const normalized = toNullableNumber(value);
    if (normalized !== null) return normalized;
  }
  return null;
}

function pickString(obj: Record<string, unknown>, keys: readonly string[]) {
  for (const key of keys) {
    const value = normalizeString(obj[key]);
    if (value) return value;
  }
  return null;
}

function pickNumber(obj: Record<string, unknown>, keys: readonly string[]) {
  for (const key of keys) {
    const value = toNullableNumber(obj[key]);
    if (value !== null) return value;
  }
  return null;
}

function pickHeaderString(req: NextRequest, keys: readonly string[]) {
  for (const key of keys) {
    const value = normalizeString(req.headers.get(key));
    if (value) return value;
  }
  return null;
}

function pickFormFile(formData: FormData) {
  for (const key of ["image", "file", "screenshot", "payload"]) {
    const value = formData.get(key);
    if (value instanceof File) return value;
  }
  return null;
}

function rejectLargeRequest(req: NextRequest) {
  const rawLength = req.headers.get("content-length");
  if (!rawLength) return null;

  const contentLength = Number(rawLength);
  if (!Number.isFinite(contentLength) || contentLength <= MAX_REQUEST_BYTES) {
    return null;
  }

  return NextResponse.json(
    {
      success: false,
      error: "Ukuran request melebihi batas upload 15 MB.",
    },
    { status: 413 }
  );
}

async function parseMultipartUpload(req: NextRequest): Promise<MonitoringUpload> {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    throw new ObserverAgentScreenshotError("Invalid multipart form data.");
  }

  const file = pickFormFile(formData);
  if (file && file.size > OBSERVER_AGENT_SCREENSHOT_MAX_BYTES) {
    throw new ObserverAgentScreenshotError("Ukuran file melebihi batas 15 MB.", 413);
  }

  const rawFields: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    rawFields[key] =
      typeof value === "string"
        ? value.length > 300
          ? `${value.slice(0, 300)}…`
          : value
        : `<file ${value.name} ${value.size}B>`;
  }

  const buffer = file ? Buffer.from(await file.arrayBuffer()) : null;
  const filePayload = readJsonPayload(buffer);

  const parsed: MonitoringUpload = {
    rawFields,
    filePayload,
    buffer,
    originalName: file?.name || null,
    deviceId: pickFormString(formData, FIELD_ALIASES.deviceId),
    hostname: pickFormString(formData, FIELD_ALIASES.hostname),
    source: pickFormString(formData, FIELD_ALIASES.source),
    commandId: pickFormString(formData, FIELD_ALIASES.commandId),
    capturedAt: pickFormString(formData, FIELD_ALIASES.capturedAt),
    cpuTemperatureC: pickFormNumber(formData, FIELD_ALIASES.cpuTemperature),
    cpuLoadPercent: pickFormNumber(formData, FIELD_ALIASES.cpuLoad),
    fanRpm: pickFormNumber(formData, FIELD_ALIASES.fanSpeed),
    memoryAvailableGb: pickFormNumber(formData, FIELD_ALIASES.memoryAvailableGb),
    memoryLoadPercent: pickFormNumber(formData, FIELD_ALIASES.memoryLoadPercent),
    batteryChargePercent: pickFormNumber(
      formData,
      FIELD_ALIASES.batteryChargePercent
    ),
    batteryRemainingCapacity: pickFormNumber(
      formData,
      FIELD_ALIASES.batteryRemainingCapacity
    ),
    gpu: parseGpuField(pickFormString(formData, FIELD_ALIASES.gpu)),
  };

  return applyPayloadFallback(parsed);
}

/**
 * Agent menyertakan salinan JSON lengkap di field `file`. Kalau field top-level
 * ternyata kosong (nama field beda, atau agent hanya mengisi salinan JSON-nya),
 * ambil nilainya dari sana supaya data tidak hilang percuma.
 */
function applyPayloadFallback(upload: MonitoringUpload): MonitoringUpload {
  const payload = upload.filePayload;
  if (!payload) return upload;

  return {
    ...upload,
    deviceId: upload.deviceId ?? pickString(payload, FIELD_ALIASES.deviceId),
    hostname: upload.hostname ?? pickString(payload, FIELD_ALIASES.hostname),
    source: upload.source ?? pickString(payload, FIELD_ALIASES.source),
    commandId: upload.commandId ?? pickString(payload, FIELD_ALIASES.commandId),
    capturedAt: upload.capturedAt ?? pickString(payload, FIELD_ALIASES.capturedAt),
    cpuTemperatureC:
      upload.cpuTemperatureC ?? pickNumber(payload, FIELD_ALIASES.cpuTemperature),
    cpuLoadPercent:
      upload.cpuLoadPercent ?? pickNumber(payload, FIELD_ALIASES.cpuLoad),
    fanRpm: upload.fanRpm ?? pickNumber(payload, FIELD_ALIASES.fanSpeed),
    memoryAvailableGb:
      upload.memoryAvailableGb ??
      pickNumber(payload, FIELD_ALIASES.memoryAvailableGb),
    memoryLoadPercent:
      upload.memoryLoadPercent ??
      pickNumber(payload, FIELD_ALIASES.memoryLoadPercent),
    batteryChargePercent:
      upload.batteryChargePercent ??
      pickNumber(payload, FIELD_ALIASES.batteryChargePercent),
    batteryRemainingCapacity:
      upload.batteryRemainingCapacity ??
      pickNumber(payload, FIELD_ALIASES.batteryRemainingCapacity),
    gpu: upload.gpu.length
      ? upload.gpu
      : parseGpuField(payload.gpu ?? payload.gpus),
  };
}

function readJsonPayload(buffer: Buffer | null): Record<string, unknown> | null {
  if (!buffer || !buffer.length || buffer.length > 512 * 1024) return null;

  try {
    const parsed = JSON.parse(buffer.toString("utf8"));
    return assertObject(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

async function parseJsonUpload(req: NextRequest): Promise<MonitoringUpload> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ObserverAgentScreenshotError("Invalid JSON body.");
  }

  if (!assertObject(body)) {
    throw new ObserverAgentScreenshotError("Invalid JSON body.");
  }

  const imageBase64 = pickString(body, [
    "image_base64",
    "imageBase64",
    "screenshot_base64",
    "screenshotBase64",
  ]);

  return {
    rawFields: Object.fromEntries(
      Object.entries(body).map(([key, value]) => [key, String(value).slice(0, 300)])
    ),
    filePayload: null,
    buffer: imageBase64 ? decodeBase64Image(imageBase64) : null,
    originalName: pickString(body, FIELD_ALIASES.fileName),
    deviceId: pickString(body, FIELD_ALIASES.deviceId),
    hostname: pickString(body, FIELD_ALIASES.hostname),
    source: pickString(body, FIELD_ALIASES.source),
    commandId: pickString(body, FIELD_ALIASES.commandId),
    capturedAt: pickString(body, FIELD_ALIASES.capturedAt),
    cpuTemperatureC: pickNumber(body, FIELD_ALIASES.cpuTemperature),
    cpuLoadPercent: pickNumber(body, FIELD_ALIASES.cpuLoad),
    fanRpm: pickNumber(body, FIELD_ALIASES.fanSpeed),
    memoryAvailableGb: pickNumber(body, FIELD_ALIASES.memoryAvailableGb),
    memoryLoadPercent: pickNumber(body, FIELD_ALIASES.memoryLoadPercent),
    batteryChargePercent: pickNumber(body, FIELD_ALIASES.batteryChargePercent),
    batteryRemainingCapacity: pickNumber(
      body,
      FIELD_ALIASES.batteryRemainingCapacity
    ),
    gpu: parseGpuField(body.gpu ?? body.gpus),
  };
}

async function parseRawImageUpload(req: NextRequest): Promise<MonitoringUpload> {
  return {
    rawFields: {},
    filePayload: null,
    buffer: Buffer.from(await req.arrayBuffer()),
    originalName: pickHeaderString(req, ["x-file-name", "x-filename"]),
    deviceId: pickHeaderString(req, ["x-device-id"]),
    hostname: pickHeaderString(req, ["x-hostname", "x-host-name"]),
    source: pickHeaderString(req, ["x-source", "x-app-name"]),
    commandId: pickHeaderString(req, ["x-command-id"]),
    capturedAt: pickHeaderString(req, ["x-captured-at", "x-timestamp"]),
    cpuTemperatureC: toNullableNumber(req.headers.get("x-cpu-temperature")),
    cpuLoadPercent: toNullableNumber(req.headers.get("x-cpu-load")),
    fanRpm: toNullableNumber(req.headers.get("x-fan-speed")),
    memoryAvailableGb: null,
    memoryLoadPercent: null,
    batteryChargePercent: null,
    batteryRemainingCapacity: null,
    gpu: [],
  };
}

function decodeBase64Image(value: string) {
  const trimmed = value.trim();
  const base64 = trimmed.includes(",") ? trimmed.split(",").pop() ?? "" : trimmed;
  return Buffer.from(base64.replace(/\s/g, ""), "base64");
}

async function parseUpload(req: NextRequest) {
  const contentType = req.headers.get("content-type")?.toLowerCase() ?? "";

  if (contentType.includes("multipart/form-data")) {
    return parseMultipartUpload(req);
  }

  if (contentType.startsWith("image/")) {
    return parseRawImageUpload(req);
  }

  if (contentType.includes("application/json")) {
    return parseJsonUpload(req);
  }

  throw new ObserverAgentScreenshotError(
    "Content-Type tidak didukung. Gunakan multipart/form-data atau application/json."
  );
}

function safeDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Intake bersama untuk POST /api/agent/monitoring dan alias lamanya
 * POST /api/agent/screenshots (dipakai agent < 0.1.14 yang belum auto-update).
 */
export async function handleMonitoringIntake(req: NextRequest, endpoint: string) {
  const auth = validateAgentToken(req);
  const contentType = req.headers.get("content-type") ?? null;
  const contentLength = req.headers.get("content-length") ?? null;

  if (!auth.expectedTokenPresent) {
    logAgentRequest({
      endpoint,
      req,
      tokenOk: auth.ok,
      payload: { content_type: contentType, content_length: contentLength },
    });
    return unauthorizedResponse({
      message: "Server misconfigured: OBSERVER_AGENT_TOKEN is not set",
    });
  }

  if (!auth.ok) {
    logAgentRequest({
      endpoint,
      req,
      tokenOk: auth.ok,
      payload: { content_type: contentType, content_length: contentLength },
    });
    return unauthorizedResponse();
  }

  const largeRequestResponse = rejectLargeRequest(req);
  if (largeRequestResponse) return largeRequestResponse;

  let upload: MonitoringUpload;
  try {
    upload = await parseUpload(req);
  } catch (error) {
    const status =
      error instanceof ObserverAgentScreenshotError ? error.status : 400;
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Gagal membaca payload monitoring.";
    logAgentRequest({
      endpoint,
      req,
      tokenOk: auth.ok,
      payload: {
        parse_error: message,
        content_type: contentType,
        content_length: contentLength,
      },
    });
    return NextResponse.json({ success: false, error: message }, { status });
  }

  logAgentRequest({
    endpoint,
    req,
    tokenOk: auth.ok,
    payload: {
      content_type: contentType,
      content_length: contentLength,
      device_id: upload.deviceId,
      hostname: upload.hostname,
      source: upload.source,
      command_id: upload.commandId,
      captured_at: upload.capturedAt,
      cpu_temperature: upload.cpuTemperatureC,
      cpu_load: upload.cpuLoadPercent,
      fan_speed: upload.fanRpm,
      memory_available_gb: upload.memoryAvailableGb,
      memory_load_percent: upload.memoryLoadPercent,
      battery_charge_percent: upload.batteryChargePercent,
      battery_remaining_capacity: upload.batteryRemainingCapacity,
      gpu_count: upload.gpu.length,
      file_bytes: upload.buffer?.length ?? 0,
      // Field mentah apa adanya: kalau angka sensor kosong, di sinilah kelihatan
      // apakah agent memang mengirim "" atau memakai nama field yang berbeda.
      raw_fields: upload.rawFields,
      file_payload: upload.filePayload,
    },
  });

  // device_id dan hostname adalah identitas record; sisanya boleh kosong
  // karena sensor tidak selalu tersedia di setiap device.
  const missingFields: string[] = [];
  if (!upload.deviceId) missingFields.push("device_id");
  if (!upload.hostname) missingFields.push("hostname");

  if (missingFields.length) {
    return badRequestResponse(
      `Field wajib belum lengkap: ${missingFields.join(", ")}.`
    );
  }

  try {
    const record = await saveObserverAgentScreenshot({
      ...upload,
      requestIp: getRequestIp(req),
      userAgent: req.headers.get("user-agent"),
    });

    await completeRunScreenshotToolCommandsForDevice({
      deviceId: upload.deviceId!,
      collectedAt:
        safeDate(upload.capturedAt) ??
        safeDate(record.uploadedAt) ??
        new Date(),
    }).catch((error) => {
      console.error("Failed to complete observer monitoring commands:", error);
    });

    return NextResponse.json(
      {
        success: true,
        message: "Monitoring data accepted",
        monitoring: record,
      },
      { status: 201 }
    );
  } catch (error) {
    const status =
      error instanceof ObserverAgentScreenshotError ? error.status : 500;
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Gagal menyimpan data monitoring.";

    if (status >= 500) {
      console.error("OBSERVER AGENT MONITORING SAVE ERROR:", error);
    }

    if (status === 400) {
      return badRequestResponse(message);
    }

    return NextResponse.json({ success: false, error: message }, { status });
  }
}

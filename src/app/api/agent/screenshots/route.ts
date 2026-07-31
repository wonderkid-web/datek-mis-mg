import { NextRequest, NextResponse } from "next/server";

import {
  assertObject,
  badRequestResponse,
  getRequestIp,
  logAgentRequest,
  normalizeString,
  unauthorizedResponse,
  validateAgentToken,
} from "@/app/api/agent/_shared";
import {
  OBSERVER_AGENT_SCREENSHOT_MAX_BYTES,
  ObserverAgentScreenshotError,
  saveObserverAgentScreenshot,
} from "@/lib/observerAgentScreenshotStorage";
import { completeRunScreenshotToolCommandsForDevice } from "@/lib/observerAgentCommandService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_REQUEST_BYTES = OBSERVER_AGENT_SCREENSHOT_MAX_BYTES + 1024 * 1024;

type ScreenshotUpload = {
  buffer: Buffer;
  originalName: string | null;
  deviceId: string | null;
  hostname: string | null;
  source: string | null;
  capturedAt: string | null;
};

function pickString(obj: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = normalizeString(obj[key]);
    if (value) return value;
  }
  return null;
}

function pickFormString(formData: FormData, keys: string[]) {
  for (const key of keys) {
    const value = formData.get(key);
    if (typeof value !== "string") continue;
    const normalized = normalizeString(value);
    if (normalized) return normalized;
  }
  return null;
}

function pickHeaderString(req: NextRequest, keys: string[]) {
  for (const key of keys) {
    const value = normalizeString(req.headers.get(key));
    if (value) return value;
  }
  return null;
}

function pickFormFile(formData: FormData) {
  for (const key of ["image", "file", "screenshot"]) {
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
      error: "Ukuran request melebihi batas upload screenshot 15 MB.",
    },
    { status: 413 }
  );
}

async function parseMultipartUpload(req: NextRequest): Promise<ScreenshotUpload> {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    throw new ObserverAgentScreenshotError("Invalid multipart form data.");
  }

  const file = pickFormFile(formData);
  if (!file) {
    throw new ObserverAgentScreenshotError(
      "Field image wajib dikirim. Gunakan nama field image, file, atau screenshot."
    );
  }

  if (file.size > OBSERVER_AGENT_SCREENSHOT_MAX_BYTES) {
    throw new ObserverAgentScreenshotError(
      "Ukuran image melebihi batas 15 MB.",
      413
    );
  }

  return {
    buffer: Buffer.from(await file.arrayBuffer()),
    originalName: file.name || null,
    deviceId: pickFormString(formData, ["device_id", "deviceId"]),
    hostname: pickFormString(formData, ["hostname", "host_name", "hostName"]),
    source: pickFormString(formData, ["source", "app", "app_name", "appName"]),
    capturedAt: pickFormString(formData, [
      "captured_at",
      "capturedAt",
      "timestamp",
    ]),
  };
}

async function parseRawImageUpload(req: NextRequest): Promise<ScreenshotUpload> {
  return {
    buffer: Buffer.from(await req.arrayBuffer()),
    originalName: pickHeaderString(req, ["x-file-name", "x-filename"]),
    deviceId: pickHeaderString(req, ["x-device-id"]),
    hostname: pickHeaderString(req, ["x-hostname", "x-host-name"]),
    source: pickHeaderString(req, ["x-source", "x-app-name"]),
    capturedAt: pickHeaderString(req, ["x-captured-at", "x-timestamp"]),
  };
}

function decodeBase64Image(value: string) {
  const trimmed = value.trim();
  const base64 = trimmed.includes(",") ? trimmed.split(",").pop() ?? "" : trimmed;
  return Buffer.from(base64.replace(/\s/g, ""), "base64");
}

function safeDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function parseJsonUpload(req: NextRequest): Promise<ScreenshotUpload> {
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
    "image",
  ]);

  if (!imageBase64) {
    throw new ObserverAgentScreenshotError(
      "JSON body wajib berisi image_base64 atau screenshot_base64."
    );
  }

  return {
    buffer: decodeBase64Image(imageBase64),
    originalName: pickString(body, ["file_name", "fileName", "filename"]),
    deviceId: pickString(body, ["device_id", "deviceId"]),
    hostname: pickString(body, ["hostname", "host_name", "hostName"]),
    source: pickString(body, ["source", "app", "app_name", "appName"]),
    capturedAt: pickString(body, ["captured_at", "capturedAt", "timestamp"]),
  };
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
    "Content-Type tidak didukung. Gunakan multipart/form-data, image/*, atau application/json."
  );
}

const SCREENSHOT_INTAKE_DISABLED = true;

export async function POST(req: NextRequest) {
  if (SCREENSHOT_INTAKE_DISABLED) {
    return NextResponse.json(
      {
        success: false,
        error: "Penerimaan screenshot sudah dinonaktifkan.",
      },
      { status: 410 }
    );
  }

  const auth = validateAgentToken(req);
  const contentType = req.headers.get("content-type") ?? null;
  const contentLength = req.headers.get("content-length") ?? null;

  if (!auth.expectedTokenPresent) {
    logAgentRequest({
      endpoint: "POST /api/agent/screenshots",
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
      endpoint: "POST /api/agent/screenshots",
      req,
      tokenOk: auth.ok,
      payload: { content_type: contentType, content_length: contentLength },
    });
    return unauthorizedResponse();
  }

  const largeRequestResponse = rejectLargeRequest(req);
  if (largeRequestResponse) return largeRequestResponse;

  let upload: ScreenshotUpload;
  try {
    upload = await parseUpload(req);
  } catch (error) {
    const status =
      error instanceof ObserverAgentScreenshotError ? error.status : 400;
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Gagal membaca upload screenshot.";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status }
    );
  }

  logAgentRequest({
    endpoint: "POST /api/agent/screenshots",
    req,
    tokenOk: auth.ok,
    payload: {
      content_type: contentType,
      content_length: contentLength,
      image_bytes: upload.buffer.length,
      original_name: upload.originalName,
      device_id: upload.deviceId,
      hostname: upload.hostname,
      source: upload.source,
      captured_at: upload.capturedAt,
    },
  });

  try {
    const screenshot = await saveObserverAgentScreenshot({
      ...upload,
      requestIp: getRequestIp(req),
      userAgent: req.headers.get("user-agent"),
    });

    if (upload.deviceId) {
      await completeRunScreenshotToolCommandsForDevice({
        deviceId: upload.deviceId,
        collectedAt:
          safeDate(upload.capturedAt) ??
          safeDate(screenshot.uploadedAt) ??
          new Date(),
      }).catch((error) => {
        console.error("Failed to complete observer screenshot commands:", error);
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Screenshot accepted",
        screenshot,
      },
      { status: 201 }
    );
  } catch (error) {
    const status =
      error instanceof ObserverAgentScreenshotError ? error.status : 500;
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Gagal menyimpan screenshot.";

    if (status >= 500) {
      console.error("OBSERVER AGENT SCREENSHOT SAVE ERROR:", error);
    }

    if (status === 400) {
      return badRequestResponse(message);
    }

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status }
    );
  }
}

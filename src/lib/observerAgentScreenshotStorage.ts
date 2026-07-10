import { createHash, randomUUID } from "crypto";
import type { Dirent } from "fs";
import {
  access,
  mkdir,
  readdir,
  readFile,
  rename,
  rm,
  stat,
  writeFile,
} from "fs/promises";
import path from "path";

export const OBSERVER_AGENT_SCREENSHOT_MAX_BYTES = 15 * 1024 * 1024;

const DEFAULT_SCREENSHOTS_DIR = path.join(
  "storage",
  "observer-agent",
  "screenshots"
);
const JAKARTA_TIME_ZONE = "Asia/Jakarta";
const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ALLOWED_IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"]);

type ImageKind = {
  extension: "png" | "jpg" | "webp";
  mimeType: "image/png" | "image/jpeg" | "image/webp";
};

type DiskScreenshotMeta = {
  fileName: string;
  dateKey: string;
  originalName: string | null;
  deviceId: string | null;
  hostname: string | null;
  source: string | null;
  capturedAt: string | null;
  uploadedAt: string;
  mimeType: ImageKind["mimeType"];
  sizeBytes: number;
  sha256: string;
  requestIp: string | null;
  userAgent: string | null;
};

export type ObserverAgentScreenshot = DiskScreenshotMeta & {
  id: string;
  url: string;
};

export type ObserverAgentScreenshotAlbum = {
  dateKey: string;
  count: number;
  screenshots: ObserverAgentScreenshot[];
};

export class ObserverAgentScreenshotError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "ObserverAgentScreenshotError";
    this.status = status;
  }
}

function cleanNullableString(value: string | null | undefined, maxLength: number) {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
}

function sanitizeFileToken(value: string | null | undefined, fallback: string) {
  const cleaned = value
    ?.trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return cleaned || fallback;
}

function sanitizeOriginalName(value: string | null | undefined) {
  const name = cleanNullableString(value, 180);
  if (!name) return null;
  return path.basename(name).replace(/[^a-zA-Z0-9._ -]+/g, "-");
}

function formatJakartaDateKey(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: JAKARTA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    return date.toISOString().slice(0, 10);
  }

  return `${year}-${month}-${day}`;
}

function detectImageKind(buffer: Buffer): ImageKind | null {
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { extension: "png", mimeType: "image/png" };
  }

  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return { extension: "jpg", mimeType: "image/jpeg" };
  }

  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return { extension: "webp", mimeType: "image/webp" };
  }

  return null;
}

function isDiskScreenshotMeta(value: unknown): value is DiskScreenshotMeta {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;

  return (
    typeof row.fileName === "string" &&
    typeof row.dateKey === "string" &&
    typeof row.uploadedAt === "string" &&
    typeof row.mimeType === "string" &&
    typeof row.sizeBytes === "number" &&
    typeof row.sha256 === "string"
  );
}

function getScreenshotMetaFileName(fileName: string) {
  return `${path.basename(fileName, path.extname(fileName))}.json`;
}

function getScreenshotDateDir(dateKey: string) {
  return path.join(getObserverAgentScreenshotsDir(), dateKey);
}

async function pathExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readDiskScreenshotMeta(dateKey: string, fileName: string) {
  try {
    const metaPath = path.join(
      getScreenshotDateDir(dateKey),
      getScreenshotMetaFileName(fileName)
    );
    const raw = await readFile(metaPath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return isDiskScreenshotMeta(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function getObserverAgentScreenshotsDir() {
  const configured = process.env.OBSERVER_AGENT_SCREENSHOTS_DIR?.trim();
  if (configured) return configured;

  return path.join(process.cwd(), DEFAULT_SCREENSHOTS_DIR);
}

export function isValidObserverAgentScreenshotDateKey(dateKey: string) {
  return DATE_KEY_PATTERN.test(dateKey);
}

export function isAllowedObserverAgentScreenshotFileName(fileName: string) {
  const safeName = path.basename(fileName);
  if (!safeName || safeName !== fileName || fileName.includes("\\")) {
    return false;
  }

  return ALLOWED_IMAGE_EXTENSIONS.has(path.extname(fileName).toLowerCase());
}

export function getObserverAgentScreenshotUrl(dateKey: string, fileName: string) {
  return `/api/agent/screenshots/${encodeURIComponent(dateKey)}/${encodeURIComponent(
    fileName
  )}`;
}

export function getObserverAgentScreenshotAbsolutePath(
  dateKey: string,
  fileName: string
) {
  if (!isValidObserverAgentScreenshotDateKey(dateKey)) {
    throw new ObserverAgentScreenshotError("Tanggal screenshot tidak valid.");
  }

  if (!isAllowedObserverAgentScreenshotFileName(fileName)) {
    throw new ObserverAgentScreenshotError("Nama file screenshot tidak valid.");
  }

  return path.join(getScreenshotDateDir(dateKey), fileName);
}

export async function saveObserverAgentScreenshot(input: {
  buffer: Buffer;
  originalName?: string | null;
  deviceId?: string | null;
  hostname?: string | null;
  source?: string | null;
  capturedAt?: string | null;
  requestIp?: string | null;
  userAgent?: string | null;
}) {
  if (!input.buffer.length) {
    throw new ObserverAgentScreenshotError("File image kosong.");
  }

  if (input.buffer.length > OBSERVER_AGENT_SCREENSHOT_MAX_BYTES) {
    throw new ObserverAgentScreenshotError(
      "Ukuran image melebihi batas 15 MB.",
      413
    );
  }

  const kind = detectImageKind(input.buffer);
  if (!kind) {
    throw new ObserverAgentScreenshotError(
      "Format image tidak didukung. Gunakan PNG, JPG, atau WEBP."
    );
  }

  const uploadedAt = new Date();
  const dateKey = formatJakartaDateKey(uploadedAt);
  const dir = getScreenshotDateDir(dateKey);
  await mkdir(dir, { recursive: true });

  const deviceToken = sanitizeFileToken(
    input.deviceId ?? input.hostname,
    "unknown-device"
  );
  const timestampToken = uploadedAt.toISOString().replace(/[:.]/g, "-");
  const fileName = `${timestampToken}_${deviceToken}_${randomUUID()}.${kind.extension}`;
  const filePath = path.join(dir, fileName);
  const tempPath = `${filePath}.${randomUUID()}.uploading`;
  const metaPath = path.join(dir, getScreenshotMetaFileName(fileName));
  const sha256 = createHash("sha256").update(input.buffer).digest("hex");

  const meta: DiskScreenshotMeta = {
    fileName,
    dateKey,
    originalName: sanitizeOriginalName(input.originalName),
    deviceId: cleanNullableString(input.deviceId, 120),
    hostname: cleanNullableString(input.hostname, 180),
    source: cleanNullableString(input.source, 80),
    capturedAt: cleanNullableString(input.capturedAt, 80),
    uploadedAt: uploadedAt.toISOString(),
    mimeType: kind.mimeType,
    sizeBytes: input.buffer.length,
    sha256,
    requestIp: cleanNullableString(input.requestIp, 80),
    userAgent: cleanNullableString(input.userAgent, 300),
  };

  try {
    await writeFile(tempPath, input.buffer);
    await rename(tempPath, filePath);
    await writeFile(metaPath, JSON.stringify(meta, null, 2), "utf8");
  } catch (error) {
    await rm(tempPath, { force: true });
    await rm(filePath, { force: true });
    throw error;
  }

  return {
    ...meta,
    id: `${dateKey}/${fileName}`,
    url: getObserverAgentScreenshotUrl(dateKey, fileName),
  };
}

export async function listObserverAgentScreenshotAlbums(options?: {
  limitDays?: number;
  limitPerDay?: number;
}) {
  const limitDays = options?.limitDays ?? 60;
  const limitPerDay = options?.limitPerDay ?? 60;
  const root = getObserverAgentScreenshotsDir();

  let entries: Dirent<string>[];
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch {
    return [];
  }

  const dateKeys = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter(isValidObserverAgentScreenshotDateKey)
    .sort((a, b) => b.localeCompare(a))
    .slice(0, limitDays);

  const albums = await Promise.all(
    dateKeys.map(async (dateKey): Promise<ObserverAgentScreenshotAlbum> => {
      const dateDir = getScreenshotDateDir(dateKey);
      const dateEntries = await readdir(dateDir, { withFileTypes: true }).catch(
        () => []
      );
      const imageFiles = dateEntries
        .filter((entry) => entry.isFile())
        .map((entry) => entry.name)
        .filter(isAllowedObserverAgentScreenshotFileName);

      const screenshots = await Promise.all(
        imageFiles.map(async (fileName) => {
          const filePath = path.join(dateDir, fileName);
          if (!(await pathExists(filePath))) return null;

          const [diskMeta, fileStat] = await Promise.all([
            readDiskScreenshotMeta(dateKey, fileName),
            stat(filePath).catch(() => null),
          ]);
          if (!fileStat) return null;

          const meta: DiskScreenshotMeta =
            diskMeta && diskMeta.fileName === fileName
              ? diskMeta
              : {
                  fileName,
                  dateKey,
                  originalName: null,
                  deviceId: null,
                  hostname: null,
                  source: null,
                  capturedAt: null,
                  uploadedAt: fileStat.mtime.toISOString(),
                  mimeType:
                    path.extname(fileName).toLowerCase() === ".webp"
                      ? "image/webp"
                      : path.extname(fileName).toLowerCase() === ".png"
                      ? "image/png"
                      : "image/jpeg",
                  sizeBytes: fileStat.size,
                  sha256: "",
                  requestIp: null,
                  userAgent: null,
                };

          return {
            ...meta,
            id: `${dateKey}/${fileName}`,
            url: getObserverAgentScreenshotUrl(dateKey, fileName),
          };
        })
      );

      return {
        dateKey,
        count: screenshots.filter(
          (screenshot): screenshot is ObserverAgentScreenshot =>
            screenshot !== null
        ).length,
        screenshots: screenshots
          .filter(
            (screenshot): screenshot is ObserverAgentScreenshot =>
              screenshot !== null
          )
          .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
          .slice(0, limitPerDay),
      };
    })
  );

  return albums.filter((album) => album.count > 0);
}

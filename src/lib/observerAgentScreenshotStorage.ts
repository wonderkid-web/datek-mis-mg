import { createHash, randomUUID } from "crypto";
import type { Dirent } from "fs";
import {
  access,
  mkdir,
  readdir,
  readFile,
  rename,
  rm,
  rmdir,
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

export type ObserverAgentGpuReading = {
  name: string | null;
  temperature: number | null;
  load: number | null;
};

type DiskScreenshotMeta = {
  fileName: string;
  dateKey: string;
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
  hasImage: boolean;
  uploadedAt: string;
  mimeType: ImageKind["mimeType"] | null;
  sizeBytes: number;
  sha256: string;
  requestIp: string | null;
  userAgent: string | null;
};

export type ObserverAgentScreenshot = DiskScreenshotMeta & {
  id: string;
  url: string | null;
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
  // Titik sengaja ikut dibuang: record tanpa gambar tidak punya ekstensi, dan
  // titik di tengah nama akan dianggap ekstensi saat menurunkan nama file meta.
  const cleaned = value
    ?.trim()
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
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
    (row.mimeType === null || typeof row.mimeType === "string") &&
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

function sanitizeNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function sanitizeGpuReadings(
  value: ObserverAgentGpuReading[] | null | undefined
): ObserverAgentGpuReading[] {
  if (!Array.isArray(value)) return [];

  return value.slice(0, 8).map((entry) => ({
    name: cleanNullableString(entry?.name, 120),
    temperature: sanitizeNumber(entry?.temperature),
    load: sanitizeNumber(entry?.load),
  }));
}

export async function saveObserverAgentScreenshot(input: {
  buffer?: Buffer | null;
  originalName?: string | null;
  deviceId?: string | null;
  hostname?: string | null;
  source?: string | null;
  commandId?: string | null;
  capturedAt?: string | null;
  cpuTemperatureC?: number | null;
  cpuLoadPercent?: number | null;
  fanRpm?: number | null;
  memoryAvailableGb?: number | null;
  memoryLoadPercent?: number | null;
  batteryChargePercent?: number | null;
  batteryRemainingCapacity?: number | null;
  gpu?: ObserverAgentGpuReading[] | null;
  requestIp?: string | null;
  userAgent?: string | null;
}) {
  const buffer = input.buffer && input.buffer.length ? input.buffer : null;

  if (buffer && buffer.length > OBSERVER_AGENT_SCREENSHOT_MAX_BYTES) {
    throw new ObserverAgentScreenshotError(
      "Ukuran image melebihi batas 15 MB.",
      413
    );
  }

  // Agent sensor mengirim payload non-image (JSON kecil) di field file.
  // Perlakukan sebagai kiriman tanpa gambar, bukan error.
  const kind = buffer ? detectImageKind(buffer) : null;

  const uploadedAt = new Date();
  const dateKey = formatJakartaDateKey(uploadedAt);
  const dir = getScreenshotDateDir(dateKey);
  await mkdir(dir, { recursive: true });

  const deviceToken = sanitizeFileToken(
    input.deviceId ?? input.hostname,
    "unknown-device"
  );
  const timestampToken = uploadedAt.toISOString().replace(/[:.]/g, "-");
  const baseName = `${timestampToken}_${deviceToken}_${randomUUID()}`;
  const fileName = kind ? `${baseName}.${kind.extension}` : baseName;
  const metaPath = path.join(dir, getScreenshotMetaFileName(fileName));
  const sha256 = kind && buffer ? createHash("sha256").update(buffer).digest("hex") : "";

  const meta: DiskScreenshotMeta = {
    fileName,
    dateKey,
    originalName: sanitizeOriginalName(input.originalName),
    deviceId: cleanNullableString(input.deviceId, 120),
    hostname: cleanNullableString(input.hostname, 180),
    source: cleanNullableString(input.source, 80),
    commandId: cleanNullableString(input.commandId, 120),
    capturedAt: cleanNullableString(input.capturedAt, 80),
    cpuTemperatureC: sanitizeNumber(input.cpuTemperatureC),
    cpuLoadPercent: sanitizeNumber(input.cpuLoadPercent),
    fanRpm: sanitizeNumber(input.fanRpm),
    memoryAvailableGb: sanitizeNumber(input.memoryAvailableGb),
    memoryLoadPercent: sanitizeNumber(input.memoryLoadPercent),
    batteryChargePercent: sanitizeNumber(input.batteryChargePercent),
    batteryRemainingCapacity: sanitizeNumber(input.batteryRemainingCapacity),
    gpu: sanitizeGpuReadings(input.gpu),
    hasImage: Boolean(kind),
    uploadedAt: uploadedAt.toISOString(),
    mimeType: kind?.mimeType ?? null,
    sizeBytes: kind && buffer ? buffer.length : 0,
    sha256,
    requestIp: cleanNullableString(input.requestIp, 80),
    userAgent: cleanNullableString(input.userAgent, 300),
  };

  if (kind && buffer) {
    const filePath = path.join(dir, fileName);
    const tempPath = `${filePath}.${randomUUID()}.uploading`;
    try {
      await writeFile(tempPath, buffer);
      await rename(tempPath, filePath);
      await writeFile(metaPath, JSON.stringify(meta, null, 2), "utf8");
    } catch (error) {
      await rm(tempPath, { force: true });
      await rm(filePath, { force: true });
      throw error;
    }
  } else {
    await writeFile(metaPath, JSON.stringify(meta, null, 2), "utf8");
  }

  return {
    ...meta,
    id: `${dateKey}/${fileName}`,
    url: kind ? getObserverAgentScreenshotUrl(dateKey, fileName) : null,
  };
}

export async function deleteObserverAgentScreenshot(input: {
  dateKey: string;
  fileName: string;
}) {
  const filePath = getObserverAgentScreenshotAbsolutePath(
    input.dateKey,
    input.fileName
  );
  const dateDir = getScreenshotDateDir(input.dateKey);
  const metaPath = path.join(dateDir, getScreenshotMetaFileName(input.fileName));
  let deleted = false;

  try {
    await rm(filePath);
    deleted = true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }

  await rm(metaPath, { force: true });

  try {
    await rmdir(dateDir);
  } catch {
    // Keep non-empty date albums.
  }

  return deleted;
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
      const fileNames = dateEntries
        .filter((entry) => entry.isFile())
        .map((entry) => entry.name);
      const metaFileNames = fileNames.filter((name) => name.endsWith(".json"));
      const imageFileNames = fileNames.filter(
        isAllowedObserverAgentScreenshotFileName
      );
      const recordedImageFileNames = new Set<string>();

      const fromMeta = await Promise.all(
        metaFileNames.map(async (metaFileName) => {
          const baseName = metaFileName.slice(0, -".json".length);
          const raw = await readFile(path.join(dateDir, metaFileName), "utf8").catch(
            () => null
          );
          if (!raw) return null;

          let parsed: unknown;
          try {
            parsed = JSON.parse(raw);
          } catch {
            return null;
          }
          if (!isDiskScreenshotMeta(parsed) || parsed.fileName !== baseName) {
            return null;
          }

          // Record lama ditulis sebelum field sensor ada; isi default agar
          // konsumen tidak perlu menangani undefined.
          let meta: DiskScreenshotMeta = {
            ...parsed,
            commandId: parsed.commandId ?? null,
            cpuTemperatureC: parsed.cpuTemperatureC ?? null,
            cpuLoadPercent: parsed.cpuLoadPercent ?? null,
            fanRpm: parsed.fanRpm ?? null,
            memoryAvailableGb: parsed.memoryAvailableGb ?? null,
            memoryLoadPercent: parsed.memoryLoadPercent ?? null,
            batteryChargePercent: parsed.batteryChargePercent ?? null,
            batteryRemainingCapacity: parsed.batteryRemainingCapacity ?? null,
            gpu: Array.isArray(parsed.gpu) ? parsed.gpu : [],
            hasImage: parsed.hasImage ?? true,
          };
          if (meta.hasImage) {
            const imagePath = path.join(dateDir, meta.fileName);
            const fileStat = await stat(imagePath).catch(() => null);
            if (!fileStat) return null;
            recordedImageFileNames.add(meta.fileName);
            meta = { ...meta, sizeBytes: fileStat.size };
          }

          return {
            ...meta,
            id: `${dateKey}/${meta.fileName}`,
            url: meta.hasImage
              ? getObserverAgentScreenshotUrl(dateKey, meta.fileName)
              : null,
          };
        })
      );

      const orphanImageFileNames = imageFileNames.filter(
        (fileName) => !recordedImageFileNames.has(fileName)
      );

      const fromOrphanImages = await Promise.all(
        orphanImageFileNames.map(async (fileName) => {
          const filePath = path.join(dateDir, fileName);
          if (!(await pathExists(filePath))) return null;

          const fileStat = await stat(filePath).catch(() => null);
          if (!fileStat) return null;

          const meta: DiskScreenshotMeta = {
            fileName,
            dateKey,
            originalName: null,
            deviceId: null,
            hostname: null,
            source: null,
            commandId: null,
            capturedAt: null,
            cpuTemperatureC: null,
            cpuLoadPercent: null,
            fanRpm: null,
            memoryAvailableGb: null,
            memoryLoadPercent: null,
            batteryChargePercent: null,
            batteryRemainingCapacity: null,
            gpu: [],
            hasImage: true,
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

      const screenshots = [...fromMeta, ...fromOrphanImages].filter(
        (screenshot): screenshot is ObserverAgentScreenshot => screenshot !== null
      );

      return {
        dateKey,
        count: screenshots.length,
        screenshots: screenshots
          .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
          .slice(0, limitPerDay),
      };
    })
  );

  return albums.filter((album) => album.count > 0);
}

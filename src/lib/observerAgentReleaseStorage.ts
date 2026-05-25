import { createHash } from "crypto";
import { createWriteStream } from "fs";
import { access, mkdir, readdir, readFile, rename, rm, writeFile } from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { pipeline } from "stream/promises";

import { prisma } from "@/lib/prisma";

type DiskReleaseMeta = {
  version: string;
  originalName: string;
  storedName: string;
  sizeBytes: number;
  sha256: string;
  uploadedAt: string;
  uploadedByName: string | null;
  uploadedByEmail: string | null;
  releaseNotes: string | null;
};

export type ObserverAgentReleaseMeta = {
  id: number;
  version: string;
  originalName: string;
  storedName: string;
  sizeBytes: number;
  sha256: string;
  uploadedAt: string;
  uploadedByName: string | null;
  uploadedByEmail: string | null;
  isLatest: boolean;
  releaseNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

export class ObserverAgentReleaseError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "ObserverAgentReleaseError";
    this.status = status;
  }
}

function assertObserverAgentReleaseModelAvailable() {
  const releaseModel = (
    prisma as unknown as { observerAgentRelease?: unknown }
  ).observerAgentRelease;

  if (!releaseModel) {
    throw new ObserverAgentReleaseError(
      "Prisma model observer_agent_releases belum tersedia di runtime. Jalankan migration + prisma generate di server, lalu restart aplikasi.",
      500
    );
  }
}

const LATEST_RELEASE_MANIFEST = "latest.json";
const DEFAULT_RELEASES_DIR = path.join(
  "storage",
  "observer-agent",
  "releases"
);
const DISK_DB_SYNC_TTL_MS = 60_000;

let diskToDbSyncPromise: Promise<void> | null = null;
let diskToDbLastSyncAt = 0;

function sanitizeVersion(version: string) {
  return version.trim().replace(/[^a-zA-Z0-9._-]/g, "-");
}

function sanitizeFileName(name: string) {
  return path.basename(name).replace(/[^a-zA-Z0-9._-]/g, "-");
}

function getReleaseBinaryName(version: string) {
  return `observer-agent-${sanitizeVersion(version)}.exe`;
}

function getReleaseMetadataName(version: string) {
  return `observer-agent-${sanitizeVersion(version)}.json`;
}

function getReleaseMetadataPath(dir: string, version: string) {
  return path.join(dir, getReleaseMetadataName(version));
}

function getReleaseBinaryPathByStoredName(dir: string, storedName: string) {
  return path.join(dir, path.basename(storedName));
}

function mapReleaseRow(
  row: Awaited<ReturnType<typeof prisma.observerAgentRelease.findFirstOrThrow>>
): ObserverAgentReleaseMeta {
  return {
    id: row.id,
    version: row.version,
    originalName: row.originalName,
    storedName: row.storedName,
    sizeBytes: row.sizeBytes,
    sha256: row.sha256,
    uploadedAt: row.uploadedAt.toISOString(),
    uploadedByName: row.uploadedByName,
    uploadedByEmail: row.uploadedByEmail,
    isLatest: row.isLatest,
    releaseNotes: row.releaseNotes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapRowToDiskMeta(row: ObserverAgentReleaseMeta): DiskReleaseMeta {
  return {
    version: row.version,
    originalName: row.originalName,
    storedName: row.storedName,
    sizeBytes: row.sizeBytes,
    sha256: row.sha256,
    uploadedAt: row.uploadedAt,
    uploadedByName: row.uploadedByName,
    uploadedByEmail: row.uploadedByEmail,
    releaseNotes: row.releaseNotes,
  };
}

function isDiskReleaseMeta(value: unknown): value is DiskReleaseMeta {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.version === "string" &&
    typeof row.originalName === "string" &&
    typeof row.storedName === "string" &&
    typeof row.sizeBytes === "number" &&
    typeof row.sha256 === "string" &&
    typeof row.uploadedAt === "string"
  );
}

async function pathExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readDiskReleaseMetadata(filePath: string) {
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return isDiskReleaseMeta(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

async function writeDiskReleaseMetadata(dir: string, meta: DiskReleaseMeta) {
  const filePath = getReleaseMetadataPath(dir, meta.version);
  await writeFile(filePath, JSON.stringify(meta, null, 2), "utf8");
}

async function writeLatestManifest(dir: string, meta: DiskReleaseMeta) {
  const latestPath = path.join(dir, LATEST_RELEASE_MANIFEST);
  await writeFile(latestPath, JSON.stringify(meta, null, 2), "utf8");
}

async function readAllDiskMetadata(dir: string) {
  const entries = await readdir(dir, { withFileTypes: true });
  const metadataFiles = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => name.endsWith(".json") && name !== LATEST_RELEASE_MANIFEST);

  const rows = await Promise.all(
    metadataFiles.map((name) => readDiskReleaseMetadata(path.join(dir, name)))
  );

  return rows.filter((row): row is DiskReleaseMeta => row !== null);
}

async function ensureObserverAgentReleasesDir() {
  const dir = getObserverAgentReleasesDir();
  await mkdir(dir, { recursive: true });
  return dir;
}

async function setLatestInDb(version: string) {
  return prisma.$transaction(async (tx) => {
    await tx.observerAgentRelease.updateMany({
      where: { isLatest: true },
      data: { isLatest: false },
    });

    const latest = await tx.observerAgentRelease.update({
      where: { version },
      data: { isLatest: true },
    });

    return latest;
  });
}

async function syncDiskReleasesIntoDatabaseUnsafe() {
  assertObserverAgentReleaseModelAvailable();

  const dir = await ensureObserverAgentReleasesDir();
  const diskRows = await readAllDiskMetadata(dir);
  const latestManifest = await readDiskReleaseMetadata(
    path.join(dir, LATEST_RELEASE_MANIFEST)
  );
  const latestVersionFromFile = latestManifest?.version ?? null;

  if (diskRows.length) {
    for (const row of diskRows) {
      await prisma.observerAgentRelease.upsert({
        where: { version: row.version },
        create: {
          version: row.version,
          originalName: row.originalName,
          storedName: row.storedName,
          sizeBytes: row.sizeBytes,
          sha256: row.sha256,
          uploadedAt: new Date(row.uploadedAt),
          uploadedByName: row.uploadedByName,
          uploadedByEmail: row.uploadedByEmail,
          releaseNotes: row.releaseNotes,
          isLatest: false,
        },
        update: {
          originalName: row.originalName,
          storedName: row.storedName,
          sizeBytes: row.sizeBytes,
          sha256: row.sha256,
          uploadedAt: new Date(row.uploadedAt),
          uploadedByName: row.uploadedByName,
          uploadedByEmail: row.uploadedByEmail,
          releaseNotes: row.releaseNotes,
        },
      });
    }
  }

  let latestDb =
    latestVersionFromFile && latestVersionFromFile.trim()
      ? await prisma.observerAgentRelease.findUnique({
          where: { version: sanitizeVersion(latestVersionFromFile) },
        })
      : null;

  if (!latestDb) {
    latestDb = await prisma.observerAgentRelease.findFirst({
      where: { isLatest: true },
      orderBy: { uploadedAt: "desc" },
    });
  }

  if (!latestDb) {
    latestDb = await prisma.observerAgentRelease.findFirst({
      orderBy: { uploadedAt: "desc" },
    });
  }

  if (!latestDb) return;

  const latestNow = await setLatestInDb(latestDb.version);
  const latestMeta = mapReleaseRow(latestNow);
  await writeLatestManifest(dir, mapRowToDiskMeta(latestMeta));
}

async function syncDiskReleasesIntoDatabase() {
  if (Date.now() - diskToDbLastSyncAt < DISK_DB_SYNC_TTL_MS) {
    return;
  }

  if (!diskToDbSyncPromise) {
    diskToDbSyncPromise = (async () => {
      await syncDiskReleasesIntoDatabaseUnsafe();
      diskToDbLastSyncAt = Date.now();
    })().finally(() => {
      diskToDbSyncPromise = null;
    });
  }

  await diskToDbSyncPromise;
}

export function getObserverAgentReleasesDir() {
  const configured = process.env.OBSERVER_AGENT_RELEASES_DIR?.trim();
  if (configured) return configured;

  return path.join(process.cwd(), DEFAULT_RELEASES_DIR);
}

export function getObserverAgentReleaseDownloadPath(storedName: string) {
  const safeName = path.basename(storedName);
  return `/observer-agent/releases/${encodeURIComponent(safeName)}`;
}

export function getObserverAgentReleaseAbsolutePath(fileName: string) {
  const safeName = path.basename(fileName);
  return path.join(getObserverAgentReleasesDir(), safeName);
}

export async function saveObserverAgentRelease(input: {
  version: string;
  fileName: string;
  file: File;
  uploadedByName?: string | null;
  uploadedByEmail?: string | null;
  releaseNotes?: string | null;
}) {
  await syncDiskReleasesIntoDatabase();

  const version = sanitizeVersion(input.version);
  if (!version) {
    throw new ObserverAgentReleaseError("Versi release wajib diisi.");
  }

  if (path.extname(input.fileName).toLowerCase() !== ".exe") {
    throw new ObserverAgentReleaseError("File release harus berekstensi .exe.");
  }

  const dir = await ensureObserverAgentReleasesDir();
  const existing = await prisma.observerAgentRelease.findFirst({
    where: {
      OR: [{ version }, { storedName: getReleaseBinaryName(version) }],
    },
    select: { id: true },
  });
  if (existing) {
    throw new ObserverAgentReleaseError(`Release versi ${version} sudah ada.`, 409);
  }

  const originalName = sanitizeFileName(input.fileName);
  const storedName = getReleaseBinaryName(version);
  const uploadedAt = new Date();
  const tempFilePath = path.join(dir, `${storedName}.uploading`);
  const finalFilePath = getReleaseBinaryPathByStoredName(dir, storedName);
  const hash = createHash("sha256");

  if (await pathExists(finalFilePath)) {
    throw new ObserverAgentReleaseError(
      `File release versi ${version} sudah ada di storage.`,
      409
    );
  }

  let finalCreated = false;
  try {
    const readable = Readable.fromWeb(input.file.stream() as any);
    readable.on("data", (chunk) => {
      hash.update(chunk);
    });

    await pipeline(readable, createWriteStream(tempFilePath));
    await rename(tempFilePath, finalFilePath);
    finalCreated = true;

    const created = await prisma.$transaction(async (tx) => {
      await tx.observerAgentRelease.updateMany({
        where: { isLatest: true },
        data: { isLatest: false },
      });

      return tx.observerAgentRelease.create({
        data: {
          version,
          originalName,
          storedName,
          sizeBytes: input.file.size,
          sha256: hash.digest("hex"),
          uploadedAt,
          uploadedByName: input.uploadedByName ?? null,
          uploadedByEmail: input.uploadedByEmail ?? null,
          isLatest: true,
          releaseNotes: input.releaseNotes?.trim() || null,
        },
      });
    });

    const meta = mapReleaseRow(created);
    const diskMeta = mapRowToDiskMeta(meta);
    await writeDiskReleaseMetadata(dir, diskMeta);
    await writeLatestManifest(dir, diskMeta);
    return meta;
  } catch (error) {
    await rm(tempFilePath, { force: true });
    if (finalCreated) {
      await rm(finalFilePath, { force: true });
    }
    throw error;
  }
}

export async function listObserverAgentReleases(limit = 10) {
  await syncDiskReleasesIntoDatabase();

  const rows = await prisma.observerAgentRelease.findMany({
    orderBy: [{ uploadedAt: "desc" }, { id: "desc" }],
    take: limit,
  });

  return rows.map((row) => mapReleaseRow(row));
}

export async function getLatestObserverAgentRelease() {
  await syncDiskReleasesIntoDatabase();

  const latest =
    (await prisma.observerAgentRelease.findFirst({
      where: { isLatest: true },
      orderBy: { uploadedAt: "desc" },
    })) ??
    (await prisma.observerAgentRelease.findFirst({
      orderBy: { uploadedAt: "desc" },
    }));

  return latest ? mapReleaseRow(latest) : null;
}

export async function getObserverAgentReleaseByVersion(versionInput: string) {
  await syncDiskReleasesIntoDatabase();

  const version = sanitizeVersion(versionInput);
  if (!version) return null;

  const row = await prisma.observerAgentRelease.findUnique({
    where: { version },
  });
  return row ? mapReleaseRow(row) : null;
}

export async function setLatestObserverAgentRelease(versionInput: string) {
  await syncDiskReleasesIntoDatabase();

  const version = sanitizeVersion(versionInput);
  if (!version) {
    throw new ObserverAgentReleaseError("Versi release tidak valid.");
  }

  const existing = await prisma.observerAgentRelease.findUnique({
    where: { version },
  });
  if (!existing) {
    throw new ObserverAgentReleaseError(
      `Release versi ${version} tidak ditemukan.`,
      404
    );
  }

  const latestBefore = await prisma.observerAgentRelease.findFirst({
    where: { isLatest: true },
    orderBy: { uploadedAt: "desc" },
  });
  const latestRow = await setLatestInDb(version);
  const latestMeta = mapReleaseRow(latestRow);

  const dir = await ensureObserverAgentReleasesDir();
  await writeLatestManifest(dir, mapRowToDiskMeta(latestMeta));
  await writeDiskReleaseMetadata(dir, mapRowToDiskMeta(latestMeta));

  if (latestBefore && latestBefore.version !== latestMeta.version) {
    const latestBeforeMeta = mapReleaseRow(latestBefore);
    latestBeforeMeta.isLatest = false;
    await writeDiskReleaseMetadata(dir, mapRowToDiskMeta(latestBeforeMeta));
  }

  return latestMeta;
}

export async function renameObserverAgentReleaseVersion(input: {
  currentVersion: string;
  nextVersion: string;
}) {
  await syncDiskReleasesIntoDatabase();

  const currentVersion = sanitizeVersion(input.currentVersion);
  const nextVersion = sanitizeVersion(input.nextVersion);

  if (!currentVersion || !nextVersion) {
    throw new ObserverAgentReleaseError("Versi release tidak valid.");
  }

  if (currentVersion === nextVersion) {
    const current = await getObserverAgentReleaseByVersion(currentVersion);
    if (!current) {
      throw new ObserverAgentReleaseError(
        `Release versi ${currentVersion} tidak ditemukan.`,
        404
      );
    }
    return current;
  }

  const current = await prisma.observerAgentRelease.findUnique({
    where: { version: currentVersion },
  });
  if (!current) {
    throw new ObserverAgentReleaseError(
      `Release versi ${currentVersion} tidak ditemukan.`,
      404
    );
  }

  const nextExists = await prisma.observerAgentRelease.findUnique({
    where: { version: nextVersion },
    select: { id: true },
  });
  if (nextExists) {
    throw new ObserverAgentReleaseError(
      `Release versi ${nextVersion} sudah ada.`,
      409
    );
  }

  const dir = await ensureObserverAgentReleasesDir();
  const currentBinaryPath = getReleaseBinaryPathByStoredName(dir, current.storedName);
  const currentMetadataPath = getReleaseMetadataPath(dir, currentVersion);
  const nextStoredName = getReleaseBinaryName(nextVersion);
  const nextBinaryPath = getReleaseBinaryPathByStoredName(dir, nextStoredName);
  const nextMetadataPath = getReleaseMetadataPath(dir, nextVersion);

  if (!(await pathExists(currentBinaryPath))) {
    throw new ObserverAgentReleaseError(
      `Binary release versi ${currentVersion} tidak ditemukan.`,
      404
    );
  }

  if (await pathExists(nextBinaryPath)) {
    throw new ObserverAgentReleaseError(
      `File release versi ${nextVersion} sudah ada di storage.`,
      409
    );
  }

  if (await pathExists(nextMetadataPath)) {
    throw new ObserverAgentReleaseError(
      `Metadata release versi ${nextVersion} sudah ada di storage.`,
      409
    );
  }

  await rename(currentBinaryPath, nextBinaryPath);
  let metadataRenamed = false;
  try {
    if (await pathExists(currentMetadataPath)) {
      await rename(currentMetadataPath, nextMetadataPath);
      metadataRenamed = true;
    }

    const updated = await prisma.observerAgentRelease.update({
      where: { id: current.id },
      data: {
        version: nextVersion,
        storedName: nextStoredName,
      },
    });

    const updatedMeta = mapReleaseRow(updated);
    await writeDiskReleaseMetadata(dir, mapRowToDiskMeta(updatedMeta));

    if (updated.isLatest) {
      await writeLatestManifest(dir, mapRowToDiskMeta(updatedMeta));
    }

    return updatedMeta;
  } catch (error) {
    if (await pathExists(nextBinaryPath) && !(await pathExists(currentBinaryPath))) {
      await rename(nextBinaryPath, currentBinaryPath);
    }
    if (
      metadataRenamed &&
      (await pathExists(nextMetadataPath)) &&
      !(await pathExists(currentMetadataPath))
    ) {
      await rename(nextMetadataPath, currentMetadataPath);
    }
    throw error;
  }
}

export async function deleteObserverAgentRelease(versionInput: string) {
  await syncDiskReleasesIntoDatabase();

  const version = sanitizeVersion(versionInput);
  if (!version) {
    throw new ObserverAgentReleaseError("Versi release tidak valid.");
  }

  const existing = await prisma.observerAgentRelease.findUnique({
    where: { version },
  });
  if (!existing) {
    throw new ObserverAgentReleaseError(
      `Release versi ${version} tidak ditemukan.`,
      404
    );
  }

  const dir = await ensureObserverAgentReleasesDir();
  const binaryPath = getReleaseBinaryPathByStoredName(dir, existing.storedName);
  const metadataPath = getReleaseMetadataPath(dir, existing.version);
  await rm(binaryPath, { force: true });
  await rm(metadataPath, { force: true });

  const deleted = await prisma.$transaction(async (tx) => {
    const removed = await tx.observerAgentRelease.delete({
      where: { id: existing.id },
    });

    if (removed.isLatest) {
      const fallback = await tx.observerAgentRelease.findFirst({
        orderBy: { uploadedAt: "desc" },
      });
      if (fallback) {
        await tx.observerAgentRelease.updateMany({
          where: { isLatest: true },
          data: { isLatest: false },
        });
        await tx.observerAgentRelease.update({
          where: { id: fallback.id },
          data: { isLatest: true },
        });
      }
    }

    return removed;
  });

  const latest = await getLatestObserverAgentRelease();
  if (latest) {
    await writeLatestManifest(dir, mapRowToDiskMeta(latest));
  } else {
    await rm(path.join(dir, LATEST_RELEASE_MANIFEST), { force: true });
  }

  return mapReleaseRow(deleted);
}

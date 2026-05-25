import { createReadStream } from "fs";
import { access, readFile, stat } from "fs/promises";
import path from "path";
import { Readable } from "stream";

import { NextRequest, NextResponse } from "next/server";

import { getObserverAgentReleaseAbsolutePath } from "@/lib/observerAgentReleaseStorage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function getContentType(fileName: string) {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === ".json") return "application/json; charset=utf-8";
  if (ext === ".exe") return "application/octet-stream";
  return "application/octet-stream";
}

function getCacheControl(fileName: string) {
  if (fileName === "latest.json") {
    return "no-store, no-cache, must-revalidate, proxy-revalidate";
  }
  return "public, max-age=31536000, immutable";
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ fileName: string }> }
) {
  const { fileName: rawFileName } = await params;
  const fileName = decodeURIComponent(rawFileName ?? "").trim();
  const safeName = path.basename(fileName);

  if (!safeName || safeName !== fileName) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid file name",
      },
      { status: 400 }
    );
  }

  const isAllowedFile =
    safeName === "latest.json" ||
    /^observer-agent-[a-zA-Z0-9._-]+\.(exe|json)$/i.test(safeName);

  if (!isAllowedFile) {
    return NextResponse.json(
      {
        success: false,
        error: "Unsupported file name",
      },
      { status: 404 }
    );
  }

  const filePath = getObserverAgentReleaseAbsolutePath(safeName);
  const isLatestManifest = safeName === "latest.json";
  const source = "filesystem";

  try {
    await access(filePath);
    const fileStat = await stat(filePath);
    const nodeStream = createReadStream(filePath);
    const webStream = Readable.toWeb(nodeStream) as ReadableStream;

    if (isLatestManifest) {
      const latestRaw = await readFile(filePath, "utf8");
      let latestSummary: Record<string, unknown> = {};
      try {
        const parsed = JSON.parse(latestRaw) as Record<string, unknown>;
        latestSummary = {
          version: parsed.version ?? null,
          storedName: parsed.storedName ?? null,
          sha256: parsed.sha256 ?? null,
        };
      } catch {
        latestSummary = { parse_error: true };
      }

      console.log(
        [
          "---------------- OBSERVER RELEASE PUBLIC LATEST ----------------",
          JSON.stringify(
            {
              source,
              file_path: filePath,
              file_exists: true,
              bytes: fileStat.size,
              cache_control: getCacheControl(safeName),
              summary: latestSummary,
            },
            null,
            2
          ),
          "----------------------------------------------------------------",
        ].join("\n")
      );
    }

    return new NextResponse(webStream, {
      status: 200,
      headers: {
        "Content-Type": getContentType(safeName),
        "Content-Length": String(fileStat.size),
        "Cache-Control": getCacheControl(safeName),
        ...(isLatestManifest
          ? {
              Pragma: "no-cache",
              Expires: "0",
            }
          : {}),
        ...(safeName.toLowerCase().endsWith(".exe")
          ? {
              "Content-Disposition": `attachment; filename="${safeName}"`,
            }
          : {}),
      },
    });
  } catch {
    if (isLatestManifest) {
      console.log(
        [
          "---------------- OBSERVER RELEASE PUBLIC LATEST ----------------",
          JSON.stringify(
            {
              source,
              file_path: filePath,
              file_exists: false,
              cache_control: getCacheControl(safeName),
            },
            null,
            2
          ),
          "----------------------------------------------------------------",
        ].join("\n")
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "File not found",
      },
      { status: 404 }
    );
  }
}

import { createReadStream } from "fs";
import { stat } from "fs/promises";
import path from "path";
import { Readable } from "stream";

import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/session";
import {
  getObserverAgentScreenshotAbsolutePath,
  ObserverAgentScreenshotError,
} from "@/lib/observerAgentScreenshotStorage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function getImageContentType(fileName: string) {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return "image/jpeg";
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ date: string; fileName: string }> }
) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized",
      },
      { status: 401 }
    );
  }

  const { date, fileName } = await params;
  const safeDate = decodeURIComponent(date ?? "").trim();
  const safeFileName = decodeURIComponent(fileName ?? "").trim();

  let filePath: string;
  try {
    filePath = getObserverAgentScreenshotAbsolutePath(safeDate, safeFileName);
  } catch (error) {
    const message =
      error instanceof ObserverAgentScreenshotError
        ? error.message
        : "Screenshot path tidak valid.";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 400 }
    );
  }

  try {
    const fileStat = await stat(filePath);
    const nodeStream = createReadStream(filePath);
    const webStream = Readable.toWeb(nodeStream) as ReadableStream;

    return new NextResponse(webStream, {
      status: 200,
      headers: {
        "Content-Type": getImageContentType(safeFileName),
        "Content-Length": String(fileStat.size),
        "Cache-Control": "private, max-age=60",
        "Content-Disposition": `inline; filename="${safeFileName}"`,
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Screenshot tidak ditemukan.",
      },
      { status: 404 }
    );
  }
}

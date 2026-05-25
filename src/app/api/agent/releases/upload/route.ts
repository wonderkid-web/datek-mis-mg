import { NextRequest, NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/session";
import {
  ObserverAgentReleaseError,
  saveObserverAgentRelease,
} from "@/lib/observerAgentReleaseStorage";

export const runtime = "nodejs";

const MAX_RELEASE_SIZE_BYTES = 300 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "administrator";

  if (!session) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized",
      },
      { status: 401 }
    );
  }

  if (!isAdmin) {
    return NextResponse.json(
      {
        success: false,
        error: "Forbidden",
      },
      { status: 403 }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid multipart form data",
      },
      { status: 400 }
    );
  }

  const version = String(formData.get("version") ?? "").trim();
  const releaseNotes = String(formData.get("release_notes") ?? "").trim();
  const fileValue = formData.get("file");

  if (!version) {
    return NextResponse.json(
      {
        success: false,
        error: "Version is required",
      },
      { status: 400 }
    );
  }

  if (!(fileValue instanceof File)) {
    return NextResponse.json(
      {
        success: false,
        error: "File release wajib dipilih",
      },
      { status: 400 }
    );
  }

  if (!fileValue.name.trim()) {
    return NextResponse.json(
      {
        success: false,
        error: "Nama file tidak valid",
      },
      { status: 400 }
    );
  }

  if (fileValue.size === 0) {
    return NextResponse.json(
      {
        success: false,
        error: "File kosong",
      },
      { status: 400 }
    );
  }

  if (fileValue.size > MAX_RELEASE_SIZE_BYTES) {
    return NextResponse.json(
      {
        success: false,
        error: "Ukuran file melebihi batas 300 MB",
      },
      { status: 400 }
    );
  }

  try {
    const release = await saveObserverAgentRelease({
      version,
      fileName: fileValue.name,
      file: fileValue,
      uploadedByName: session.user?.name ?? null,
      uploadedByEmail: session.user?.email ?? null,
      releaseNotes: releaseNotes || null,
    });

    return NextResponse.json({
      success: true,
      message: "Release observer agent berhasil diupload",
      release,
    });
  } catch (error) {
    const status =
      error instanceof ObserverAgentReleaseError ? error.status : 500;
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Gagal menyimpan release observer agent";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/session";
import {
  deleteObserverAgentRelease,
  getObserverAgentReleaseByVersion,
  ObserverAgentReleaseError,
  renameObserverAgentReleaseVersion,
  setLatestObserverAgentRelease,
} from "@/lib/observerAgentReleaseStorage";

export const runtime = "nodejs";

function decodeVersion(raw: string) {
  return decodeURIComponent(raw ?? "").trim();
}

async function requireAdminSession() {
  const session = await getCurrentSession();
  const isAdmin =
    (session?.user as { role?: string } | undefined)?.role === "administrator";

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

  return null;
}

function handleReleaseError(error: unknown, fallback: string) {
  const status =
    error instanceof ObserverAgentReleaseError ? error.status : 500;
  const message =
    error instanceof Error && error.message ? error.message : fallback;

  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status }
  );
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ version: string }> }
) {
  const authError = await requireAdminSession();
  if (authError) return authError;

  const { version: rawVersion } = await params;
  const version = decodeVersion(rawVersion);
  if (!version) {
    return NextResponse.json(
      {
        success: false,
        error: "Version is required",
      },
      { status: 400 }
    );
  }

  try {
    const release = await getObserverAgentReleaseByVersion(version);
    if (!release) {
      return NextResponse.json(
        {
          success: false,
          error: `Release versi ${version} tidak ditemukan.`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      release,
    });
  } catch (error) {
    return handleReleaseError(error, "Gagal membaca release observer agent");
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ version: string }> }
) {
  const authError = await requireAdminSession();
  if (authError) return authError;

  const { version: rawVersion } = await params;
  const version = decodeVersion(rawVersion);
  if (!version) {
    return NextResponse.json(
      {
        success: false,
        error: "Version is required",
      },
      { status: 400 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid JSON body",
      },
      { status: 400 }
    );
  }

  const action = String(body.action ?? "").trim();
  if (!action) {
    return NextResponse.json(
      {
        success: false,
        error: "Action is required",
      },
      { status: 400 }
    );
  }

  try {
    if (action === "rename") {
      const nextVersion = String(body.version ?? "").trim();
      if (!nextVersion) {
        return NextResponse.json(
          {
            success: false,
            error: "Version baru wajib diisi",
          },
          { status: 400 }
        );
      }

      const release = await renameObserverAgentReleaseVersion({
        currentVersion: version,
        nextVersion,
      });
      return NextResponse.json({
        success: true,
        message: `Release berhasil diubah ke versi ${release.version}`,
        release,
      });
    }

    if (action === "set_latest") {
      const release = await setLatestObserverAgentRelease(version);
      return NextResponse.json({
        success: true,
        message: `Versi ${release.version} diset sebagai latest release`,
        release,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Action tidak didukung",
      },
      { status: 400 }
    );
  } catch (error) {
    return handleReleaseError(error, "Gagal update release observer agent");
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ version: string }> }
) {
  const authError = await requireAdminSession();
  if (authError) return authError;

  const { version: rawVersion } = await params;
  const version = decodeVersion(rawVersion);
  if (!version) {
    return NextResponse.json(
      {
        success: false,
        error: "Version is required",
      },
      { status: 400 }
    );
  }

  try {
    const deleted = await deleteObserverAgentRelease(version);
    return NextResponse.json({
      success: true,
      message: `Release versi ${deleted.version} berhasil dihapus`,
      release: deleted,
    });
  } catch (error) {
    return handleReleaseError(error, "Gagal menghapus release observer agent");
  }
}

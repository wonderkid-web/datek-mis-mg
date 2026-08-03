import { NextRequest, NextResponse } from "next/server";

import {
  logAgentRequest,
  unauthorizedResponse,
  validateAgentToken,
} from "@/app/api/agent/_shared";
import {
  createRunScreenshotToolCommandsForActiveDevices,
  ObserverAgentCommandError,
} from "@/lib/observerAgentCommandService";
import { pruneObserverAgentMonitoringData } from "@/lib/observerAgentScreenshotStorage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Trigger terjadwal untuk mengambil data monitoring dari semua device aktif.
 *
 * Route ini sengaja tidak menjalankan scheduler sendiri di dalam proses Next,
 * karena container bisa di-restart/di-scale dan timer in-process ikut hilang.
 * Pemanggilnya (cron host, sidecar compose, atau scheduled workflow) cukup
 * menembak endpoint ini sekali sehari dengan Bearer OBSERVER_AGENT_TOKEN.
 *
 * Command yang dibuat identik dengan tombol manual di dashboard, jadi agent
 * tidak perlu membedakan keduanya.
 */
export async function POST(req: NextRequest) {
  const auth = validateAgentToken(req);

  if (!auth.expectedTokenPresent) {
    return unauthorizedResponse({
      message: "Server misconfigured: OBSERVER_AGENT_TOKEN is not set",
    });
  }

  if (!auth.ok) {
    logAgentRequest({
      endpoint: "POST /api/agent/monitoring/schedule",
      req,
      tokenOk: auth.ok,
      payload: { reason: "invalid token" },
    });
    return unauthorizedResponse();
  }

  try {
    const result = await createRunScreenshotToolCommandsForActiveDevices({
      requester: {
        name: "scheduler",
        email: null,
      },
    });

    // Retensi dijalankan di sini karena cron harian ini sudah pasti berkala.
    const pruned = await pruneObserverAgentMonitoringData().catch((error) => {
      console.error("Failed to prune monitoring data:", error);
      return null;
    });

    logAgentRequest({
      endpoint: "POST /api/agent/monitoring/schedule",
      req,
      tokenOk: auth.ok,
      payload: {
        created_count: result.createdCount,
        duplicate_count: result.duplicateCount,
        pruned_days: pruned?.removedDays ?? 0,
        retention_days: pruned?.retentionDays ?? null,
      },
    });

    return NextResponse.json({
      success: true,
      created_count: result.createdCount,
      duplicate_count: result.duplicateCount,
      pruned_days: pruned?.removedDays ?? 0,
    });
  } catch (error) {
    const message =
      error instanceof ObserverAgentCommandError
        ? error.message
        : "Gagal membuat command monitoring terjadwal.";
    console.error("OBSERVER MONITORING SCHEDULE ERROR:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

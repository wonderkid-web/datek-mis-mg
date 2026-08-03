import { NextRequest } from "next/server";

import { handleMonitoringIntake } from "@/app/api/agent/_monitoringIntake";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Alias lama dari POST /api/agent/monitoring.
 *
 * Agent < 0.1.14 masih menembak path ini sampai mereka auto-update, jadi route
 * ini harus tetap hidup. Perilakunya identik dengan endpoint monitoring.
 */
export async function POST(req: NextRequest) {
  return handleMonitoringIntake(req, "POST /api/agent/screenshots (alias)");
}

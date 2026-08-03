import { NextRequest } from "next/server";

import { handleMonitoringIntake } from "@/app/api/agent/_monitoringIntake";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return handleMonitoringIntake(req, "POST /api/agent/monitoring");
}

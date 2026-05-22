import { NextRequest, NextResponse } from "next/server";
import {
  assertObject,
  badRequestResponse,
  logAgentRequest,
  normalizeString,
  safeReadJson,
  unauthorizedResponse,
  validateAgentToken,
} from "../_shared";
import { recordDeviceHeartbeat } from "@/lib/observerAgentService";

export async function POST(req: NextRequest) {
  const auth = validateAgentToken(req);
  const json = await safeReadJson(req);

  const payload = json.ok ? json.body : { _invalid_json: true };
  logAgentRequest({
    endpoint: "POST /api/agent/heartbeat",
    req,
    tokenOk: auth.ok,
    payload,
  });

  if (!auth.expectedTokenPresent) {
    return unauthorizedResponse({
      message: "Server misconfigured: OBSERVER_AGENT_TOKEN is not set",
    });
  }

  if (!auth.ok) {
    return unauthorizedResponse();
  }

  if (!json.ok) {
    return badRequestResponse("Invalid JSON body");
  }

  if (!assertObject(json.body)) {
    return badRequestResponse("Invalid JSON body");
  }

  const deviceId = normalizeString(json.body.device_id);
  if (!deviceId) {
    return badRequestResponse("Missing required fields", {
      required: ["device_id"],
    });
  }

  await recordDeviceHeartbeat({
    device_id: deviceId,
    hostname: normalizeString(json.body.hostname) ?? undefined,
    agent_version: normalizeString(json.body.agent_version) ?? undefined,
    timestamp: normalizeString(json.body.timestamp) ?? undefined,
  });

  return NextResponse.json({
    success: true,
    message: "Heartbeat accepted",
    server_time: new Date().toISOString(),
  });
}

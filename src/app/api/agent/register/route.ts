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
import { upsertDeviceFromRegister } from "@/lib/observerAgentService";

export async function POST(req: NextRequest) {
  const auth = validateAgentToken(req);
  const json = await safeReadJson(req);

  const payload = json.ok ? json.body : { _invalid_json: true };
  logAgentRequest({
    endpoint: "POST /api/agent/register",
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
  const hostname = normalizeString(json.body.hostname);
  if (!deviceId || !hostname) {
    return badRequestResponse("Missing required fields", {
      required: ["device_id", "hostname"],
    });
  }

  await upsertDeviceFromRegister({
    device_id: deviceId,
    hostname,
    username: normalizeString(json.body.username) ?? undefined,
    agent_version: normalizeString(json.body.agent_version) ?? undefined,
    os_name: normalizeString(json.body.os_name) ?? undefined,
  });

  return NextResponse.json({
    success: true,
    message: "Device registered",
    server_time: new Date().toISOString(),
  });
}

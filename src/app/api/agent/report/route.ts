import { NextRequest, NextResponse } from "next/server";
import {
  badRequestResponse,
  logAgentRequest,
  safeReadJson,
  unauthorizedResponse,
  validateAgentToken,
} from "../_shared";

export async function POST(req: NextRequest) {
  const auth = validateAgentToken(req);
  const json = await safeReadJson(req);

  const payload = json.ok ? json.body : { _invalid_json: true };
  logAgentRequest({
    endpoint: "POST /api/agent/report",
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

  return NextResponse.json({
    success: true,
    message: "Report accepted",
    server_time: new Date().toISOString(),
  });
}


import { NextRequest, NextResponse } from "next/server";

type AgentAuthResult = {
  ok: boolean;
  providedToken: string | null;
  expectedTokenPresent: boolean;
};

export function getRequestIp(req: NextRequest) {
  const xForwardedFor = req.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const first = xForwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  const xRealIp = req.headers.get("x-real-ip");
  if (xRealIp) return xRealIp.trim();

  const cfConnectingIp = req.headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp.trim();

  return null;
}

export function parseBearerToken(req: NextRequest) {
  const auth = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!auth) return null;

  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

export function validateAgentToken(req: NextRequest): AgentAuthResult {
  const providedToken = parseBearerToken(req);
  const expectedToken = process.env.OBSERVER_AGENT_TOKEN || "";

  if (!expectedToken) {
    // If env isn't set, always reject to avoid accidental open endpoint.
    return {
      ok: false,
      providedToken,
      expectedTokenPresent: false,
    };
  }

  return {
    ok: Boolean(providedToken && providedToken === expectedToken),
    providedToken,
    expectedTokenPresent: true,
  };
}

export async function safeReadJson(req: NextRequest) {
  try {
    const body = await req.json();
    return { ok: true as const, body };
  } catch (error) {
    return { ok: false as const, error };
  }
}

export function summarizePayload(payload: unknown) {
  if (payload === null) return { type: "null" };
  if (payload === undefined) return { type: "undefined" };

  if (Array.isArray(payload)) {
    return { type: "array", length: payload.length };
  }

  if (typeof payload === "object") {
    const keys = Object.keys(payload as Record<string, unknown>);
    return { type: "object", keys_count: keys.length, keys };
  }

  if (typeof payload === "string") {
    return { type: "string", length: payload.length };
  }

  return { type: typeof payload, value: payload };
}

export function logAgentRequest(params: {
  endpoint: string;
  req: NextRequest;
  tokenOk: boolean;
  payload: unknown;
}) {
  const { endpoint, req, tokenOk, payload } = params;
  const time = new Date().toISOString();
  const ip = getRequestIp(req);
  const userAgent = req.headers.get("user-agent");

  const headerDump = {
    "x-forwarded-for": req.headers.get("x-forwarded-for"),
    "x-real-ip": req.headers.get("x-real-ip"),
    "cf-connecting-ip": req.headers.get("cf-connecting-ip"),
    host: req.headers.get("host"),
    "user-agent": userAgent,
  };

  const summary = summarizePayload(payload);
  const payloadFull =
    typeof payload === "string" ? payload : JSON.stringify(payload, null, 2);

  // Very explicit single block, easy to grep.
  console.log(
    [
      "==================== OBSERVER AGENT REQUEST ====================",
      `endpoint     : ${endpoint}`,
      `time         : ${time}`,
      `method       : ${req.method}`,
      `ip           : ${ip ?? "-"}`,
      `token_valid  : ${tokenOk ? "YES" : "NO"}`,
      `headers      : ${JSON.stringify(headerDump)}`,
      `payload_sum  : ${JSON.stringify(summary)}`,
      "payload_full :",
      payloadFull,
      "================================================================",
    ].join("\n")
  );
}

export function unauthorizedResponse(detail?: Record<string, unknown>) {
  return NextResponse.json(
    {
      success: false,
      error: "Unauthorized",
      ...detail,
    },
    { status: 401 }
  );
}

export function badRequestResponse(message: string, detail?: Record<string, unknown>) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...detail,
    },
    { status: 400 }
  );
}


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
import {
  getLatestObserverAgentRelease,
  getObserverAgentReleaseDownloadPath,
} from "@/lib/observerAgentReleaseStorage";
import { compareSemver } from "@/lib/semver";

export const runtime = "nodejs";

function firstHeaderValue(raw: string | null) {
  if (!raw) return null;
  const first = raw.split(",")[0]?.trim();
  return first || null;
}

function stripTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function isLoopbackHostname(hostname: string) {
  const lower = hostname.toLowerCase();
  return (
    lower === "localhost" ||
    lower === "127.0.0.1" ||
    lower === "::1" ||
    lower.endsWith(".localhost")
  );
}

function resolvePublicBaseUrl(req: NextRequest) {
  const primary = normalizeString(process.env.OBSERVER_AGENT_PUBLIC_BASE_URL);
  if (primary) {
    try {
      const parsed = new URL(primary);
      return stripTrailingSlash(parsed.toString());
    } catch {
      // continue to header-based fallback
    }
  }

  const envCandidates = [process.env.NEXTAUTH_URL];

  for (const candidate of envCandidates) {
    const normalized = normalizeString(candidate);
    if (!normalized) continue;
    try {
      const parsed = new URL(normalized);
      if (isLoopbackHostname(parsed.hostname)) {
        continue;
      }
      return stripTrailingSlash(parsed.toString());
    } catch {
      continue;
    }
  }

  const forwardedHost = firstHeaderValue(req.headers.get("x-forwarded-host"));
  const host = forwardedHost ?? firstHeaderValue(req.headers.get("host"));
  const forwardedProto = firstHeaderValue(req.headers.get("x-forwarded-proto"));
  const protocol =
    forwardedProto ?? (req.nextUrl.protocol.replace(":", "") || "https");

  if (host) {
    return `${protocol}://${host}`;
  }

  return stripTrailingSlash(req.nextUrl.origin);
}

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

  const pick = (obj: Record<string, unknown>, keys: string[]) => {
    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) return obj[key];
    }
    return undefined;
  };
  const hasAnyKey = (obj: Record<string, unknown>, keys: string[]) => {
    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) return true;
    }
    return false;
  };

  const deviceId = normalizeString(pick(json.body, ["device_id", "deviceId"]));
  const hostname = normalizeString(pick(json.body, ["hostname", "host_name", "hostName"]));
  const agentVersion = normalizeString(pick(json.body, ["agent_version", "agentVersion"]));
  const currentVersion = normalizeString(
    pick(json.body, ["current_version", "currentVersion"])
  );
  const lastUpdateStatus = normalizeString(
    pick(json.body, ["last_update_status", "lastUpdateStatus"])
  );
  const lastUpdateVersion = normalizeString(
    pick(json.body, ["last_update_version", "lastUpdateVersion"])
  );
  const lastUpdateMessage = normalizeString(
    pick(json.body, ["last_update_message", "lastUpdateMessage"])
  );
  const timestamp = normalizeString(pick(json.body, ["timestamp"]));
  const hasCurrentVersion = hasAnyKey(json.body, ["current_version", "currentVersion"]);
  const hasLastUpdateStatus = hasAnyKey(json.body, [
    "last_update_status",
    "lastUpdateStatus",
  ]);
  const hasLastUpdateVersion = hasAnyKey(json.body, [
    "last_update_version",
    "lastUpdateVersion",
  ]);
  const hasLastUpdateMessage = hasAnyKey(json.body, [
    "last_update_message",
    "lastUpdateMessage",
  ]);

  const missing = [
    ["device_id", deviceId],
    ["hostname", hostname],
    ["agent_version", agentVersion],
    ["timestamp", timestamp],
  ]
    .filter(([, value]) => !value)
    .map(([field]) => field);

  if (missing.length) {
    return badRequestResponse("Missing required fields", {
      required: ["device_id", "hostname", "agent_version", "timestamp"],
      missing,
    });
  }

  const parsedTimestamp = new Date(timestamp!);
  if (Number.isNaN(parsedTimestamp.getTime())) {
    return badRequestResponse("Invalid timestamp", {
      field: "timestamp",
    });
  }

  await recordDeviceHeartbeat({
    device_id: deviceId!,
    hostname: hostname!,
    agent_version: agentVersion!,
    current_version: hasCurrentVersion ? currentVersion : undefined,
    public_ip: normalizeString(pick(json.body, ["public_ip", "publicIp"])) ?? undefined,
    last_update_status: hasLastUpdateStatus ? lastUpdateStatus : undefined,
    last_update_version: hasLastUpdateVersion ? lastUpdateVersion : undefined,
    last_update_message: hasLastUpdateMessage ? lastUpdateMessage : undefined,
    timestamp: timestamp!,
  });

  let latestRelease: Awaited<ReturnType<typeof getLatestObserverAgentRelease>> = null;
  try {
    latestRelease = await getLatestObserverAgentRelease();
  } catch (error) {
    console.error("Failed to resolve latest observer release on heartbeat:", error);
  }
  const agentCurrentVersion = currentVersion ?? agentVersion;

  let updateAvailable = false;
  let latestVersion: string | null = null;
  let downloadUrl: string | null = null;
  let sha256: string | null = null;
  let versionComparison: number | null = null;

  if (latestRelease) {
    latestVersion = latestRelease.version;
    const semverComparison = compareSemver(
      agentCurrentVersion ?? null,
      latestRelease.version
    );
    versionComparison = semverComparison;

    // Update only when agent version is older than active latest.
    // If semver parse fails, fallback to force update for safety.
    updateAvailable = semverComparison === null ? true : semverComparison < 0;

    if (updateAvailable) {
      const baseUrl = resolvePublicBaseUrl(req);
      const downloadPath = getObserverAgentReleaseDownloadPath(latestRelease.storedName);
      downloadUrl = new URL(downloadPath, `${stripTrailingSlash(baseUrl)}/`).toString();
      sha256 = latestRelease.sha256;
    }
  } else {
    latestVersion = agentCurrentVersion ?? null;
  }

  const heartbeatResponse = {
    latest_version: latestVersion,
    download_url: downloadUrl,
    sha256,
    update_available: updateAvailable,
  };

  console.log(
    [
      "---------------- OBSERVER HEARTBEAT UPDATE DECISION ----------------",
      JSON.stringify(
        {
          device_id: deviceId,
          hostname,
          current_version: agentCurrentVersion ?? null,
          latest_version: latestVersion,
          semver_compare_result: versionComparison,
          update_available: updateAvailable,
          download_url: downloadUrl,
          sha256_present: Boolean(sha256),
          response: heartbeatResponse,
        },
        null,
        2
      ),
      "-------------------------------------------------------------------",
    ].join("\n")
  );

  return NextResponse.json(heartbeatResponse);
}

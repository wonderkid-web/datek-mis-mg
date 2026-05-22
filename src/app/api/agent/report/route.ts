import { NextRequest, NextResponse } from "next/server";
import {
  assertObject,
  badRequestResponse,
  logAgentRequest,
  normalizeNumber,
  normalizeString,
  safeReadJson,
  unauthorizedResponse,
  validateAgentToken,
} from "../_shared";
import { ingestDeviceReport } from "@/lib/observerAgentService";

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

  if (!assertObject(json.body)) {
    return badRequestResponse("Invalid JSON body");
  }

  const pick = (obj: Record<string, unknown>, keys: string[]) => {
    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) return obj[key];
    }
    return undefined;
  };

  const deviceId = normalizeString(pick(json.body, ["device_id", "deviceId"]));
  const hostname = normalizeString(pick(json.body, ["hostname", "host_name", "hostName"]));
  if (!deviceId || !hostname) {
    return badRequestResponse("Missing required fields", {
      required: ["device_id", "hostname"],
    });
  }

  const osRaw = pick(json.body, ["os", "os_info", "osInfo"]);
  const os =
    osRaw && assertObject(osRaw)
      ? {
          name: normalizeString(pick(osRaw, ["name", "os_name", "osName"])) ?? undefined,
          version: normalizeString(pick(osRaw, ["version", "os_version", "osVersion"])) ?? undefined,
          build: normalizeString(pick(osRaw, ["build", "os_build", "osBuild"])) ?? undefined,
        }
      : undefined;

  const hardwareRaw = pick(json.body, ["hardware", "hw", "hardware_specs", "hardwareSpecs"]);
  const hardware =
    hardwareRaw && assertObject(hardwareRaw)
      ? {
          cpu: normalizeString(pick(hardwareRaw, ["cpu"])) ?? undefined,
          ram_gb: normalizeNumber(pick(hardwareRaw, ["ram_gb", "ramGb", "ram"])) ?? undefined,
          manufacturer: normalizeString(pick(hardwareRaw, ["manufacturer", "mfg"])) ?? undefined,
          model: normalizeString(pick(hardwareRaw, ["model"])) ?? undefined,
          serial_number: normalizeString(pick(hardwareRaw, ["serial_number", "serialNumber", "serial"])) ?? undefined,
          gpu: normalizeString(pick(hardwareRaw, ["gpu"])) ?? undefined,
          motherboard: normalizeString(pick(hardwareRaw, ["motherboard", "mainboard"])) ?? undefined,
        }
      : undefined;

  const storageRaw = pick(json.body, ["storage", "storage_drives", "storageDrives", "drives"]);
  const storage = Array.isArray(storageRaw)
    ? storageRaw
        .filter((item) => item && assertObject(item))
        .map((item) => ({
          drive: normalizeString(pick(item, ["drive", "drive_letter", "driveLetter"])) ?? undefined,
          total_gb: normalizeNumber(pick(item, ["total_gb", "totalGb", "total"])) ?? undefined,
          free_gb: normalizeNumber(pick(item, ["free_gb", "freeGb", "free"])) ?? undefined,
          free_percent: normalizeNumber(pick(item, ["free_percent", "freePercent"])) ?? undefined,
        }))
    : undefined;

  const storageHealthRaw = pick(json.body, ["storage_health", "storageHealth", "disk_health", "diskHealth"]);
  const storageHealth = Array.isArray(storageHealthRaw)
    ? storageHealthRaw
        .filter((item) => item && assertObject(item))
        .map((item) => ({
          device_id: normalizeString(pick(item, ["device_id", "deviceId", "disk_device_id", "diskDeviceId"])) ?? undefined,
          device_name: normalizeString(pick(item, ["device_name", "deviceName"])) ?? undefined,
          serial_number: normalizeString(pick(item, ["serial_number", "serialNumber"])) ?? undefined,
          model: normalizeString(pick(item, ["model"])) ?? undefined,
          media_type: normalizeString(pick(item, ["media_type", "mediaType"])) ?? undefined,
          bus_type: normalizeString(pick(item, ["bus_type", "busType"])) ?? undefined,
          firmware_version: normalizeString(pick(item, ["firmware_version", "firmwareVersion"])) ?? undefined,
          health_status: normalizeString(pick(item, ["health_status", "healthStatus"])) ?? undefined,
          operational_status: normalizeString(pick(item, ["operational_status", "operationalStatus"])) ?? undefined,
          predicted_failure:
            typeof pick(item, ["predicted_failure", "predictedFailure"]) === "boolean"
              ? (pick(item, ["predicted_failure", "predictedFailure"]) as boolean)
              : undefined,
          temperature_c: normalizeNumber(pick(item, ["temperature_c", "temperatureC"])) ?? undefined,
          temperature_f: normalizeNumber(pick(item, ["temperature_f", "temperatureF"])) ?? undefined,
          power_on_hours: normalizeNumber(pick(item, ["power_on_hours", "powerOnHours"])) ?? undefined,
          wear_level_percent: normalizeNumber(pick(item, ["wear_level_percent", "wearLevelPercent"])) ?? undefined,
          available_spare_percent: normalizeNumber(pick(item, ["available_spare_percent", "availableSparePercent"])) ?? undefined,
          read_errors: normalizeNumber(pick(item, ["read_errors", "readErrors"])) ?? undefined,
          write_errors: normalizeNumber(pick(item, ["write_errors", "writeErrors"])) ?? undefined,
          collected_at: normalizeString(pick(item, ["collected_at", "collectedAt", "timestamp"])) ?? undefined,
        }))
    : undefined;

  const installedAppsRaw = pick(json.body, ["installed_apps", "installedApps", "apps"]);
  const installedApps = Array.isArray(installedAppsRaw)
    ? installedAppsRaw
        .filter((item) => item && assertObject(item))
        .map((item) => ({
          name: normalizeString(pick(item, ["name", "app_name", "appName"])) ?? undefined,
          version: normalizeString(pick(item, ["version", "app_version", "appVersion"])) ?? undefined,
          publisher: normalizeString(pick(item, ["publisher"])) ?? undefined,
          install_date: normalizeString(pick(item, ["install_date", "installDate"])) ?? undefined,
        }))
    : undefined;

  const logsRaw = pick(json.body, ["logs", "agent_logs", "agentLogs"]);
  const logs = Array.isArray(logsRaw)
    ? logsRaw
        .filter((item) => item && assertObject(item))
        .map((item) => ({
          event_type: normalizeString(pick(item, ["event_type", "eventType", "type"])) ?? undefined,
          message: normalizeString(pick(item, ["message", "msg"])) ?? undefined,
          log_level: normalizeString(pick(item, ["log_level", "logLevel", "level"])) ?? undefined,
          created_at: normalizeString(pick(item, ["created_at", "createdAt", "time"])) ?? undefined,
        }))
    : undefined;

  const normalizedSummary = {
    device_id: deviceId,
    hostname,
    username_present: Boolean(normalizeString(pick(json.body, ["username", "user_name", "userName"]))),
    ip_present: Boolean(normalizeString(pick(json.body, ["ip_address", "ipAddress", "ip"]))),
    os_present: Boolean(os?.name || os?.version || os?.build),
    hardware_present: Boolean(
      hardware?.cpu ||
        typeof hardware?.ram_gb === "number" ||
        hardware?.manufacturer ||
        hardware?.model ||
        hardware?.serial_number ||
        hardware?.gpu ||
        hardware?.motherboard
    ),
    storage_count: storage?.filter((d) => Boolean(d.drive)).length ?? 0,
    storage_health_count: storageHealth?.filter((h) => Boolean(h.device_id)).length ?? 0,
    installed_apps_count: installedApps?.filter((a) => Boolean(a.name)).length ?? 0,
    logs_count: logs?.filter((l) => Boolean(l.message)).length ?? 0,
  };
  console.log(
    [
      "---------------- OBSERVER AGENT REPORT NORMALIZED ----------------",
      JSON.stringify(normalizedSummary, null, 2),
      "------------------------------------------------------------------",
    ].join("\n")
  );

  try {
    await ingestDeviceReport({
      device_id: deviceId,
      hostname,
      username: normalizeString(pick(json.body, ["username", "user_name", "userName"])) ?? undefined,
      ip_address: normalizeString(pick(json.body, ["ip_address", "ipAddress", "ip"])) ?? undefined,
      os,
      hardware,
      storage,
      storage_health: storageHealth,
      installed_apps: installedApps,
      agent_version: normalizeString(pick(json.body, ["agent_version", "agentVersion"])) ?? undefined,
      collected_at: normalizeString(pick(json.body, ["collected_at", "collectedAt", "timestamp"])) ?? undefined,
      logs,
    });
  } catch (error) {
    console.error("OBSERVER AGENT REPORT INGEST ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to ingest report",
        server_time: new Date().toISOString(),
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Report accepted",
    server_time: new Date().toISOString(),
  });
}

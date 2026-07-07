import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getObserverDeviceList, computeObserverDeviceStatus } from "@/lib/observerAgentService";
import {
  createSendFullReportCommandsForActiveDevices,
  listObserverAgentCommands,
  ObserverAgentCommandError,
} from "@/lib/observerAgentCommandService";
import { getCurrentSession } from "@/lib/session";
import { RequestFullReportCommandForm } from "./RequestFullReportCommandForm";

export const dynamic = "force-dynamic";

function formatRelative(date: Date | null) {
  if (!date) return "-";
  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) return "just now";
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatDateTime(date: Date | null) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function StatusBadge({ label, variant }: { label: string; variant: "ok" | "warn" | "crit" | "muted" }) {
  const className =
    variant === "ok"
      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
      : variant === "warn"
      ? "bg-amber-100 text-amber-800 border-amber-300"
      : variant === "crit"
      ? "bg-red-100 text-red-800 border-red-300"
      : "bg-slate-100 text-slate-800 border-slate-300";
  return <Badge className={className}>{label}</Badge>;
}

function CommandStatusBadge({ status }: { status: string }) {
  const variant =
    status === "completed"
      ? "ok"
      : status === "delivered" || status === "pending"
      ? "warn"
      : status === "expired" || status === "cancelled"
      ? "crit"
      : "muted";
  return <StatusBadge label={status.toUpperCase()} variant={variant} />;
}

function commandMessageUrl(type: "command_saved" | "command_error", message: string) {
  return `/tracker/observer-agent?${type}=${encodeURIComponent(message)}`;
}

async function requestAllAgentSpecsAction() {
  "use server";

  const session = await getCurrentSession();
  const user = session?.user as
    | { role?: string; name?: string | null; email?: string | null }
    | undefined;

  if (user?.role !== "administrator") {
    redirect(commandMessageUrl("command_error", "Hanya administrator yang boleh trigger full report."));
  }

  let result: Awaited<ReturnType<typeof createSendFullReportCommandsForActiveDevices>>;
  try {
    result = await createSendFullReportCommandsForActiveDevices({
      requester: {
        name: user?.name,
        email: user?.email,
      },
    });
  } catch (error) {
    const message =
      error instanceof ObserverAgentCommandError
        ? error.message
        : "Gagal membuat command full report global.";
    redirect(commandMessageUrl("command_error", message));
  }

  revalidatePath("/tracker/observer-agent");
  const skipped = result.duplicateCount
    ? ` ${result.duplicateCount} duplicate dilewati.`
    : "";
  redirect(
    commandMessageUrl(
      "command_saved",
      `${result.createdCount} command full report dibuat.${skipped}`
    )
  );
}

export default async function ObserverAgentPage({
  searchParams,
}: {
  searchParams: Promise<{ command_saved?: string; command_error?: string }>;
}) {
  const [devices, commandHistory, session, params] = await Promise.all([
    getObserverDeviceList(),
    listObserverAgentCommands(20),
    getCurrentSession(),
    searchParams,
  ]);
  const user = session?.user as { role?: string } | undefined;
  const canTriggerCommands = user?.role === "administrator";
  const commandMessage = params.command_error ?? params.command_saved ?? null;

  const derived = devices.map((device) => {
    const status = computeObserverDeviceStatus({
      lastSeen: device.lastSeen,
      lastReportAt: device.lastReportAt,
      ramGb: device.hardwareSpec?.ramGb ?? null,
      drives: device.storageDrives.map((drive) => ({
        freePercent: drive.freePercent,
        status: drive.status,
      })),
    });
    return { device, status };
  });

  const summary = derived.reduce(
    (acc, row) => {
      acc.total += 1;
      if (row.status.online) acc.online += 1;
      if (row.status.offline) acc.offline += 1;
      if (row.status.diskCritical) acc.diskCritical += 1;
      if (row.status.ramBelowStandard) acc.ramBelowStandard += 1;
      if (row.status.stale) acc.stale += 1;
      return acc;
    },
    { total: 0, online: 0, offline: 0, diskCritical: 0, ramBelowStandard: 0, stale: 0 }
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-xl font-semibold">Observer Agents</h2>
          <p className="text-sm text-muted-foreground">
            Monitoring dasar request register/heartbeat/report dari Observer Agent.
          </p>
        </div>
        <RequestFullReportCommandForm
          action={requestAllAgentSpecsAction}
          label="Get All Agent Specs Now"
          confirmMessage="Minta semua agent aktif mengirim full report pada heartbeat berikutnya?"
          disabled={!canTriggerCommands}
        />
      </div>

      {commandMessage ? (
        <div
          className={
            params.command_error
              ? "rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              : "rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"
          }
        >
          {commandMessage}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-sm text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{summary.total}</CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-sm text-muted-foreground">Online</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{summary.online}</CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-sm text-muted-foreground">Offline</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{summary.offline}</CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-sm text-muted-foreground">Disk Critical</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{summary.diskCritical}</CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-sm text-muted-foreground">RAM &lt; 8GB</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{summary.ramBelowStandard}</CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-sm text-muted-foreground">Stale (7d)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{summary.stale}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Full Report Commands</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table className="min-w-[1180px]">
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead>Command</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Delivered</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Expires</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commandHistory.length ? (
                  commandHistory.map((command) => (
                    <TableRow key={command.id} className="even:bg-emerald-50/40">
                      <TableCell>
                        <div className="font-medium">{command.commandType}</div>
                        <div className="font-mono text-xs text-muted-foreground">
                          {command.id}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{command.targetScope}</Badge>
                        <div className="mt-1 break-all font-mono text-xs text-muted-foreground">
                          {command.targetDeviceId ?? "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <CommandStatusBadge status={command.status} />
                      </TableCell>
                      <TableCell>
                        <div>{command.requestedBy ?? "-"}</div>
                        <div className="text-xs text-muted-foreground">
                          {command.requestedByEmail ?? "-"}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDateTime(command.requestedAt)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDateTime(command.deliveredAt)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDateTime(command.completedAt)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDateTime(command.expiresAt)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-20 text-center text-muted-foreground">
                      Belum ada command full report.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Devices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table className="min-w-[1420px]">
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="w-[220px]">Hostname</TableHead>
                  <TableHead className="w-[140px]">Alias</TableHead>
                  <TableHead className="w-[140px]">User</TableHead>
                  <TableHead className="w-[130px]">IP Local</TableHead>
                  <TableHead className="w-[130px]">IP Public</TableHead>
                  <TableHead className="w-[150px]">MAC LAN</TableHead>
                  <TableHead className="w-[150px]">MAC WLAN</TableHead>
                  <TableHead className="w-[170px]">OS</TableHead>
                  <TableHead className="text-center">RAM</TableHead>
                  <TableHead className="text-center">Disk</TableHead>
                  <TableHead className="w-[130px]">Last seen</TableHead>
                  <TableHead className="sticky right-0 z-20 border-l bg-gray-100 text-center shadow-[-4px_0_8px_-6px_rgba(0,0,0,0.2)]">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {derived.length ? (
                  derived.map(({ device, status }, index) => {
                    const aliasName =
                      (device as { aliasName?: string | null }).aliasName ?? null;
                    const overallVariant = status.diskCritical || status.offline ? "crit" : status.diskWarning || status.stale || status.ramBelowStandard ? "warn" : status.online ? "ok" : "muted";
                    const overallLabel = status.offline
                      ? "OFFLINE"
                      : status.online
                      ? "ONLINE"
                      : "UNKNOWN";

                    const diskLabel = status.diskCritical ? "CRITICAL" : status.diskWarning ? "WARNING" : "OK";
                    const diskVariant = status.diskCritical ? "crit" : status.diskWarning ? "warn" : "ok";
                    const rowBgClass = index % 2 === 0 ? "bg-white" : "bg-emerald-50/40";
                    const stickyStatusBgClass = index % 2 === 0 ? "bg-white" : "bg-emerald-50";

                    return (
                      <TableRow key={device.id} className={`group ${rowBgClass}`}>
                        <TableCell className="font-medium">
                          <Link className="underline underline-offset-4" href={`/tracker/observer-agent/${device.deviceId}`}>
                            {device.hostname}
                          </Link>
                          <div className="break-all text-xs text-muted-foreground">{device.deviceId}</div>
                        </TableCell>
                        <TableCell className="break-words">{aliasName ?? "-"}</TableCell>
                        <TableCell className="break-words">{device.username ?? "-"}</TableCell>
                        <TableCell className="break-all">{device.ipAddress ?? "-"}</TableCell>
                        <TableCell className="break-all">{device.publicIp ?? "-"}</TableCell>
                        <TableCell className="break-all font-mono text-xs">{device.lanMacAddress ?? "-"}</TableCell>
                        <TableCell className="break-all font-mono text-xs">{device.wlanMacAddress ?? "-"}</TableCell>
                        <TableCell>
                          <div className="break-words font-medium">{device.osName ?? "-"}</div>
                          <div className="break-words text-xs text-muted-foreground">
                            {device.osVersion ?? ""}{device.osBuild ? ` (${device.osBuild})` : ""}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {device.hardwareSpec?.ramGb ?? "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <StatusBadge label={diskLabel} variant={diskVariant} />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{formatRelative(device.lastSeen)}</div>
                          <div className="text-xs text-muted-foreground">
                            {device.lastSeen ? formatDateTime(device.lastSeen) : ""}
                          </div>
                        </TableCell>
                        <TableCell className={`sticky right-0 z-10 border-l text-center shadow-[-4px_0_8px_-6px_rgba(0,0,0,0.12)] group-hover:bg-muted ${stickyStatusBgClass}`}>
                          <StatusBadge label={overallLabel} variant={overallVariant} />
                          <div className="mt-1 flex flex-wrap justify-center gap-1">
                            {status.ramBelowStandard && <Badge variant="outline">RAM</Badge>}
                            {status.stale && <Badge variant="outline">STALE</Badge>}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={12} className="h-24 text-center text-muted-foreground">
                      Belum ada device masuk. Coba jalankan agent dan cek endpoint `POST /api/agent/*`.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

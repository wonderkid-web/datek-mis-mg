import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ChevronLeft, ChevronRight, Images, Search } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getObserverDeviceList, computeObserverDeviceStatus } from "@/lib/observerAgentService";
import {
  createRunScreenshotToolCommandsForActiveDevices,
  createSendFullReportCommandsForActiveDevices,
  listObserverAgentCommands,
  ObserverAgentCommandError,
} from "@/lib/observerAgentCommandService";
import { getLatestObserverAgentRelease } from "@/lib/observerAgentReleaseStorage";
import { compareSemver } from "@/lib/semver";
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

type DeviceRow = Awaited<ReturnType<typeof getObserverDeviceList>>[number];

function getDeviceAgentVersion(device: DeviceRow) {
  return device.currentVersion ?? device.agentVersion ?? null;
}

function matchesDeviceQuery(device: DeviceRow, query: string) {
  const haystack = [
    device.hostname,
    (device as { aliasName?: string | null }).aliasName,
    device.username,
    device.deviceId,
    device.ipAddress,
    device.publicIp,
    device.lanMacAddress,
    device.wlanMacAddress,
    device.osName,
    getDeviceAgentVersion(device),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  // Semua kata harus cocok, jadi "alwin 0.1.15" mempersempit hasil.
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
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

async function requestAllAgentMonitoringAction() {
  "use server";

  const session = await getCurrentSession();
  const user = session?.user as
    | { role?: string; name?: string | null; email?: string | null }
    | undefined;

  if (user?.role !== "administrator") {
    redirect(
      commandMessageUrl("command_error", "Hanya administrator yang boleh trigger monitoring.")
    );
  }

  let result: Awaited<ReturnType<typeof createRunScreenshotToolCommandsForActiveDevices>>;
  try {
    result = await createRunScreenshotToolCommandsForActiveDevices({
      requester: {
        name: user?.name,
        email: user?.email,
      },
    });
  } catch (error) {
    const message =
      error instanceof ObserverAgentCommandError
        ? error.message
        : "Gagal membuat command monitoring global.";
    redirect(commandMessageUrl("command_error", message));
  }

  revalidatePath("/tracker/observer-agent");
  const skipped = result.duplicateCount
    ? ` ${result.duplicateCount} duplicate dilewati.`
    : "";
  redirect(
    commandMessageUrl(
      "command_saved",
      `${result.createdCount} command monitoring dibuat.${skipped}`
    )
  );
}

const DEVICES_PER_PAGE = 20;

export default async function ObserverAgentPage({
  searchParams,
}: {
  searchParams: Promise<{
    command_saved?: string;
    command_error?: string;
    q?: string;
    page?: string;
  }>;
}) {
  const [devices, commandHistory, session, latestRelease, params] =
    await Promise.all([
      getObserverDeviceList(),
      listObserverAgentCommands(20),
      getCurrentSession(),
      getLatestObserverAgentRelease().catch(() => null),
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

  // Ringkasan di atas tetap menghitung seluruh device; pencarian dan paginasi
  // hanya memengaruhi isi tabel.
  const query = params.q?.trim() ?? "";
  const filtered = query ? derived.filter((row) => matchesDeviceQuery(row.device, query)) : derived;

  const totalPages = Math.max(1, Math.ceil(filtered.length / DEVICES_PER_PAGE));
  const requestedPage = Number(params.page);
  const currentPage = Math.min(
    Math.max(Number.isFinite(requestedPage) ? Math.floor(requestedPage) : 1, 1),
    totalPages
  );
  const pageRows = filtered.slice(
    (currentPage - 1) * DEVICES_PER_PAGE,
    currentPage * DEVICES_PER_PAGE
  );

  const buildPageHref = (page: number) => {
    const search = new URLSearchParams();
    if (query) search.set("q", query);
    if (page > 1) search.set("page", String(page));
    const qs = search.toString();
    return qs ? `/tracker/observer-agent?${qs}` : "/tracker/observer-agent";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-xl font-semibold">Observer Agents</h2>
          <p className="text-sm text-muted-foreground">
            Monitoring dasar request register/heartbeat/report dari Observer Agent.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="outline">
            <Link href="/tracker/observer-agent/monitoring">
              <Images data-icon="inline-start" />
              Monitoring Data
            </Link>
          </Button>
          <RequestFullReportCommandForm
            action={requestAllAgentMonitoringAction}
            label="Get Monitoring All Agents"
            confirmMessage="Minta semua agent aktif mengirim data sensor (suhu/fan/GPU/RAM/baterai) pada heartbeat berikutnya?"
            disabled={!canTriggerCommands}
          />
          <RequestFullReportCommandForm
            action={requestAllAgentSpecsAction}
            label="Get All Agent Specs Now"
            confirmMessage="Minta semua agent aktif mengirim full report pada heartbeat berikutnya?"
            disabled={!canTriggerCommands}
          />
        </div>
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
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Devices</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {query
                ? `${filtered.length} dari ${derived.length} device cocok dengan "${query}".`
                : `${derived.length} device terdaftar.`}
            </p>
          </div>
          <form method="GET" className="flex items-center gap-2">
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Cari hostname, user, IP, MAC, versi…"
              className="h-9 w-full rounded-md border bg-transparent px-3 text-sm sm:w-72"
            />
            <Button type="submit" size="sm" variant="outline">
              <Search data-icon="inline-start" />
              Cari
            </Button>
            {query ? (
              <Button asChild size="sm" variant="ghost">
                <Link href="/tracker/observer-agent">Reset</Link>
              </Button>
            ) : null}
          </form>
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
                  <TableHead className="w-[120px] text-center">Version</TableHead>
                  <TableHead className="text-center">RAM</TableHead>
                  <TableHead className="text-center">Disk</TableHead>
                  <TableHead className="w-[130px]">Last seen</TableHead>
                  <TableHead className="sticky right-0 z-20 border-l bg-gray-100 text-center shadow-[-4px_0_8px_-6px_rgba(0,0,0,0.2)]">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.length ? (
                  pageRows.map(({ device, status }, index) => {
                    const aliasName =
                      (device as { aliasName?: string | null }).aliasName ?? null;
                    const agentVersion = getDeviceAgentVersion(device);
                    const isOutdated =
                      Boolean(agentVersion) &&
                      Boolean(latestRelease) &&
                      compareSemver(agentVersion, latestRelease!.version) === -1;
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
                          {agentVersion ? (
                            <div className="flex flex-col items-center gap-1">
                              <span className="font-mono text-xs">{agentVersion}</span>
                              {isOutdated ? (
                                <Badge className="border-amber-300 bg-amber-100 text-amber-800">
                                  OUTDATED
                                </Badge>
                              ) : null}
                            </div>
                          ) : (
                            "-"
                          )}
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
                    <TableCell colSpan={13} className="h-24 text-center text-muted-foreground">
                      {query
                        ? `Tidak ada device yang cocok dengan "${query}".`
                        : "Belum ada device masuk. Coba jalankan agent dan cek endpoint `POST /api/agent/*`."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {filtered.length > DEVICES_PER_PAGE ? (
            <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
              <p className="text-sm text-muted-foreground">
                Menampilkan {(currentPage - 1) * DEVICES_PER_PAGE + 1}–
                {Math.min(currentPage * DEVICES_PER_PAGE, filtered.length)} dari{" "}
                {filtered.length} device
              </p>
              <div className="flex items-center gap-2">
                <Button
                  asChild={currentPage > 1}
                  size="sm"
                  variant="outline"
                  disabled={currentPage <= 1}
                >
                  {currentPage > 1 ? (
                    <Link href={buildPageHref(currentPage - 1)}>
                      <ChevronLeft data-icon="inline-start" />
                      Sebelumnya
                    </Link>
                  ) : (
                    <span>
                      <ChevronLeft data-icon="inline-start" />
                      Sebelumnya
                    </span>
                  )}
                </Button>
                <span className="text-sm text-muted-foreground">
                  Halaman {currentPage} / {totalPages}
                </span>
                <Button
                  asChild={currentPage < totalPages}
                  size="sm"
                  variant="outline"
                  disabled={currentPage >= totalPages}
                >
                  {currentPage < totalPages ? (
                    <Link href={buildPageHref(currentPage + 1)}>
                      Berikutnya
                      <ChevronRight data-icon="inline-end" />
                    </Link>
                  ) : (
                    <span>
                      Berikutnya
                      <ChevronRight data-icon="inline-end" />
                    </span>
                  )}
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

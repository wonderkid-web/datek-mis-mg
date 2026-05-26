import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  computeObserverDeviceStatus,
  getObserverDeviceList,
} from "@/lib/observerAgentService";

export const dynamic = "force-dynamic";

type Severity = "CRITICAL" | "WARNING";

type IssueRow = {
  id: number;
  deviceId: string;
  hostname: string;
  aliasName: string | null;
  ipAddress: string | null;
  publicIp: string | null;
  lastSeen: Date | null;
  severity: Severity;
  driveLetter: string;
  freePercent: number | null;
  operationLabel: "ONLINE" | "OFFLINE/STALE" | "UNKNOWN";
};

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

function StatusBadge({
  label,
  variant,
}: {
  label: string;
  variant: "ok" | "warn" | "crit" | "muted";
}) {
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

function getOperationLabel(input: {
  online: boolean;
  offline: boolean;
  stale: boolean;
}): IssueRow["operationLabel"] {
  if (input.online) return "ONLINE";
  if (input.offline || input.stale) return "OFFLINE/STALE";
  return "UNKNOWN";
}

function severityRank(severity: Severity) {
  return severity === "CRITICAL" ? 0 : 1;
}

function operationRank(label: IssueRow["operationLabel"]) {
  if (label === "ONLINE") return 0;
  if (label === "OFFLINE/STALE") return 2;
  return 1;
}

export default async function ObserverAgentDiskIssuesPage() {
  const devices = await getObserverDeviceList();

  const issues: IssueRow[] = [];
  const noStorageData = [] as Array<{
    id: number;
    hostname: string;
    aliasName: string | null;
    deviceId: string;
    lastSeen: Date | null;
  }>;

  for (const device of devices) {
    const aliasName =
      (device as { aliasName?: string | null }).aliasName ?? null;

    const status = computeObserverDeviceStatus({
      lastSeen: device.lastSeen,
      lastReportAt: device.lastReportAt,
      ramGb: device.hardwareSpec?.ramGb ?? null,
      drives: device.storageDrives.map((drive) => ({
        freePercent: drive.freePercent,
        status: drive.status,
      })),
    });
    const operationLabel = getOperationLabel(status);

    if (device.storageDrives.length === 0) {
      noStorageData.push({
        id: device.id,
        hostname: device.hostname,
        aliasName,
        deviceId: device.deviceId,
        lastSeen: device.lastSeen,
      });
      continue;
    }

    const issueDrives = device.storageDrives.filter((drive) => {
      if (drive.status === "CRITICAL" || drive.status === "WARNING") return true;
      return typeof drive.freePercent === "number" && drive.freePercent < 15;
    });

    if (issueDrives.length === 0) {
      continue;
    }

    const sortedIssueDrives = issueDrives.sort((a, b) => {
      const aRank = a.status === "CRITICAL" ? 0 : 1;
      const bRank = b.status === "CRITICAL" ? 0 : 1;
      if (aRank !== bRank) return aRank - bRank;
      const aFree = typeof a.freePercent === "number" ? a.freePercent : 999;
      const bFree = typeof b.freePercent === "number" ? b.freePercent : 999;
      return aFree - bFree;
    });

    const worstDrive = sortedIssueDrives[0];
    const severity: Severity =
      worstDrive.status === "CRITICAL" ||
      (typeof worstDrive.freePercent === "number" && worstDrive.freePercent < 10)
        ? "CRITICAL"
        : "WARNING";

    issues.push({
      id: device.id,
      deviceId: device.deviceId,
      hostname: device.hostname,
      aliasName,
      ipAddress: device.ipAddress,
      publicIp: device.publicIp,
      lastSeen: device.lastSeen,
      severity,
      driveLetter: worstDrive.driveLetter,
      freePercent:
        typeof worstDrive.freePercent === "number" ? worstDrive.freePercent : null,
      operationLabel,
    });
  }

  const sortedIssues = issues.sort((a, b) => {
    const sev = severityRank(a.severity) - severityRank(b.severity);
    if (sev !== 0) return sev;
    const op = operationRank(a.operationLabel) - operationRank(b.operationLabel);
    if (op !== 0) return op;
    const freeA = typeof a.freePercent === "number" ? a.freePercent : 999;
    const freeB = typeof b.freePercent === "number" ? b.freePercent : 999;
    if (freeA !== freeB) return freeA - freeB;
    return b.id - a.id;
  });

  const summary = sortedIssues.reduce(
    (acc, row) => {
      if (row.severity === "CRITICAL") acc.critical += 1;
      if (row.severity === "WARNING") acc.warning += 1;
      if (row.operationLabel === "ONLINE") acc.online += 1;
      if (row.operationLabel === "OFFLINE/STALE") acc.offlineStale += 1;
      return acc;
    },
    { critical: 0, warning: 0, online: 0, offlineStale: 0 }
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Disk Issues</h2>
        <p className="text-sm text-muted-foreground">
          Prioritas kerja disk berdasarkan severity dulu (critical/warning), lalu
          context operasional (online/offline-stale).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-sm text-muted-foreground">Critical</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{summary.critical}</CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-sm text-muted-foreground">Warning</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{summary.warning}</CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-sm text-muted-foreground">Online</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{summary.online}</CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-sm text-muted-foreground">Offline/Stale</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{summary.offlineStale}</CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-sm text-muted-foreground">No Storage Data</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{noStorageData.length}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prioritized Disk Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table className="min-w-[1180px]">
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead>Hostname</TableHead>
                  <TableHead>Alias</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Drive</TableHead>
                  <TableHead className="text-right">Free %</TableHead>
                  <TableHead>Operasional</TableHead>
                  <TableHead>IP Local</TableHead>
                  <TableHead>IP Public</TableHead>
                  <TableHead>Last Seen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedIssues.length ? (
                  sortedIssues.map((row) => (
                    <TableRow key={`${row.deviceId}-${row.driveLetter}`} className="even:bg-emerald-50/40">
                      <TableCell className="font-medium">
                        <Link
                          className="underline underline-offset-4"
                          href={`/tracker/observer-agent/${row.deviceId}`}
                        >
                          {row.hostname}
                        </Link>
                        <div className="text-xs text-muted-foreground">{row.deviceId}</div>
                      </TableCell>
                      <TableCell>{row.aliasName ?? "-"}</TableCell>
                      <TableCell>
                        <StatusBadge
                          label={row.severity}
                          variant={row.severity === "CRITICAL" ? "crit" : "warn"}
                        />
                      </TableCell>
                      <TableCell>{row.driveLetter}</TableCell>
                      <TableCell className="text-right">
                        {typeof row.freePercent === "number"
                          ? row.freePercent.toFixed(1)
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          label={row.operationLabel}
                          variant={
                            row.operationLabel === "ONLINE"
                              ? "ok"
                              : row.operationLabel === "OFFLINE/STALE"
                                ? "crit"
                                : "muted"
                          }
                        />
                      </TableCell>
                      <TableCell>{row.ipAddress ?? "-"}</TableCell>
                      <TableCell>{row.publicIp ?? "-"}</TableCell>
                      <TableCell>
                        <div className="font-medium">{formatRelative(row.lastSeen)}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDateTime(row.lastSeen)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                      Tidak ada device dengan disk warning/critical.
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
          <CardTitle>No Storage Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table className="min-w-[860px]">
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead>Hostname</TableHead>
                  <TableHead>Alias</TableHead>
                  <TableHead>Device ID</TableHead>
                  <TableHead>Last Seen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {noStorageData.length ? (
                  noStorageData.map((row) => (
                    <TableRow key={row.id} className="even:bg-emerald-50/40">
                      <TableCell className="font-medium">
                        <Link
                          className="underline underline-offset-4"
                          href={`/tracker/observer-agent/${row.deviceId}`}
                        >
                          {row.hostname}
                        </Link>
                      </TableCell>
                      <TableCell>{row.aliasName ?? "-"}</TableCell>
                      <TableCell className="font-mono text-xs">{row.deviceId}</TableCell>
                      <TableCell>
                        <div className="font-medium">{formatRelative(row.lastSeen)}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDateTime(row.lastSeen)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-20 text-center text-muted-foreground">
                      Semua device sudah punya data storage.
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

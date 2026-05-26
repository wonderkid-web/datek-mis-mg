import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getObserverDeviceList, computeObserverDeviceStatus } from "@/lib/observerAgentService";

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

export default async function ObserverAgentPage() {
  const devices = await getObserverDeviceList();

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
      <div>
        <h2 className="text-xl font-semibold">Observer Agents</h2>
        <p className="text-sm text-muted-foreground">
          Monitoring dasar request register/heartbeat/report dari Observer Agent.
        </p>
      </div>

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
          <CardTitle>Devices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table className="min-w-[1140px]">
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead>Hostname</TableHead>
                  <TableHead>Alias</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>IP Local</TableHead>
                  <TableHead>IP Public</TableHead>
                  <TableHead>OS</TableHead>
                  <TableHead className="text-center">RAM</TableHead>
                  <TableHead className="text-center">Disk</TableHead>
                  <TableHead>Last seen</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {derived.length ? (
                  derived.map(({ device, status }) => {
                    const overallVariant = status.diskCritical || status.offline ? "crit" : status.diskWarning || status.stale || status.ramBelowStandard ? "warn" : status.online ? "ok" : "muted";
                    const overallLabel = status.offline
                      ? "OFFLINE"
                      : status.online
                      ? "ONLINE"
                      : "UNKNOWN";

                    const diskLabel = status.diskCritical ? "CRITICAL" : status.diskWarning ? "WARNING" : "OK";
                    const diskVariant = status.diskCritical ? "crit" : status.diskWarning ? "warn" : "ok";

                    return (
                      <TableRow key={device.id} className="even:bg-emerald-50/40">
                        <TableCell className="font-medium">
                          <Link className="underline underline-offset-4" href={`/tracker/observer-agent/${device.deviceId}`}>
                            {device.hostname}
                          </Link>
                          <div className="text-xs text-muted-foreground">{device.deviceId}</div>
                        </TableCell>
                        <TableCell>{device.aliasName ?? "-"}</TableCell>
                        <TableCell>{device.username ?? "-"}</TableCell>
                        <TableCell>{device.ipAddress ?? "-"}</TableCell>
                        <TableCell>{device.publicIp ?? "-"}</TableCell>
                        <TableCell>
                          <div className="font-medium">{device.osName ?? "-"}</div>
                          <div className="text-xs text-muted-foreground">
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
                        <TableCell className="text-center">
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
                    <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
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

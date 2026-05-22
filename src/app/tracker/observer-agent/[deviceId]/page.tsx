import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getObserverDeviceByDeviceId, computeObserverDeviceStatus, deleteObserverDeviceByDeviceId } from "@/lib/observerAgentService";
import { DeleteDeviceForm } from "./DeleteDeviceForm";

export const dynamic = "force-dynamic";

function formatDateTime(date: Date | null) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function formatDateOnly(date: Date | null) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function healthVariant(input: { healthStatus: string | null; predictedFailure: boolean | null; temperatureC: number | null }) {
  const status = (input.healthStatus ?? "").toLowerCase();
  if (input.predictedFailure) return "crit";
  if (typeof input.temperatureC === "number" && input.temperatureC >= 60) return "warn";
  if (status === "critical") return "crit";
  if (status === "warning") return "warn";
  if (status === "healthy") return "ok";
  return "muted";
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

export default async function ObserverAgentDetailPage({
  params,
}: {
  params: Promise<{ deviceId: string }>;
}) {
  const { deviceId } = await params;
  const device = await getObserverDeviceByDeviceId(deviceId);
  if (!device) notFound();

  async function deleteDeviceAction() {
    "use server";
    await deleteObserverDeviceByDeviceId(device!.deviceId ?? "0");
    redirect("/tracker/observer-agent");
  }

  const status = computeObserverDeviceStatus({
    lastSeen: device.lastSeen,
    lastReportAt: device.lastReportAt,
    ramGb: device.hardwareSpec?.ramGb ?? null,
    drives: device.storageDrives.map((d) => ({ freePercent: d.freePercent, status: d.status })),
  });

  const overallVariant = status.diskCritical || status.offline ? "crit" : status.diskWarning || status.stale || status.ramBelowStandard ? "warn" : status.online ? "ok" : "muted";
  const overallLabel = status.offline ? "OFFLINE" : status.online ? "ONLINE" : "UNKNOWN";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">{device.hostname}</h2>
          <p className="text-sm text-muted-foreground">{device.deviceId}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge label={overallLabel} variant={overallVariant} />
            {status.diskCritical && <Badge variant="outline">DISK CRITICAL</Badge>}
            {status.diskWarning && <Badge variant="outline">DISK WARNING</Badge>}
            {status.ramBelowStandard && <Badge variant="outline">RAM &lt; 8GB</Badge>}
            {status.stale && <Badge variant="outline">STALE</Badge>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <DeleteDeviceForm hostname={device.hostname} action={deleteDeviceAction} />
          <Link className="text-sm underline underline-offset-4" href="/tracker/observer-agent">
            Back
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Identity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Username</span><span className="font-medium">{device.username ?? "-"}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">IP</span><span className="font-medium">{device.ipAddress ?? "-"}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">OS</span><span className="font-medium">{device.osName ?? "-"}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">OS Version</span><span className="font-medium">{device.osVersion ?? "-"}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">OS Build</span><span className="font-medium">{device.osBuild ?? "-"}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Agent Version</span><span className="font-medium">{device.agentVersion ?? "-"}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Last Seen</span><span className="font-medium">{formatDateTime(device.lastSeen)}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Last Report</span><span className="font-medium">{formatDateTime(device.lastReportAt)}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hardware</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">CPU</span><span className="font-medium">{device.hardwareSpec?.cpu ?? "-"}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">RAM (GB)</span><span className="font-medium">{device.hardwareSpec?.ramGb ?? "-"}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Manufacturer</span><span className="font-medium">{device.hardwareSpec?.manufacturer ?? "-"}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Model</span><span className="font-medium">{device.hardwareSpec?.model ?? "-"}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Serial</span><span className="font-medium">{device.hardwareSpec?.serialNumber ?? "-"}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">GPU</span><span className="font-medium">{device.hardwareSpec?.gpu ?? "-"}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Motherboard</span><span className="font-medium">{device.hardwareSpec?.motherboard ?? "-"}</span></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Storage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead>Drive</TableHead>
                  <TableHead className="text-right">Total (GB)</TableHead>
                  <TableHead className="text-right">Free (GB)</TableHead>
                  <TableHead className="text-right">Free %</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {device.storageDrives.length ? (
                  device.storageDrives.map((drive) => {
                    const variant = drive.status === "CRITICAL" ? "crit" : drive.status === "WARNING" ? "warn" : drive.status === "OK" ? "ok" : "muted";
                    return (
                      <TableRow key={drive.id} className="even:bg-emerald-50/40">
                        <TableCell className="font-medium">{drive.driveLetter}</TableCell>
                        <TableCell className="text-right">{drive.totalGb ?? "-"}</TableCell>
                        <TableCell className="text-right">{drive.freeGb ?? "-"}</TableCell>
                        <TableCell className="text-right">{typeof drive.freePercent === "number" ? drive.freePercent.toFixed(1) : "-"}</TableCell>
                        <TableCell className="text-center">
                          <StatusBadge label={drive.status ?? "-"} variant={variant} />
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                      Belum ada data storage.
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
          <CardTitle>Storage Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table className="min-w-[980px]">
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead>Disk</TableHead>
                  <TableHead>Serial</TableHead>
                  <TableHead>Media</TableHead>
                  <TableHead>Bus</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Predicted</TableHead>
                  <TableHead className="text-center">Temp (°C)</TableHead>
                  <TableHead>Collected</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {device.storageHealth.length ? (
                  device.storageHealth.map((row) => {
                    const variant = healthVariant({
                      healthStatus: row.healthStatus,
                      predictedFailure: row.predictedFailure,
                      temperatureC: row.temperatureC,
                    });
                    const label =
                      row.predictedFailure ? "CRITICAL" : row.healthStatus ?? "Unknown";
                    return (
                      <TableRow key={row.id} className="even:bg-emerald-50/40">
                        <TableCell className="font-medium">
                          <div>{row.deviceName ?? row.model ?? "-"}</div>
                          <div className="text-xs text-muted-foreground">{row.diskDeviceId}</div>
                        </TableCell>
                        <TableCell>{row.serialNumber ?? "-"}</TableCell>
                        <TableCell>{row.mediaType ?? "-"}</TableCell>
                        <TableCell>{row.busType ?? "-"}</TableCell>
                        <TableCell>
                          <StatusBadge label={label} variant={variant} />
                          {row.operationalStatus && (
                            <div className="mt-1 text-xs text-muted-foreground">
                              {row.operationalStatus}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {row.predictedFailure === null ? "-" : row.predictedFailure ? "YES" : "NO"}
                        </TableCell>
                        <TableCell className="text-center">
                          {typeof row.temperatureC === "number" ? row.temperatureC : "-"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{formatDateTime(row.collectedAt)}</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-20 text-center text-muted-foreground">
                      Belum ada storage health. Pastikan agent mengirim `storage_health` pada `POST /api/agent/report`.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-md border">
              <Table className="min-w-[720px]">
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead>Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {device.agentLogs.length ? (
                    device.agentLogs.map((log) => (
                      <TableRow key={log.id} className="even:bg-emerald-50/40">
                        <TableCell className="whitespace-nowrap">{formatDateTime(log.createdAt)}</TableCell>
                        <TableCell>{log.eventType}</TableCell>
                        <TableCell>{log.logLevel ?? "-"}</TableCell>
                        <TableCell className="max-w-[420px] truncate" title={log.message}>{log.message}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-20 text-center text-muted-foreground">
                        Belum ada log.
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
            <CardTitle>Sync History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-md border">
              <Table className="min-w-[640px]">
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead>Received</TableHead>
                    <TableHead>Kind</TableHead>
                    <TableHead>Collected</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {device.syncHistory.length ? (
                    device.syncHistory.map((sync) => (
                      <TableRow key={sync.id} className="even:bg-emerald-50/40">
                        <TableCell className="whitespace-nowrap">{formatDateTime(sync.receivedAt)}</TableCell>
                        <TableCell>{sync.syncKind}</TableCell>
                        <TableCell className="whitespace-nowrap">{formatDateTime(sync.collectedAt)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-20 text-center text-muted-foreground">
                        Belum ada sync history.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Installed Apps (Top 200)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table className="min-w-[980px]">
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead>Name</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Publisher</TableHead>
                  <TableHead>Install Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {device.installedApps.length ? (
                    device.installedApps.slice(0, 200).map((app) => (
                      <TableRow key={app.id} className="even:bg-emerald-50/40">
                        <TableCell className="font-medium">{app.appName}</TableCell>
                        <TableCell>{app.appVersion ?? "-"}</TableCell>
                        <TableCell>{app.publisher ?? "-"}</TableCell>
                        <TableCell className="whitespace-nowrap">{formatDateOnly(app.installDate)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-20 text-center text-muted-foreground">
                      Belum ada installed apps.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {device.installedApps.length > 200 && (
            <p className="mt-2 text-xs text-muted-foreground">
              Menampilkan 200 apps pertama (total {device.installedApps.length}).
            </p>
          )}
        </CardContent>
      </Card>

    </div>
  );
}

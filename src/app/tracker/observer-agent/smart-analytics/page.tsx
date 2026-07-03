import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  getObserverCapacityForecastOverview,
  type ObserverCapacityForecastRow,
  type ObserverCapacityTrendPoint,
} from "@/lib/observerAgentForecastService";

export const dynamic = "force-dynamic";

function formatDateTime(date: Date | null) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function formatRelative(date: Date | null) {
  if (!date) return "-";
  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) return "baru saja";
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "baru saja";
  if (mins < 60) return `${mins}m lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours}j lalu`;
  const days = Math.floor(hours / 24);
  return `${days}h lalu`;
}

function formatPercent(value: number | null) {
  return typeof value === "number" ? `${value.toFixed(1)}%` : "-";
}

function formatGb(value: number | null) {
  return typeof value === "number" ? `${value} GB` : "-";
}

function formatEta(days: number | null) {
  if (typeof days !== "number") return "-";
  if (days <= 0) return "sekarang";
  if (days < 1) return "< 1 hari";
  if (days < 30) return `${Math.ceil(days)} hari`;
  return `${(days / 30).toFixed(1)} bln`;
}

function severityBadgeVariant(
  severity: ObserverCapacityForecastRow["severity"]
) {
  if (severity === "CRITICAL") {
    return "bg-red-100 text-red-800 border-red-300";
  }
  if (severity === "WARNING") {
    return "bg-amber-100 text-amber-800 border-amber-300";
  }
  if (severity === "WATCH") {
    return "bg-sky-100 text-sky-800 border-sky-300";
  }
  return "bg-emerald-100 text-emerald-800 border-emerald-300";
}

function recommendationBadgeVariant(
  kind: ObserverCapacityForecastRow["recommendationKind"]
) {
  if (kind === "UPGRADE") {
    return "bg-red-100 text-red-800 border-red-300";
  }
  if (kind === "CLEANUP") {
    return "bg-amber-100 text-amber-800 border-amber-300";
  }
  if (kind === "MONITOR") {
    return "bg-sky-100 text-sky-800 border-sky-300";
  }
  return "bg-slate-100 text-slate-800 border-slate-300";
}

function TrendSparkline({
  points,
}: {
  points: ObserverCapacityTrendPoint[];
}) {
  if (points.length < 2) {
    return <div className="text-xs text-muted-foreground">histori belum cukup</div>;
  }

  const width = 120;
  const height = 34;
  const values = points.map((point) => point.freePercent);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const coords = points.map((point, index) => {
    const x =
      points.length === 1 ? width / 2 : (index / (points.length - 1)) * width;
    const y = height - ((point.freePercent - min) / span) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return (
    <svg
      aria-hidden="true"
      className="h-[34px] w-[120px]"
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
    >
      <path
        d={`M ${coords.join(" L ")}`}
        stroke="currentColor"
        strokeWidth="2"
        className="text-emerald-600"
      />
    </svg>
  );
}

export default async function ObserverAgentSmartAnalyticsPage() {
  const forecast = await getObserverCapacityForecastOverview();

  const headline =
    forecast.summary.forecastThirtyDays > 0
      ? `Ada ${forecast.summary.forecastThirtyDays} device yang diproyeksikan menyentuh 10% free space dalam 30 hari.`
      : "Belum ada device yang diproyeksikan masuk zona critical dalam 30 hari.";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Smart Analytics</h2>
        <p className="text-sm text-muted-foreground">
          Forecast kapasitas dihitung dari histori snapshot harian `freePercent`
          selama {forecast.lookbackDays} hari terakhir. Threshold critical default
          memakai sisa free space 10%.
        </p>
      </div>

      <Card className="border-emerald-200 bg-emerald-50/70">
        <CardHeader className="space-y-1">
          <CardTitle className="text-base">Management Signal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-700">
          <p>{headline}</p>
          <p>
            Kandidat aksi bulan ini: {forecast.summary.cleanupCandidates} device
            untuk cleanup storage, {forecast.summary.upgradeCandidates} device
            untuk review upgrade SSD/storage.
          </p>
          <p className="text-xs text-slate-500">
            Data dibuat {formatDateTime(forecast.generatedAt)} WIB.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-sm text-muted-foreground">Critical</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {forecast.summary.criticalDevices}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-sm text-muted-foreground">Warning</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {forecast.summary.warningDevices}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-sm text-muted-foreground">Watchlist</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {forecast.summary.watchDevices}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-sm text-muted-foreground">ETA &lt; 30 Hari</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {forecast.summary.forecastThirtyDays}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-sm text-muted-foreground">Upgrade Review</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {forecast.summary.upgradeCandidates}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-sm text-muted-foreground">Histori Kurang</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {forecast.summary.insufficientHistory}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Capacity Forecast per Device</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table className="min-w-[1440px]">
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead>Device</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Drive</TableHead>
                  <TableHead>Free Space</TableHead>
                  <TableHead>Trend</TableHead>
                  <TableHead>ETA 10%</TableHead>
                  <TableHead>ETA 0%</TableHead>
                  <TableHead>Rekomendasi</TableHead>
                  <TableHead>Last Seen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {forecast.rows.length ? (
                  forecast.rows.map((row) => (
                    <TableRow
                      key={`${row.deviceId}-${row.driveLetter}`}
                      className="even:bg-emerald-50/40"
                    >
                      <TableCell className="align-top">
                        <Link
                          className="font-medium underline underline-offset-4"
                          href={`/tracker/observer-agent/${row.deviceId}`}
                        >
                          {row.hostname}
                        </Link>
                        <div className="text-xs text-muted-foreground">
                          {row.aliasName ?? row.deviceId}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          <Badge variant="outline">{row.operationLabel}</Badge>
                          {!row.forecastReady && (
                            <Badge variant="outline">FORECAST LIMITED</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <Badge className={severityBadgeVariant(row.severity)}>
                          {row.severity}
                        </Badge>
                        {(row.hasPredictedFailure || row.hasWearConcern) && (
                          <div className="mt-2 text-xs text-red-700">
                            health storage butuh perhatian
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="font-medium">{row.driveLetter}</div>
                        <div className="text-xs text-muted-foreground">
                          total {formatGb(row.totalGb)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          sisa {formatGb(row.freeGb)}
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="text-lg font-semibold">
                          {formatPercent(row.latestFreePercent)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          snapshot {formatDateTime(row.latestCollectedAt)}
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <TrendSparkline points={row.trendPoints} />
                        <div className="mt-1 text-xs text-muted-foreground">
                          {typeof row.slopePercentPerWeek === "number"
                            ? `${row.slopePercentPerWeek.toFixed(2)}%/minggu`
                            : "tren belum stabil"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {row.sampleCount} snapshot harian
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="font-medium">{formatEta(row.daysToCritical)}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDateTime(row.projectedCriticalAt)}
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="font-medium">{formatEta(row.daysToFull)}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDateTime(row.projectedFullAt)}
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <Badge className={recommendationBadgeVariant(row.recommendationKind)}>
                          {row.recommendationLabel}
                        </Badge>
                        <div className="mt-2 max-w-xs text-xs text-muted-foreground">
                          {row.recommendationDetail}
                        </div>
                        <div className="mt-2 space-y-1">
                          {row.reasoning.slice(0, 2).map((reason) => (
                            <div key={reason} className="text-xs text-slate-600">
                              {reason}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="font-medium">{formatRelative(row.lastSeen)}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDateTime(row.lastSeen)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Belum ada histori storage yang bisa dipakai untuk forecasting.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Telemetri Kurang</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              Device di bawah ini sudah ada di monitoring, tapi belum punya cukup
              snapshot harian untuk forecast yang stabil.
            </p>
            <div className="space-y-2">
              {forecast.rows
                .filter((row) => !row.forecastReady)
                .slice(0, 8)
                .map((row) => (
                  <div
                    key={`limited-${row.deviceId}-${row.driveLetter}`}
                    className="rounded-md border p-3"
                  >
                    <div className="font-medium">
                      {row.hostname} ({row.driveLetter})
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {row.sampleCount} snapshot, span {row.historySpanDays.toFixed(1)} hari
                    </div>
                  </div>
                ))}
              {!forecast.rows.some((row) => !row.forecastReady) && (
                <div className="text-sm text-muted-foreground">
                  Semua device aktif sudah punya histori minimum untuk forecast.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>No Storage Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              Device berikut belum mengirim payload storage, jadi belum bisa masuk
              ke perhitungan kapasitas.
            </p>
            <div className="space-y-2">
              {forecast.noStorageData.slice(0, 8).map((device) => (
                <div key={device.deviceId} className="rounded-md border p-3">
                  <div className="font-medium">{device.hostname}</div>
                  <div className="text-xs text-muted-foreground">
                    {device.aliasName ?? device.deviceId}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    last seen {formatDateTime(device.lastSeen)}
                  </div>
                </div>
              ))}
              {forecast.noStorageData.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  Semua device sudah mengirim data storage dasar.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  BatteryCharging,
  CalendarDays,
  Camera,
  Cpu,
  ExternalLink,
  Fan,
  HardDrive,
  Images,
  MemoryStick,
  Monitor,
  Thermometer,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCurrentSession } from "@/lib/session";
import {
  deleteObserverAgentScreenshot,
  getObserverAgentMonitoringRetentionDays,
  listObserverAgentMonitoringDateKeys,
  listObserverAgentMonitoringMonthKeys,
  listObserverAgentScreenshotAlbums,
  summarizeObserverAgentMonitoringByMonth,
  type ObserverAgentMonitoringMonthlyRow,
  type ObserverAgentScreenshot,
} from "@/lib/observerAgentScreenshotStorage";
import { DeleteScreenshotButton } from "./DeleteScreenshotButton";

export const dynamic = "force-dynamic";

function formatBytes(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  let size = value;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function formatMetric(value: number | null, suffix: string) {
  return value !== null ? `${value}${suffix}` : null;
}

function MetricRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="flex min-w-0 items-center gap-2 text-muted-foreground">
        {icon}
        <span className="truncate">{label}</span>
      </dt>
      <dd
        className={
          value ? "shrink-0 font-medium tabular-nums" : "shrink-0 text-xs italic text-muted-foreground/70"
        }
      >
        {value ?? "tidak tersedia"}
      </dd>
    </div>
  );
}

function parseJakartaDateKey(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00+07:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateGroupTitle(dateKey: string) {
  const date = parseJakartaDateKey(dateKey);
  if (!date) return dateKey;

  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function formatDateTime(value: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function getScreenshotTitle(screenshot: ObserverAgentScreenshot) {
  return (
    screenshot.hostname?.trim() ||
    screenshot.deviceId?.trim() ||
    screenshot.originalName?.trim() ||
    "Unknown device"
  );
}

async function deleteScreenshotAction(formData: FormData) {
  "use server";

  const session = await getCurrentSession();
  if (!session) {
    redirect("/login");
  }

  const user = session.user as { role?: string } | undefined;
  if (user?.role !== "administrator") {
    throw new Error("Hanya administrator yang boleh menghapus screenshot.");
  }

  const dateKey = String(formData.get("date_key") ?? "").trim();
  const fileName = String(formData.get("file_name") ?? "").trim();

  await deleteObserverAgentScreenshot({ dateKey, fileName });
  revalidatePath("/tracker/observer-agent/screenshots");
}

function ScreenshotCard({
  screenshot,
  priority,
  canDelete,
}: {
  screenshot: ObserverAgentScreenshot;
  priority: boolean;
  canDelete: boolean;
}) {
  const title = getScreenshotTitle(screenshot);
  const sensorCount = [
    screenshot.cpuTemperatureC,
    screenshot.cpuLoadPercent,
    screenshot.fanRpm,
    screenshot.memoryAvailableGb,
    screenshot.memoryLoadPercent,
    screenshot.batteryChargePercent,
  ].filter((value) => value !== null).length + screenshot.gpu.length;

  return (
    <Card className="overflow-hidden py-0">
      {screenshot.url ? (
        <a
          href={screenshot.url}
          target="_blank"
          rel="noreferrer"
          className="relative block aspect-video bg-muted"
        >
          <Image
            src={screenshot.url}
            alt={`Screenshot ${title}`}
            fill
            unoptimized
            priority={priority}
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-contain"
          />
        </a>
      ) : null}
      <CardHeader className="px-4 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="truncate text-sm">
              {title}
            </CardTitle>
            <CardDescription>
              {formatDateTime(screenshot.uploadedAt)}
            </CardDescription>
          </div>
          {screenshot.hasImage ? (
            <Badge variant="outline">{formatBytes(screenshot.sizeBytes)}</Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-4 pb-4 text-sm">
        {sensorCount === 0 ? (
          <p className="rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
            Agent terhubung, tapi probe sensor tidak mengirim satu pun nilai.
            Cek apakah sensor_agent.exe jalan dengan hak administrator di device ini.
          </p>
        ) : null}

        <dl className="grid gap-1.5">
          <MetricRow
            icon={<Thermometer className="size-4 shrink-0" />}
            label="Suhu CPU"
            value={formatMetric(screenshot.cpuTemperatureC, " °C")}
          />
          <MetricRow
            icon={<Cpu className="size-4 shrink-0" />}
            label="Load CPU"
            value={formatMetric(screenshot.cpuLoadPercent, " %")}
          />
          <MetricRow
            icon={<Fan className="size-4 shrink-0" />}
            label="Fan"
            value={formatMetric(screenshot.fanRpm, " RPM")}
          />
          <MetricRow
            icon={<MemoryStick className="size-4 shrink-0" />}
            label="RAM sisa"
            value={formatMetric(screenshot.memoryAvailableGb, " GB")}
          />
          <MetricRow
            icon={<MemoryStick className="size-4 shrink-0" />}
            label="RAM terpakai"
            value={formatMetric(screenshot.memoryLoadPercent, " %")}
          />
          <MetricRow
            icon={<BatteryCharging className="size-4 shrink-0" />}
            label="Baterai"
            value={formatMetric(screenshot.batteryChargePercent, " %")}
          />
          {screenshot.gpu.map((gpu, index) => (
            <MetricRow
              key={`${gpu.name ?? "gpu"}-${index}`}
              icon={<Monitor className="size-4 shrink-0" />}
              label={gpu.name ?? `GPU ${index + 1}`}
              value={
                [
                  gpu.temperature !== null ? `${gpu.temperature} °C` : null,
                  gpu.load !== null ? `${gpu.load} %` : null,
                ]
                  .filter(Boolean)
                  .join(" · ") || null
              }
            />
          ))}
        </dl>

        <div className="grid gap-1 border-t pt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Monitor className="size-3.5 shrink-0" />
            <span className="truncate font-mono">{screenshot.deviceId ?? "-"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Camera className="size-3.5 shrink-0" />
            <span className="truncate">
              {screenshot.source ?? "-"}
              {screenshot.capturedAt
                ? ` · diambil ${formatDateTime(screenshot.capturedAt)}`
                : ""}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {screenshot.url ? (
            <Button asChild variant="outline" size="sm">
              <a href={screenshot.url} target="_blank" rel="noreferrer">
                <ExternalLink data-icon="inline-start" />
                Open Image
              </a>
            </Button>
          ) : null}
          {canDelete ? (
            <DeleteScreenshotButton
              action={deleteScreenshotAction}
              dateKey={screenshot.dateKey}
              fileName={screenshot.fileName}
              title={title}
            />
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function formatMonthTitle(monthKey: string) {
  const date = new Date(`${monthKey}-01T00:00:00+07:00`);
  if (Number.isNaN(date.getTime())) return monthKey;

  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function MonthlyTable({ rows }: { rows: ObserverAgentMonitoringMonthlyRow[] }) {
  if (!rows.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Belum Ada Data Bulan Ini</CardTitle>
          <CardDescription>
            Pilih bulan lain, atau tunggu agent mengirim data monitoring.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rata-rata per Device</CardTitle>
        <CardDescription>
          Nilai dihitung dari record yang punya angka saja; sensor yang tidak
          tersedia tidak ikut menurunkan rata-rata.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border">
          <Table className="min-w-[1000px]">
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="w-[200px]">Device</TableHead>
                <TableHead className="text-center">Record</TableHead>
                <TableHead className="text-center">Suhu CPU rata²</TableHead>
                <TableHead className="text-center">Suhu CPU maks</TableHead>
                <TableHead className="text-center">Load CPU</TableHead>
                <TableHead className="text-center">Fan</TableHead>
                <TableHead className="text-center">RAM sisa</TableHead>
                <TableHead className="text-center">RAM terpakai</TableHead>
                <TableHead className="text-center">Baterai</TableHead>
                <TableHead>Terakhir kirim</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.hostname} className="even:bg-emerald-50/40">
                  <TableCell>
                    <div className="font-medium">{row.hostname}</div>
                    <div className="break-all font-mono text-xs text-muted-foreground">
                      {row.deviceId ?? "-"}
                    </div>
                  </TableCell>
                  <TableCell className="text-center tabular-nums">
                    {row.recordCount}
                  </TableCell>
                  <TableCell className="text-center tabular-nums">
                    {formatMetric(row.cpuTemperatureC, " °C") ?? "-"}
                  </TableCell>
                  <TableCell className="text-center tabular-nums">
                    {formatMetric(row.cpuTemperatureMaxC, " °C") ?? "-"}
                  </TableCell>
                  <TableCell className="text-center tabular-nums">
                    {formatMetric(row.cpuLoadPercent, " %") ?? "-"}
                  </TableCell>
                  <TableCell className="text-center tabular-nums">
                    {formatMetric(row.fanRpm, " RPM") ?? "-"}
                  </TableCell>
                  <TableCell className="text-center tabular-nums">
                    {formatMetric(row.memoryAvailableGb, " GB") ?? "-"}
                  </TableCell>
                  <TableCell className="text-center tabular-nums">
                    {formatMetric(row.memoryLoadPercent, " %") ?? "-"}
                  </TableCell>
                  <TableCell className="text-center tabular-nums">
                    {formatMetric(row.batteryChargePercent, " %") ?? "-"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatDateTime(row.lastSeenAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function ObserverAgentScreenshotsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; date?: string; month?: string }>;
}) {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/login");
  }
  const isAdmin =
    (session.user as { role?: string } | undefined)?.role === "administrator";

  const params = await searchParams;
  const isMonthly = params.view === "monthly";

  const [availableDates, availableMonths] = await Promise.all([
    listObserverAgentMonitoringDateKeys(),
    listObserverAgentMonitoringMonthKeys(),
  ]);

  const selectedDate =
    params.date && availableDates.includes(params.date)
      ? params.date
      : availableDates[0] ?? null;
  const selectedMonth =
    params.month && availableMonths.includes(params.month)
      ? params.month
      : availableMonths[0] ?? null;

  const albums =
    !isMonthly && selectedDate
      ? await listObserverAgentScreenshotAlbums({
          dateKeys: [selectedDate],
          limitDays: 1,
          limitPerDay: 200,
        })
      : [];

  const monthlyRows =
    isMonthly && selectedMonth
      ? await summarizeObserverAgentMonitoringByMonth(selectedMonth)
      : [];

  const dayRecordCount = albums[0]?.count ?? 0;
  const monthlyRecordCount = monthlyRows.reduce(
    (sum, row) => sum + row.recordCount,
    0
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <h2 className="text-xl font-semibold">Observer Monitoring</h2>
          <p className="text-sm text-muted-foreground">
            Data sensor hardware dari agent. Tab Daily menampilkan record per
            tanggal, tab Monthly merangkum rata-rata per device dalam sebulan.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/tracker/observer-agent">
            <ArrowLeft data-icon="inline-start" />
            Observer Agents
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b pb-4">
        <Button asChild variant={isMonthly ? "outline" : "default"} size="sm">
          <Link href="/tracker/observer-agent/screenshots">
            <CalendarDays data-icon="inline-start" />
            Daily
          </Link>
        </Button>
        <Button asChild variant={isMonthly ? "default" : "outline"} size="sm">
          <Link href="/tracker/observer-agent/screenshots?view=monthly">
            <TrendingUp data-icon="inline-start" />
            Monthly
          </Link>
        </Button>
      </div>

      {isMonthly ? (
        <>
          <form method="GET" className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="view" value="monthly" />
            <div className="grid gap-1.5">
              <label htmlFor="month" className="text-sm font-medium">
                Pilih bulan
              </label>
              <select
                id="month"
                name="month"
                defaultValue={selectedMonth ?? ""}
                className="h-9 rounded-md border bg-transparent px-3 text-sm"
              >
                {availableMonths.length ? (
                  availableMonths.map((monthKey) => (
                    <option key={monthKey} value={monthKey}>
                      {formatMonthTitle(monthKey)}
                    </option>
                  ))
                ) : (
                  <option value="">Belum ada data</option>
                )}
              </select>
            </div>
            <Button type="submit" size="sm" disabled={!availableMonths.length}>
              Tampilkan
            </Button>
          </form>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="size-4" />
                  Bulan
                </CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">
                {selectedMonth ? formatMonthTitle(selectedMonth) : "-"}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Monitor className="size-4" />
                  Device
                </CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">
                {monthlyRows.length}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Images className="size-4" />
                  Total Record
                </CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">
                {monthlyRecordCount}
              </CardContent>
            </Card>
          </div>

          <MonthlyTable rows={monthlyRows} />
        </>
      ) : (
        <>
          <form method="GET" className="flex flex-wrap items-end gap-3">
            <div className="grid gap-1.5">
              <label htmlFor="date" className="text-sm font-medium">
                Pilih tanggal
              </label>
              <select
                id="date"
                name="date"
                defaultValue={selectedDate ?? ""}
                className="h-9 rounded-md border bg-transparent px-3 text-sm"
              >
                {availableDates.length ? (
                  availableDates.map((dateKey) => (
                    <option key={dateKey} value={dateKey}>
                      {formatDateGroupTitle(dateKey)}
                    </option>
                  ))
                ) : (
                  <option value="">Belum ada data</option>
                )}
              </select>
            </div>
            <Button type="submit" size="sm" disabled={!availableDates.length}>
              Tampilkan
            </Button>
          </form>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="size-4" />
                  Tanggal
                </CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">
                {selectedDate ?? "-"}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Images className="size-4" />
                  Record Hari Ini
                </CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">
                {dayRecordCount}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                  <HardDrive className="size-4" />
                  Retensi
                </CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">
                {getObserverAgentMonitoringRetentionDays()} hari
              </CardContent>
            </Card>
          </div>

          {albums.length ? (
            albums.map((album) => (
              <section key={album.dateKey} className="flex flex-col gap-4">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {formatDateGroupTitle(album.dateKey)}
                    </h3>
                    <p className="text-sm text-muted-foreground">{album.dateKey}</p>
                  </div>
                  <Badge variant="secondary">{album.count} record</Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {album.screenshots.map((screenshot, screenshotIndex) => (
                    <ScreenshotCard
                      key={screenshot.id}
                      screenshot={screenshot}
                      priority={screenshotIndex < 2}
                      canDelete={isAdmin}
                    />
                  ))}
                </div>
              </section>
            ))
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Belum Ada Data Monitoring</CardTitle>
                <CardDescription>
                  Data akan muncul setelah agent mengirim sensor ke endpoint
                  monitoring.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRightLeft,
  BadgeAlert,
  CircleDollarSign,
  HardDrive,
  Loader2,
  PhoneCall,
  RefreshCw,
  Router,
  ShieldCheck,
  Ticket,
  Users,
  Wifi,
  Wrench,
} from "lucide-react";

import { AssetsDetailDialog } from "@/components/dialogs/AssetDetailDialog";
import { IpAddressesDetailDialog } from "@/components/dialogs/IpAddressDetailDialog";
import CategoryBreakdownChart from "@/components/charts/CategoryBreakdownChart";
import ItemsByLocationChart from "@/components/charts/ItemsByLocationChart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDashboardData } from "@/lib/dashboardService";
import { cn } from "@/lib/utils";

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const integerFormatter = new Intl.NumberFormat("id-ID");

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
});

const formatDuration = (milliseconds: number) => {
  if (!Number.isFinite(milliseconds) || milliseconds <= 0) {
    return "0 menit";
  }

  const totalMinutes = Math.floor(milliseconds / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days} hari ${hours} jam`;
  }
  if (hours > 0) {
    return `${hours} jam ${minutes} menit`;
  }
  return `${minutes} menit`;
};

const formatRatio = (value: number, total: number) => {
  if (!total) return "0%";
  return `${Math.round((value / total) * 100)}%`;
};

const formatCoveragePerUser = (value: number, totalUsers: number) => {
  if (!totalUsers) return "0.0 / user";
  return `${(value / totalUsers).toFixed(1)} / user`;
};

type MetricCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  description: string;
  accentClassName: string;
  onClick?: () => void;
};

function MetricCard({
  icon: Icon,
  label,
  value,
  description,
  accentClassName,
  onClick,
}: MetricCardProps) {
  const content = (
    <Card
      className={cn(
        "h-full border-slate-200/80 bg-white/95 shadow-sm transition-all",
        onClick && "hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
      )}
    >
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-600">{label}</p>
            <p className="text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
          </div>
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-sm",
              accentClassName
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <p className="text-sm leading-5 text-slate-500">{description}</p>
      </CardContent>
    </Card>
  );

  if (!onClick) {
    return content;
  }

  return (
    <button type="button" onClick={onClick} className="h-full w-full text-left">
      {content}
    </button>
  );
}

function DashboardSkeleton() {
  return (
    <div className="container mx-auto space-y-6 py-6 sm:py-8">
      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Skeleton className="h-[240px] rounded-3xl" />
        <Skeleton className="h-[240px] rounded-3xl" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-[148px] rounded-3xl" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-[420px] rounded-3xl" />
        <Skeleton className="h-[420px] rounded-3xl" />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-[420px] rounded-3xl" />
        <Skeleton className="h-[420px] rounded-3xl" />
      </div>
    </div>
  );
}

function DashboardPage() {
  const [isAssetDialogOpen, setAssetDialogOpen] = useState(false);
  const [assetDialogTitle, setAssetDialogTitle] = useState("");
  const [assetDialogFilters, setAssetDialogFilters] = useState<Record<string, string | boolean | number>>({});
  const [isIpDialogOpen, setIpDialogOpen] = useState(false);
  const [ipDialogTitle, setIpDialogTitle] = useState("");
  const [ipDialogFilters, setIpDialogFilters] = useState<Record<string, string | boolean | number>>({});

  const {
    data,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery<DashboardData>({
    queryKey: ["dashboard-overview"],
    queryFn: getDashboardData,
    refetchOnWindowFocus: true,
  });

  const openAssetDialog = (
    title: string,
    filters: Record<string, string | boolean | number> = {}
  ) => {
    setAssetDialogTitle(title);
    setAssetDialogFilters(filters);
    setAssetDialogOpen(true);
  };

  const openIpDialog = (
    title: string,
    filters: Record<string, string | boolean | number> = {}
  ) => {
    setIpDialogTitle(title);
    setIpDialogFilters(filters);
    setIpDialogOpen(true);
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-rose-200 bg-rose-50/70">
          <CardHeader>
            <CardTitle>Dashboard gagal dimuat</CardTitle>
            <CardDescription>
              Data agregasi tidak bisa diambil. Coba refresh query dan cek koneksi database.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetch()} disabled={isFetching}>
              {isFetching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Muat Ulang
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { metrics } = data;

  const overviewCards: MetricCardProps[] = [
    {
      icon: HardDrive,
      label: "Total Aset",
      value: integerFormatter.format(metrics.totalAssets),
      description: "Seluruh inventaris yang tercatat di sistem.",
      accentClassName: "bg-gradient-to-br from-emerald-600 to-green-700",
      onClick: () => openAssetDialog("Semua Aset"),
    },
    {
      icon: ShieldCheck,
      label: "Aset Assigned",
      value: integerFormatter.format(metrics.assignedAssets),
      description: `${formatRatio(metrics.assignedAssets, metrics.totalAssets)} dari total aset sudah terhubung ke assignment.`,
      accentClassName: "bg-gradient-to-br from-sky-500 to-cyan-600",
      onClick: () => openAssetDialog("Aset Assigned", { assignedOnly: true }),
    },
    {
      icon: ArrowRightLeft,
      label: "Aset Belum Assigned",
      value: integerFormatter.format(metrics.unassignedAssets),
      description: "Inventaris yang masih perlu ditindaklanjuti ke user atau unit kerja.",
      accentClassName: "bg-gradient-to-br from-amber-500 to-orange-600",
      onClick: () => openAssetDialog("Aset Belum Assigned", { unassignedOnly: true }),
    },
    {
      icon: Wifi,
      label: "IP Address",
      value: integerFormatter.format(metrics.totalIpAddresses),
      description: "Total IP yang aktif tercatat di master IP address.",
      accentClassName: "bg-gradient-to-br from-indigo-500 to-violet-600",
      onClick: () => openIpDialog("Seluruh IP Address"),
    },
    {
      icon: Users,
      label: "Employee Aktif",
      value: integerFormatter.format(metrics.activeUsers),
      description: `${integerFormatter.format(metrics.totalUsers)} total employee, termasuk nonaktif.`,
      accentClassName: "bg-gradient-to-br from-slate-700 to-slate-900",
    },
    {
      icon: PhoneCall,
      label: "Akun Telepon",
      value: integerFormatter.format(metrics.totalPhoneAccounts),
      description: `${formatRatio(metrics.totalPhoneAccounts, metrics.activeUsers)} coverage terhadap employee aktif.`,
      accentClassName: "bg-gradient-to-br from-fuchsia-500 to-pink-600",
    },
    {
      icon: Ticket,
      label: "Problem 30 Hari",
      value: integerFormatter.format(metrics.problemTicketsLast30Days),
      description: `Rata-rata SLA penyelesaian ${formatDuration(metrics.averageProblemSlaMs)}.`,
      accentClassName: "bg-gradient-to-br from-rose-500 to-red-600",
    },
    {
      icon: CircleDollarSign,
      label: "Billing Bulan Ini",
      value: currencyFormatter.format(metrics.currentMonthBillingTotal),
      description: `${integerFormatter.format(metrics.currentMonthBillingRecords)} record panggilan di bulan berjalan.`,
      accentClassName: "bg-gradient-to-br from-teal-500 to-emerald-600",
    },
  ];

  return (
    <>
      <div className="container mx-auto space-y-6 py-6 sm:py-8">
        <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-950 via-green-800 to-lime-700 text-white shadow-xl">
            <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_60%)]" />
            <div className="absolute -right-20 top-8 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
            <CardContent className="relative space-y-6 p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="border-white/20 bg-white/10 text-white">Live Database Snapshot</Badge>
                <Badge className="border-emerald-200/30 bg-emerald-100/10 text-emerald-50">
                  Update {dateTimeFormatter.format(new Date(data.generatedAt))}
                </Badge>
              </div>

              <div className="max-w-3xl space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Dashboard operasional yang sekarang mengikuti data nyata di sistem.
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-emerald-50/85 sm:text-base">
                  Ringkasan ini mengambil langsung inventaris, employee, IP address, billing,
                  problem ticket, service record, maintenance, dan speed test tanpa card hardcoded
                  per OS atau per lokasi yang tidak sinkron.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-100/80">
                    Coverage Aset
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {formatRatio(metrics.assignedAssets, metrics.totalAssets)}
                  </p>
                  <p className="mt-1 text-sm text-emerald-50/80">
                    Aset yang sudah masuk assignment aktif.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-100/80">
                    Coverage IP
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {formatCoveragePerUser(metrics.totalIpAddresses, metrics.activeUsers)}
                  </p>
                  <p className="mt-1 text-sm text-emerald-50/80">
                    Rasio IP address dibanding employee aktif.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-100/80">
                    Avg SLA
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {formatDuration(metrics.averageProblemSlaMs)}
                  </p>
                  <p className="mt-1 text-sm text-emerald-50/80">
                    Rata-rata penanganan ticket dalam 30 hari terakhir.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200/70 bg-white/95 shadow-sm">
            <CardHeader className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-slate-950">Pulse jaringan & telepon</CardTitle>
                  <CardDescription>
                    Indikator yang paling sering dilihat harian.
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
                  {isFetching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Speed Test 30 Hari
                </p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-2xl font-semibold text-emerald-950">
                      {integerFormatter.format(metrics.ispReportsLast30Days)}
                    </p>
                    <p className="text-sm text-emerald-800/80">record terbaru tercatat</p>
                  </div>
                  <div className="text-right text-sm text-emerald-900">
                    <p>{metrics.averageDownloadLast30Days.toFixed(1)} Mbps down</p>
                    <p>{metrics.averageUploadLast30Days.toFixed(1)} Mbps up</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-amber-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                  Longest Problem 30 Hari
                </p>
                {data.longestProblem ? (
                  <div className="mt-2 space-y-1">
                    <p className="text-lg font-semibold text-amber-950">
                      {data.longestProblem.ticketNumber}
                    </p>
                    <p className="text-sm text-amber-900/80">
                      {data.longestProblem.sbu.replaceAll("_", " ")} • {data.longestProblem.isp.replaceAll("_", " ")}
                    </p>
                    <p className="text-sm font-medium text-amber-800">
                      SLA {data.longestProblem.durationLabel}
                    </p>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-amber-900/75">
                    Belum ada problem sequence dalam 30 hari terakhir.
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                  Coverage Telepon
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">
                  {formatRatio(metrics.totalPhoneAccounts, metrics.activeUsers)}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Proporsi akun telepon terhadap employee aktif.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {overviewCards.map((card) => (
            <MetricCard key={card.label} {...card} />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <Card className="border-slate-200/80 shadow-sm">
            <CardHeader>
              <CardTitle>Distribusi aset per lokasi fisik</CardTitle>
              <CardDescription>
                Lokasi sekarang dihitung dari field `lokasiFisik`, bukan dari user assignment.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-full">
              {data.assetDistributionByLocation.length ? (
                <ItemsByLocationChart data={data.assetDistributionByLocation.slice(0, 8)} />
              ) : (
                <div className="flex h-[350px] items-center justify-center text-sm text-muted-foreground">
                  Data lokasi aset belum tersedia.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 shadow-sm">
            <CardHeader>
              <CardTitle>Komposisi kategori aset</CardTitle>
              <CardDescription>
                Breakdown kategori diambil dinamis dari data kategori aktual.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.assetDistributionByCategory.length ? (
                <CategoryBreakdownChart data={data.assetDistributionByCategory.slice(0, 8)} />
              ) : (
                <div className="flex h-[350px] items-center justify-center text-sm text-muted-foreground">
                  Data kategori aset belum tersedia.
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <Card className="border-slate-200/80 shadow-sm">
            <CardHeader>
              <CardTitle>Ringkasan lokasi</CardTitle>
              <CardDescription>
                Gabungan aset, IP, user aktif, dan kategori dominan per lokasi.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lokasi</TableHead>
                      <TableHead className="text-right">Aset</TableHead>
                      <TableHead className="text-right">IP</TableHead>
                      <TableHead className="text-right">User Aktif</TableHead>
                      <TableHead>Top Kategori</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.locationSummary.length ? (
                      data.locationSummary.map((row) => (
                        <TableRow key={row.location}>
                          <TableCell className="font-medium">
                            <button
                              type="button"
                              className="text-left text-emerald-700 hover:text-emerald-900"
                              onClick={() =>
                                openAssetDialog(`Aset di ${row.location}`, {
                                  lokasiFisik: row.location,
                                })
                              }
                            >
                              {row.location}
                            </button>
                          </TableCell>
                          <TableCell className="text-right">
                            {integerFormatter.format(row.totalAssets)}
                          </TableCell>
                          <TableCell className="text-right">
                            <button
                              type="button"
                              className="font-medium text-sky-700 hover:text-sky-900"
                              onClick={() =>
                                openIpDialog(`IP Address di ${row.location}`, {
                                  company: row.location,
                                })
                              }
                            >
                              {integerFormatter.format(row.totalIpAddresses)}
                            </button>
                          </TableCell>
                          <TableCell className="text-right">
                            {integerFormatter.format(row.activeUsers)}
                          </TableCell>
                          <TableCell>
                            {row.topCategory === "-"
                              ? "-"
                              : `${row.topCategory} (${integerFormatter.format(row.topCategoryCount)})`}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          Belum ada ringkasan lokasi.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 shadow-sm">
            <CardHeader>
              <CardTitle>Sebaran sistem operasi</CardTitle>
              <CardDescription>
                OS laptop dan Intel NUC digabung tanpa filter value yang hardcoded.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sistem Operasi</TableHead>
                      <TableHead className="text-right">Aset</TableHead>
                      <TableHead className="text-right">Persentase</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.operatingSystemDistribution.length ? (
                      data.operatingSystemDistribution.slice(0, 10).map((row) => (
                        <TableRow key={row.name}>
                          <TableCell>{row.name}</TableCell>
                          <TableCell className="text-right">
                            {integerFormatter.format(row.total)}
                          </TableCell>
                          <TableCell className="text-right">
                            {row.percentage.toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                          Data OS belum tersedia.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            {
              icon: Wrench,
              label: "Service Record",
              value: metrics.serviceRecordsLast30Days,
              description: "record dalam 30 hari terakhir",
              accent: "bg-emerald-100 text-emerald-700",
            },
            {
              icon: Router,
              label: "Computer Maintenance",
              value: metrics.computerMaintenancesLast30Days,
              description: "pemeriksaan komputer 30 hari",
              accent: "bg-sky-100 text-sky-700",
            },
            {
              icon: BadgeAlert,
              label: "Printer Maintenance",
              value: metrics.printerMaintenancesLast30Days,
              description: "maintenance printer 30 hari",
              accent: "bg-amber-100 text-amber-700",
            },
            {
              icon: ShieldCheck,
              label: "CCTV Maintenance",
              value: metrics.cctvMaintenancesLast30Days,
              description: "maintenance CCTV 30 hari",
              accent: "bg-indigo-100 text-indigo-700",
            },
            {
              icon: Wifi,
              label: "ISP Speed Test",
              value: metrics.ispReportsLast30Days,
              description: "speed test tercatat 30 hari",
              accent: "bg-rose-100 text-rose-700",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.label} className="border-slate-200/80 shadow-sm">
                <CardContent className="space-y-3 p-5">
                  <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", item.accent)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">{item.label}</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-950">
                      {integerFormatter.format(item.value)}
                    </p>
                  </div>
                  <p className="text-sm text-slate-500">{item.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
          <Card className="border-slate-200/80 shadow-sm">
            <CardHeader>
              <CardTitle>Aktivitas terbaru lintas modul</CardTitle>
              <CardDescription>
                Timeline gabungan problem ticket, service record, billing, dan speed test.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.recentActivity.length ? (
                data.recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant="outline"
                          className="border-slate-300 bg-white text-slate-700"
                        >
                          {activity.type}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {dateTimeFormatter.format(new Date(activity.date))}
                        </span>
                      </div>
                      <p className="font-medium text-slate-950">{activity.title.replaceAll("_", " ")}</p>
                      <p className="text-sm text-slate-600">{activity.subtitle.replaceAll("_", " ")}</p>
                    </div>
                    <div className="text-sm font-medium text-emerald-700">{activity.value.replaceAll("_", " ")}</div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Belum ada aktivitas terbaru yang bisa ditampilkan.
                </p>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-slate-200/80 shadow-sm">
              <CardHeader>
                <CardTitle>Top billing user bulan ini</CardTitle>
                <CardDescription>
                  User dengan akumulasi cost telepon terbesar di bulan berjalan.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.topBillingUsers.length ? (
                  data.topBillingUsers.map((row, index) => (
                    <div
                      key={row.userId}
                      className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4"
                    >
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          #{index + 1}
                        </p>
                        <p className="font-medium text-slate-950">{row.name}</p>
                        <p className="text-sm text-slate-500">
                          {integerFormatter.format(row.totalRecords)} record
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-emerald-700">
                        {currencyFormatter.format(row.totalCost)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Belum ada data billing pada bulan berjalan.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200/80 shadow-sm">
              <CardHeader>
                <CardTitle>Problem ticket terbaru</CardTitle>
                <CardDescription>
                  Ticket paling baru yang tercatat di modul Problem Sequence.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.recentProblemSequences.length ? (
                  data.recentProblemSequences.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="font-medium text-slate-950">{ticket.ticketNumber}</p>
                          <p className="text-sm text-slate-600">
                            {ticket.sbu.replaceAll("_", " ")} • {ticket.isp.replaceAll("_", " ")}
                          </p>
                          <p className="text-xs text-slate-500">
                            Down sejak {dateTimeFormatter.format(new Date(ticket.dateDown))}
                          </p>
                        </div>
                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                          {ticket.slaLabel}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Belum ada ticket problem terbaru.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      <AssetsDetailDialog
        isOpen={isAssetDialogOpen}
        onOpenChange={setAssetDialogOpen}
        title={assetDialogTitle}
        filters={assetDialogFilters}
      />
      <IpAddressesDetailDialog
        isOpen={isIpDialogOpen}
        onOpenChange={setIpDialogOpen}
        title={ipDialogTitle}
        filters={ipDialogFilters}
      />
    </>
  );
}

export default DashboardPage;

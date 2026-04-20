"use client";

import { useMemo, useState } from "react";
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
import { useI18n } from "@/components/i18n/LanguageProvider";
import { getDashboardData } from "@/lib/dashboardService";
import { cn } from "@/lib/utils";

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

const formatDuration = (milliseconds: number, locale: "id" | "en") => {
  if (!Number.isFinite(milliseconds) || milliseconds <= 0) {
    return locale === "en" ? "0 minutes" : "0 menit";
  }

  const totalMinutes = Math.floor(milliseconds / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return locale === "en"
      ? `${days} days ${hours} hours`
      : `${days} hari ${hours} jam`;
  }
  if (hours > 0) {
    return locale === "en"
      ? `${hours} hours ${minutes} minutes`
      : `${hours} jam ${minutes} menit`;
  }
  return locale === "en" ? `${minutes} minutes` : `${minutes} menit`;
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
  const { locale, t } = useI18n();
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

  const languageTag = locale === "en" ? "en-US" : "id-ID";
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(languageTag, {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }),
    [languageTag]
  );
  const integerFormatter = useMemo(
    () => new Intl.NumberFormat(languageTag),
    [languageTag]
  );
  const dateTimeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(languageTag, {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [languageTag]
  );
  const emptyAssetDistributionMessage =
    locale === "en"
      ? "Asset company data is not available yet."
      : "Data company aset belum tersedia.";
  const emptyCategoryDistributionMessage =
    locale === "en"
      ? "Asset category data is not available yet."
      : "Data kategori aset belum tersedia.";

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
            <CardTitle>{t("dashboard.errorTitle")}</CardTitle>
            <CardDescription>
              {t("dashboard.errorDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetch()} disabled={isFetching}>
              {isFetching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("common.retry")}
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
      label: t("dashboard.overview.totalAssets"),
      value: integerFormatter.format(metrics.totalAssets),
      description: t("dashboard.overview.totalAssetsDescription"),
      accentClassName: "bg-gradient-to-br from-emerald-600 to-green-700",
      onClick: () => openAssetDialog(t("dashboard.dialogs.allAssets")),
    },
    {
      icon: ShieldCheck,
      label: t("dashboard.overview.assignedAssets"),
      value: integerFormatter.format(metrics.assignedAssets),
      description: t("dashboard.overview.assignedAssetsDescription", {
        ratio: formatRatio(metrics.assignedAssets, metrics.totalAssets),
      }),
      accentClassName: "bg-gradient-to-br from-sky-500 to-cyan-600",
      onClick: () =>
        openAssetDialog(t("dashboard.dialogs.assignedAssets"), {
          assignedOnly: true,
        }),
    },
    {
      icon: ArrowRightLeft,
      label: t("dashboard.overview.unassignedAssets"),
      value: integerFormatter.format(metrics.unassignedAssets),
      description: t("dashboard.overview.unassignedAssetsDescription"),
      accentClassName: "bg-gradient-to-br from-amber-500 to-orange-600",
      onClick: () =>
        openAssetDialog(t("dashboard.dialogs.unassignedAssets"), {
          unassignedOnly: true,
        }),
    },
    {
      icon: Wifi,
      label: t("dashboard.overview.ipAddresses"),
      value: integerFormatter.format(metrics.totalIpAddresses),
      description: t("dashboard.overview.ipAddressesDescription"),
      accentClassName: "bg-gradient-to-br from-indigo-500 to-violet-600",
      onClick: () => openIpDialog(t("dashboard.dialogs.allIpAddresses")),
    },
    {
      icon: Users,
      label: t("dashboard.overview.activeEmployees"),
      value: integerFormatter.format(metrics.activeUsers),
      description: t("dashboard.overview.activeEmployeesDescription", {
        total: integerFormatter.format(metrics.totalUsers),
      }),
      accentClassName: "bg-gradient-to-br from-slate-700 to-slate-900",
    },
    {
      icon: PhoneCall,
      label: t("dashboard.overview.phoneAccounts"),
      value: integerFormatter.format(metrics.totalPhoneAccounts),
      description: t("dashboard.overview.phoneAccountsDescription", {
        ratio: formatRatio(metrics.totalPhoneAccounts, metrics.activeUsers),
      }),
      accentClassName: "bg-gradient-to-br from-fuchsia-500 to-pink-600",
    },
    {
      icon: Ticket,
      label: t("dashboard.overview.problems30Days"),
      value: integerFormatter.format(metrics.problemTicketsLast30Days),
      description: t("dashboard.overview.problems30DaysDescription", {
        duration: formatDuration(metrics.averageProblemSlaMs, locale),
      }),
      accentClassName: "bg-gradient-to-br from-rose-500 to-red-600",
    },
    {
      icon: CircleDollarSign,
      label: t("dashboard.overview.billingThisMonth"),
      value: currencyFormatter.format(metrics.currentMonthBillingTotal),
      description: t("dashboard.overview.billingThisMonthDescription", {
        count: integerFormatter.format(metrics.currentMonthBillingRecords),
      }),
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
                <Badge className="border-white/20 bg-white/10 text-white">
                  {t("dashboard.hero.liveSnapshot")}
                </Badge>
                <Badge className="border-emerald-200/30 bg-emerald-100/10 text-emerald-50">
                  {t("dashboard.hero.updatedAt", {
                    value: dateTimeFormatter.format(new Date(data.generatedAt)),
                  })}
                </Badge>
              </div>

              <div className="max-w-3xl space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  {t("dashboard.hero.title")}
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-emerald-50/85 sm:text-base">
                  {t("dashboard.hero.description")}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-100/80">
                    {t("dashboard.hero.assetCoverage")}
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {formatRatio(metrics.assignedAssets, metrics.totalAssets)}
                  </p>
                  <p className="mt-1 text-sm text-emerald-50/80">
                    {t("dashboard.hero.assetCoverageDescription")}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-100/80">
                    {t("dashboard.hero.ipCoverage")}
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {formatCoveragePerUser(metrics.totalIpAddresses, metrics.activeUsers)}
                  </p>
                  <p className="mt-1 text-sm text-emerald-50/80">
                    {t("dashboard.hero.ipCoverageDescription")}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-100/80">
                    {t("dashboard.hero.avgSla")}
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {formatDuration(metrics.averageProblemSlaMs, locale)}
                  </p>
                  <p className="mt-1 text-sm text-emerald-50/80">
                    {t("dashboard.hero.avgSlaDescription")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200/70 bg-white/95 shadow-sm">
            <CardHeader className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-slate-950">{t("dashboard.pulse.title")}</CardTitle>
                  <CardDescription>
                    {t("dashboard.pulse.description")}
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
                  {t("dashboard.pulse.speedTestTitle")}
                </p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-2xl font-semibold text-emerald-950">
                      {integerFormatter.format(metrics.ispReportsLast30Days)}
                    </p>
                    <p className="text-sm text-emerald-800/80">{t("dashboard.pulse.speedTestRecords")}</p>
                  </div>
                  <div className="text-right text-sm text-emerald-900">
                    <p>{metrics.averageDownloadLast30Days.toFixed(1)} Mbps down</p>
                    <p>{metrics.averageUploadLast30Days.toFixed(1)} Mbps up</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-amber-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                  {t("dashboard.pulse.longestProblemTitle")}
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
                    {t("dashboard.pulse.longestProblemEmpty")}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                  {t("dashboard.pulse.coverageTitle")}
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">
                  {formatRatio(metrics.totalPhoneAccounts, metrics.activeUsers)}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {t("dashboard.pulse.coverageDescription")}
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
              <CardTitle>{t("dashboard.sections.assetDistributionTitle")}</CardTitle>
              <CardDescription>
                {t("dashboard.sections.assetDistributionDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-full">
              {data.assetDistributionByLocation.length ? (
                <ItemsByLocationChart data={data.assetDistributionByLocation} />
              ) : (
                <div className="flex h-[350px] items-center justify-center text-sm text-muted-foreground">
                  {emptyAssetDistributionMessage}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 shadow-sm">
            <CardHeader>
              <CardTitle>{t("dashboard.sections.categoryCompositionTitle")}</CardTitle>
              <CardDescription>
                {t("dashboard.sections.categoryCompositionDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.assetDistributionByCategory.length ? (
                <CategoryBreakdownChart data={data.assetDistributionByCategory.slice(0, 8)} />
              ) : (
                <div className="flex h-[350px] items-center justify-center text-sm text-muted-foreground">
                  {emptyCategoryDistributionMessage}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <Card className="border-slate-200/80 shadow-sm">
            <CardHeader>
              <CardTitle>{t("dashboard.sections.companySummaryTitle")}</CardTitle>
              <CardDescription>
                {t("dashboard.sections.companySummaryDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("dashboard.table.company")}</TableHead>
                      <TableHead className="text-right">{t("dashboard.table.assets")}</TableHead>
                      <TableHead className="text-right">{t("dashboard.table.ip")}</TableHead>
                      <TableHead className="text-right">{t("dashboard.table.activeUsers")}</TableHead>
                      <TableHead>{t("dashboard.table.topCategory")}</TableHead>
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
                                openAssetDialog(t("dashboard.dialogs.assetsInCompany", {
                                  company: row.location,
                                }), {
                                  company: row.location,
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
                                openIpDialog(t("dashboard.dialogs.ipInCompany", {
                                  company: row.location,
                                }), {
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
                          {t("dashboard.table.noCompanySummary")}
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
              <CardTitle>{t("dashboard.sections.osSpreadTitle")}</CardTitle>
              <CardDescription>
                {t("dashboard.sections.osSpreadDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("dashboard.table.operatingSystem")}</TableHead>
                      <TableHead className="text-right">{t("dashboard.table.assets")}</TableHead>
                      <TableHead className="text-right">{t("dashboard.table.percentage")}</TableHead>
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
                          {t("dashboard.table.noOsData")}
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
              label: t("dashboard.serviceCards.serviceRecord"),
              value: metrics.serviceRecordsLast30Days,
              description: t("dashboard.serviceCards.serviceRecordDescription"),
              accent: "bg-emerald-100 text-emerald-700",
            },
            {
              icon: Router,
              label: t("dashboard.serviceCards.computerMaintenance"),
              value: metrics.computerMaintenancesLast30Days,
              description: t("dashboard.serviceCards.computerMaintenanceDescription"),
              accent: "bg-sky-100 text-sky-700",
            },
            {
              icon: BadgeAlert,
              label: t("dashboard.serviceCards.printerMaintenance"),
              value: metrics.printerMaintenancesLast30Days,
              description: t("dashboard.serviceCards.printerMaintenanceDescription"),
              accent: "bg-amber-100 text-amber-700",
            },
            {
              icon: ShieldCheck,
              label: t("dashboard.serviceCards.cctvMaintenance"),
              value: metrics.cctvMaintenancesLast30Days,
              description: t("dashboard.serviceCards.cctvMaintenanceDescription"),
              accent: "bg-indigo-100 text-indigo-700",
            },
            {
              icon: Wifi,
              label: t("dashboard.serviceCards.ispSpeedTest"),
              value: metrics.ispReportsLast30Days,
              description: t("dashboard.serviceCards.ispSpeedTestDescription"),
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
              <CardTitle>{t("dashboard.sections.latestActivityTitle")}</CardTitle>
              <CardDescription>
                {t("dashboard.sections.latestActivityDescription")}
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
                  {t("dashboard.activity.noRecentActivity")}
                </p>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-slate-200/80 shadow-sm">
              <CardHeader>
                <CardTitle>{t("dashboard.sections.topBillingTitle")}</CardTitle>
                <CardDescription>
                  {t("dashboard.sections.topBillingDescription")}
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
                          {t("dashboard.activity.billingRecords", {
                            count: integerFormatter.format(row.totalRecords),
                          })}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-emerald-700">
                        {currencyFormatter.format(row.totalCost)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t("dashboard.activity.noBillingData")}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200/80 shadow-sm">
              <CardHeader>
                <CardTitle>{t("dashboard.sections.recentProblemTitle")}</CardTitle>
                <CardDescription>
                  {t("dashboard.sections.recentProblemDescription")}
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
                            {t("dashboard.activity.downSince", {
                              value: dateTimeFormatter.format(new Date(ticket.dateDown)),
                            })}
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
                    {t("dashboard.activity.noRecentProblem")}
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
        categoryOptions={data.locationSummaryFilters.categories}
        homebaseOptions={data.locationSummaryFilters.homebases}
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

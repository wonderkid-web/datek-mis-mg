"use client";

import { useState } from "react";

import { useI18n } from "@/components/i18n/LanguageProvider";
import type { AssetSummaryBucketKey } from "@/lib/assetSummaryBuckets";

interface AssetDistributionByCompanyItem {
  location: string;
  total: number;
  laptop: number;
  intelNuc: number;
  other: number;
}

interface Props {
  data: AssetDistributionByCompanyItem[];
  onSelectCompany?: (company: string) => void;
  onSelectBucket?: (company: string, bucket: AssetSummaryBucketKey) => void;
}

const UNMAPPED_LOCATION = "Tanpa Company";

const copyByLocale = {
  id: {
    noData: "Belum ada distribusi company/SBU yang bisa ditampilkan.",
    totalCompanies: "Total company/SBU",
    totalCompaniesDescription: "Seluruh bucket company yang terbaca dari asset saat ini.",
    totalAssets: "Total aset",
    totalAssetsDescription: "Termasuk asset yang belum punya company assignment.",
    dominantCompany: "Company/SBU terbanyak",
    dominantCompanyDescription: (value: string) => `${value} unit saat ini.`,
    noCompany: "Tanpa Company",
    units: "unit",
    showBars: "Tampilkan bar",
    hideBars: "Sembunyikan bar",
    clickHint: "Klik card company untuk membuka rincian asset. Klik badge kategori untuk memfilter rincian.",
    bucketShare: (value: string) => `${value}%`,
  },
  en: {
    noData: "There is no company/SBU distribution to display yet.",
    totalCompanies: "Total companies/SBUs",
    totalCompaniesDescription: "All company buckets currently derived from asset data.",
    totalAssets: "Total assets",
    totalAssetsDescription: "Including assets without a company assignment.",
    dominantCompany: "Largest company/SBU",
    dominantCompanyDescription: (value: string) => `${value} units currently.`,
    noCompany: "No Company",
    units: "units",
    showBars: "Show bars",
    hideBars: "Hide bars",
    clickHint: "Click a company card to open asset details. Click a category badge to filter details.",
    bucketShare: (value: string) => `${value}%`,
  },
} as const;

const bucketAppearance: Record<
  AssetSummaryBucketKey,
  {
    label: {
      id: string;
      en: string;
    };
    barClassName: string;
    badgeClassName: string;
  }
> = {
  laptop: {
    label: {
      id: "Laptop",
      en: "Laptop",
    },
    barClassName: "bg-emerald-500",
    badgeClassName: "border-slate-200 bg-white text-slate-600",
  },
  "intel-nuc": {
    label: {
      id: "Intel NUC",
      en: "Intel NUC",
    },
    barClassName: "bg-sky-500",
    badgeClassName: "border-slate-200 bg-white text-slate-600",
  },
  other: {
    label: {
      id: "Asset lainnya",
      en: "Other assets",
    },
    barClassName: "bg-amber-500",
    badgeClassName: "border-slate-200 bg-white text-slate-600",
  },
};

function AssetDistributionByCompanyChart({
  data,
  onSelectCompany,
  onSelectBucket,
}: Props) {
  const { locale } = useI18n();
  const [showBars, setShowBars] = useState(false);
  const copy = copyByLocale[locale];
  const languageTag = locale === "en" ? "en-US" : "id-ID";
  const formatCount = (value: number) => value.toLocaleString(languageTag);
  const formatLocation = (value: string) =>
    value === UNMAPPED_LOCATION ? copy.noCompany : value;

  if (!data.length) {
    return (
      <div className="flex h-[320px] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/70">
        <p className="text-sm text-slate-500">{copy.noData}</p>
      </div>
    );
  }

  const totalAssets = data.reduce((sum, item) => sum + item.total, 0);
  const topCompany = data[0];
  const segments: AssetSummaryBucketKey[] = ["laptop", "intel-nuc", "other"];

  return (
    <div className="space-y-5">
      <div className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {copy.totalCompanies}
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {formatCount(data.length)}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {copy.totalCompaniesDescription}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {copy.totalAssets}
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {formatCount(totalAssets)}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {copy.totalAssetsDescription}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {copy.dominantCompany}
          </p>
          <p className="mt-2 line-clamp-1 text-lg font-semibold text-slate-950">
            {formatLocation(topCompany.location)}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {copy.dominantCompanyDescription(formatCount(topCompany.total))}
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {segments.map((segment) => {
              const appearance = bucketAppearance[segment];

              return (
                <div
                  key={segment}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${appearance.badgeClassName}`}
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${appearance.barClassName}`} />
                  <span>{appearance.label[locale]}</span>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            aria-pressed={showBars}
            onClick={() => setShowBars((current) => !current)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
          >
            {showBars ? copy.hideBars : copy.showBars}
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {data.map((item, index) => (
            <div
              key={item.location}
              role={onSelectCompany ? "button" : undefined}
              tabIndex={onSelectCompany ? 0 : undefined}
              onClick={
                onSelectCompany
                  ? () => onSelectCompany(item.location)
                  : undefined
              }
              onKeyDown={
                onSelectCompany
                  ? (event) => {
                      if (event.target !== event.currentTarget) return;
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onSelectCompany(item.location);
                      }
                    }
                  : undefined
              }
              className={`rounded-2xl border border-slate-200/80 bg-white p-4 ${
                onSelectCompany
                  ? "cursor-pointer transition-colors hover:border-slate-300 hover:bg-slate-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  : ""
              }`}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600">
                    #{index + 1}
                  </span>
                  <p
                    className="truncate text-left text-base font-semibold text-slate-950"
                    title={formatLocation(item.location)}
                  >
                    {formatLocation(item.location)}
                  </p>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {formatCount(item.total)} {copy.units}
                </p>
              </div>

              {showBars ? (
                <div className="mt-4 flex h-4 overflow-hidden rounded-full bg-slate-100">
                  {segments.map((segment) => {
                    const total =
                      segment === "laptop"
                        ? item.laptop
                        : segment === "intel-nuc"
                          ? item.intelNuc
                          : item.other;

                    if (!total) {
                      return null;
                    }

                    const appearance = bucketAppearance[segment];
                    const percentage = item.total > 0 ? (total / item.total) * 100 : 0;

                    return (
                      <button
                        key={segment}
                        type="button"
                        className={`h-full ${appearance.barClassName}`}
                        style={{ width: `${percentage}%` }}
                        onClick={(event) => {
                          event.stopPropagation();
                          onSelectBucket?.(item.location, segment);
                        }}
                        title={`${appearance.label[locale]}: ${formatCount(total)} ${copy.units}`}
                      >
                        <span className="sr-only">
                          {appearance.label[locale]} {formatCount(total)} {copy.units}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : null}

              <div className="mt-3 flex flex-wrap gap-2">
                {segments.map((segment) => {
                  const total =
                    segment === "laptop"
                      ? item.laptop
                      : segment === "intel-nuc"
                        ? item.intelNuc
                        : item.other;
                  const appearance = bucketAppearance[segment];
                  const percentage = item.total > 0 ? (total / item.total) * 100 : 0;

                  return (
                    <button
                      key={segment}
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelectBucket?.(item.location, segment);
                      }}
                      disabled={total === 0}
                      className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50 ${appearance.badgeClassName}`}
                    >
                      <span className={`h-2.5 w-2.5 rounded-full ${appearance.barClassName}`} />
                      <span>{appearance.label[locale]}</span>
                      <span>{formatCount(total)}</span>
                      <span className="text-current/70">{copy.bucketShare(percentage.toFixed(1))}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {(onSelectCompany || onSelectBucket) ? (
          <p className="mt-4 text-xs text-slate-500">{copy.clickHint}</p>
        ) : null}
      </div>
    </div>
  );
}

export default AssetDistributionByCompanyChart;

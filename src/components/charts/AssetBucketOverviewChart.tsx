"use client";

import { useI18n } from "@/components/i18n/LanguageProvider";
import type { AssetSummaryBucketKey } from "@/lib/assetSummaryBuckets";

interface AssetBucketOverviewItem {
  key: AssetSummaryBucketKey;
  total: number;
  percentage: number;
  companyCount: number;
}

interface Props {
  data: AssetBucketOverviewItem[];
  onSelectBucket?: (bucket: AssetSummaryBucketKey) => void;
}

const copyByLocale = {
  id: {
    noData: "Belum ada data asset yang bisa diringkas.",
    assets: "aset",
    companies: "company/SBU",
    share: "Porsi",
    totalAssets: "Total aset",
    coverage: (value: string) => `Tersebar di ${value} company/SBU.`,
    clickHint: "Klik kartu atau segmen untuk membuka detail asset per bucket.",
  },
  en: {
    noData: "There is no asset data available for this summary yet.",
    assets: "assets",
    companies: "companies/SBUs",
    share: "Share",
    totalAssets: "Total assets",
    coverage: (value: string) => `Spread across ${value} companies/SBUs.`,
    clickHint: "Click a card or segment to open the asset details for that bucket.",
  },
} as const;

const bucketAppearance: Record<
  AssetSummaryBucketKey,
  {
    label: {
      id: string;
      en: string;
    };
    cardClassName: string;
    barClassName: string;
    badgeClassName: string;
  }
> = {
  laptop: {
    label: {
      id: "Laptop",
      en: "Laptop",
    },
    cardClassName: "border-emerald-100 bg-emerald-50/80 text-emerald-950",
    barClassName: "bg-emerald-500",
    badgeClassName: "bg-emerald-100 text-emerald-700",
  },
  "intel-nuc": {
    label: {
      id: "Intel NUC",
      en: "Intel NUC",
    },
    cardClassName: "border-sky-100 bg-sky-50/80 text-sky-950",
    barClassName: "bg-sky-500",
    badgeClassName: "bg-sky-100 text-sky-700",
  },
  other: {
    label: {
      id: "Asset lainnya",
      en: "Other assets",
    },
    cardClassName: "border-amber-100 bg-amber-50/80 text-amber-950",
    barClassName: "bg-amber-500",
    badgeClassName: "bg-amber-100 text-amber-700",
  },
};

function AssetBucketOverviewChart({ data, onSelectBucket }: Props) {
  const { locale } = useI18n();
  const copy = copyByLocale[locale];
  const languageTag = locale === "en" ? "en-US" : "id-ID";
  const formatCount = (value: number) => value.toLocaleString(languageTag);

  if (!data.length || data.every((item) => item.total === 0)) {
    return (
      <div className="flex h-[320px] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/70">
        <p className="text-sm text-slate-500">{copy.noData}</p>
      </div>
    );
  }

  const totalAssets = data.reduce((sum, item) => sum + item.total, 0);
  const maxBucketTotal = Math.max(...data.map((item) => item.total), 1);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 lg:grid-cols-3">
        {data.map((item) => {
          const appearance = bucketAppearance[item.key];
          const content = (
            <div
              className={`h-full rounded-2xl border p-4 transition-all ${appearance.cardClassName}`}
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${appearance.badgeClassName}`}
                >
                  {appearance.label[locale]}
                </span>
                <span className="text-sm font-medium text-slate-600">
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
              <p className="mt-4 text-3xl font-semibold tracking-tight">
                {formatCount(item.total)}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {copy.coverage(formatCount(item.companyCount))}
              </p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/80">
                <div
                  className={`h-full rounded-full ${appearance.barClassName}`}
                  style={{ width: `${(item.total / maxBucketTotal) * 100}%` }}
                />
              </div>
            </div>
          );

          if (!onSelectBucket) {
            return <div key={item.key}>{content}</div>;
          }

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelectBucket(item.key)}
              className="h-full text-left"
            >
              {content}
            </button>
          );
        })}
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {copy.totalAssets}
            </p>
            <p className="mt-1 text-2xl font-semibold text-slate-950">
              {formatCount(totalAssets)} {copy.assets}
            </p>
          </div>
          <p className="text-sm text-slate-500">
            {copy.share}: 100%
          </p>
        </div>

        <div className="mt-5 flex h-4 overflow-hidden rounded-full bg-slate-100">
          {data.map((item) => {
            const appearance = bucketAppearance[item.key];

            if (item.total === 0) {
              return null;
            }

            const segment = (
              <div
                className={`h-full ${appearance.barClassName}`}
                style={{ width: `${item.percentage}%` }}
                title={`${appearance.label[locale]}: ${formatCount(item.total)} ${copy.assets}`}
              />
            );

            if (!onSelectBucket) {
              return (
                <div key={item.key} style={{ width: `${item.percentage}%` }}>
                  {segment}
                </div>
              );
            }

            return (
              <button
                key={item.key}
                type="button"
                className="h-full"
                style={{ width: `${item.percentage}%` }}
                onClick={() => onSelectBucket(item.key)}
                title={`${appearance.label[locale]}: ${formatCount(item.total)} ${copy.assets}`}
              >
                <span className="sr-only">
                  {appearance.label[locale]} {formatCount(item.total)} {copy.assets}
                </span>
                <div className={`h-full w-full ${appearance.barClassName}`} />
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {data.map((item) => {
            const appearance = bucketAppearance[item.key];

            return (
              <div
                key={item.key}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
              >
                <span className={`h-2.5 w-2.5 rounded-full ${appearance.barClassName}`} />
                <span>{appearance.label[locale]}</span>
                <span className="text-slate-400">•</span>
                <span>{formatCount(item.total)}</span>
              </div>
            );
          })}
        </div>

        {onSelectBucket ? (
          <p className="mt-4 text-xs text-slate-500">{copy.clickHint}</p>
        ) : null}
      </div>
    </div>
  );
}

export default AssetBucketOverviewChart;

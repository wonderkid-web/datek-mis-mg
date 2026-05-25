"use client";

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
    viewDetail: "Lihat detail",
    units: "unit",
    clickHint: "Klik nama company, tombol detail, atau segmen warna untuk membuka rincian asset.",
    bucketShare: (value: string) => `${value}% dari asset company ini`,
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
    viewDetail: "View details",
    units: "units",
    clickHint: "Click a company name, the detail button, or a color segment to open asset details.",
    bucketShare: (value: string) => `${value}% of this company's assets`,
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
    badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  "intel-nuc": {
    label: {
      id: "Intel NUC",
      en: "Intel NUC",
    },
    barClassName: "bg-sky-500",
    badgeClassName: "border-sky-200 bg-sky-50 text-sky-700",
  },
  other: {
    label: {
      id: "Asset lainnya",
      en: "Other assets",
    },
    barClassName: "bg-amber-500",
    badgeClassName: "border-amber-200 bg-amber-50 text-amber-700",
  },
};

function AssetDistributionByCompanyChart({
  data,
  onSelectCompany,
  onSelectBucket,
}: Props) {
  const { locale } = useI18n();
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
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            {copy.totalCompanies}
          </p>
          <p className="mt-2 text-2xl font-semibold text-emerald-950">
            {formatCount(data.length)}
          </p>
          <p className="mt-1 text-sm text-emerald-900/75">
            {copy.totalCompaniesDescription}
          </p>
        </div>
        <div className="rounded-2xl border border-sky-100 bg-sky-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
            {copy.totalAssets}
          </p>
          <p className="mt-2 text-2xl font-semibold text-sky-950">
            {formatCount(totalAssets)}
          </p>
          <p className="mt-1 text-sm text-sky-900/75">
            {copy.totalAssetsDescription}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
            {copy.dominantCompany}
          </p>
          <p className="mt-2 line-clamp-1 text-lg font-semibold text-amber-950">
            {formatLocation(topCompany.location)}
          </p>
          <p className="mt-1 text-sm text-amber-900/75">
            {copy.dominantCompanyDescription(formatCount(topCompany.total))}
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white p-5">
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

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {data.map((item, index) => (
            <div
              key={item.location}
              className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4"
            >
              <div className="flex flex-col gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600">
                      #{index + 1}
                    </span>
                    {onSelectCompany ? (
                      <button
                        type="button"
                        className="truncate text-left text-base font-semibold text-slate-950 hover:text-emerald-700"
                        onClick={() => onSelectCompany(item.location)}
                        title={formatLocation(item.location)}
                      >
                        {formatLocation(item.location)}
                      </button>
                    ) : (
                      <p
                        className="truncate text-left text-base font-semibold text-slate-950"
                        title={formatLocation(item.location)}
                      >
                        {formatLocation(item.location)}
                      </p>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatCount(item.total)} {copy.units}
                  </p>
                </div>
                {onSelectCompany ? (
                  <button
                    type="button"
                    className="inline-flex w-fit items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-emerald-200 hover:text-emerald-700"
                    onClick={() => onSelectCompany(item.location)}
                  >
                    {copy.viewDetail}
                  </button>
                ) : null}
              </div>

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
                      onClick={() => onSelectBucket?.(item.location, segment)}
                      title={`${appearance.label[locale]}: ${formatCount(total)} ${copy.units}`}
                    >
                      <span className="sr-only">
                        {appearance.label[locale]} {formatCount(total)} {copy.units}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
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
                      onClick={() => onSelectBucket?.(item.location, segment)}
                      disabled={total === 0}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${appearance.badgeClassName}`}
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

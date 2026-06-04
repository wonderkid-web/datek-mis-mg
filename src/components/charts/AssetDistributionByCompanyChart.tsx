"use client";

import { useState } from "react";

import { useI18n } from "@/components/i18n/LanguageProvider";
import type { AssetSummaryBucketKey } from "@/lib/assetSummaryBuckets";

interface AssetDistributionByCompanyCategory {
  id: number;
  slug: string;
  name: string;
  total: number;
  percentage: number;
}

interface AssetDistributionByCompanyItem {
  location: string;
  total: number;
  laptop: number;
  intelNuc: number;
  other: number;
  categories: AssetDistributionByCompanyCategory[];
}

interface Props {
  data: AssetDistributionByCompanyItem[];
  onSelectCompany?: (company: string) => void;
  onSelectBucket?: (company: string, bucket: AssetSummaryBucketKey) => void;
  onSelectCategory?: (
    company: string,
    category: AssetDistributionByCompanyCategory
  ) => void;
}

type DetailAppearance = {
  badgeClassName: string;
  barClassName: string;
};

const UNMAPPED_LOCATION = "Tanpa Company";
const SUMMARY_SEGMENTS: AssetSummaryBucketKey[] = [
  "laptop",
  "intel-nuc",
  "other",
];

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
    showAllTypes: "Semua jenis asset",
    showSummary: "3 bucket utama",
    clickHint:
      "Klik card company untuk membuka rincian asset. Klik badge atau segmen warna untuk memfilter detail.",
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
    showAllTypes: "Show all types",
    showSummary: "Show 3 buckets",
    clickHint:
      "Click a company card to open asset details. Click a badge or color segment to filter details.",
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

const detailPalette: DetailAppearance[] = [
  {
    badgeClassName: "border-amber-200 bg-amber-50 text-amber-900",
    barClassName: "bg-amber-500",
  },
  {
    badgeClassName: "border-violet-200 bg-violet-50 text-violet-900",
    barClassName: "bg-violet-500",
  },
  {
    badgeClassName: "border-rose-200 bg-rose-50 text-rose-900",
    barClassName: "bg-rose-500",
  },
  {
    badgeClassName: "border-cyan-200 bg-cyan-50 text-cyan-900",
    barClassName: "bg-cyan-500",
  },
  {
    badgeClassName: "border-lime-200 bg-lime-50 text-lime-900",
    barClassName: "bg-lime-500",
  },
  {
    badgeClassName: "border-indigo-200 bg-indigo-50 text-indigo-900",
    barClassName: "bg-indigo-500",
  },
  {
    badgeClassName: "border-orange-200 bg-orange-50 text-orange-900",
    barClassName: "bg-orange-500",
  },
  {
    badgeClassName: "border-teal-200 bg-teal-50 text-teal-900",
    barClassName: "bg-teal-500",
  },
  {
    badgeClassName: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-900",
    barClassName: "bg-fuchsia-500",
  },
  {
    badgeClassName: "border-red-200 bg-red-50 text-red-900",
    barClassName: "bg-red-500",
  },
];

const resolveDetailAppearance = (
  category: Pick<AssetDistributionByCompanyCategory, "slug">,
  fallbackIndex: number
): DetailAppearance => {
  if (category.slug === "laptop") {
    return {
      badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-900",
      barClassName: "bg-emerald-500",
    };
  }

  if (category.slug === "intel-nuc") {
    return {
      badgeClassName: "border-sky-200 bg-sky-50 text-sky-900",
      barClassName: "bg-sky-500",
    };
  }

  return detailPalette[fallbackIndex % detailPalette.length];
};

function AssetDistributionByCompanyChart({
  data,
  onSelectCompany,
  onSelectBucket,
  onSelectCategory,
}: Props) {
  const { locale } = useI18n();
  const [showBars, setShowBars] = useState(false);
  const [showAllTypes, setShowAllTypes] = useState(false);
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

  const detailCategoryTotals = new Map<
    number,
    AssetDistributionByCompanyCategory & { overallTotal: number }
  >();

  for (const item of data) {
    for (const category of item.categories) {
      const existing = detailCategoryTotals.get(category.id);

      if (existing) {
        existing.overallTotal += category.total;
      } else {
        detailCategoryTotals.set(category.id, {
          ...category,
          overallTotal: category.total,
        });
      }
    }
  }

  const detailCategories = Array.from(detailCategoryTotals.values()).sort(
    (left, right) =>
      right.overallTotal - left.overallTotal || left.name.localeCompare(right.name)
  );

  const detailAppearanceByCategoryId = new Map<number, DetailAppearance>();
  let detailPaletteIndex = 0;

  for (const category of detailCategories) {
    const appearance = resolveDetailAppearance(category, detailPaletteIndex);
    detailAppearanceByCategoryId.set(category.id, appearance);

    if (category.slug !== "laptop" && category.slug !== "intel-nuc") {
      detailPaletteIndex += 1;
    }
  }

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
            {showAllTypes
              ? detailCategories.map((category) => {
                  const appearance = detailAppearanceByCategoryId.get(category.id);

                  if (!appearance) {
                    return null;
                  }

                  return (
                    <div
                      key={category.id}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${appearance.badgeClassName}`}
                    >
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${appearance.barClassName}`}
                      />
                      <span>{category.name}</span>
                      <span className="text-current/70">
                        {formatCount(category.overallTotal)}
                      </span>
                    </div>
                  );
                })
              : SUMMARY_SEGMENTS.map((segment) => {
                  const appearance = bucketAppearance[segment];

                  return (
                    <div
                      key={segment}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${appearance.badgeClassName}`}
                    >
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${appearance.barClassName}`}
                      />
                      <span>{appearance.label[locale]}</span>
                    </div>
                  );
                })}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={showAllTypes}
              onClick={() => setShowAllTypes((current) => !current)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
            >
              {showAllTypes ? copy.showSummary : copy.showAllTypes}
            </button>
            <button
              type="button"
              aria-pressed={showBars}
              onClick={() => setShowBars((current) => !current)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
            >
              {showBars ? copy.hideBars : copy.showBars}
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {data.map((item, index) => {
            const categoriesById = new Map(
              item.categories.map((category) => [category.id, category])
            );

            return (
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
                    {showAllTypes
                      ? detailCategories.map((category) => {
                          const companyCategory = categoriesById.get(category.id);

                          if (!companyCategory?.total) {
                            return null;
                          }

                          const appearance = detailAppearanceByCategoryId.get(category.id);

                          if (!appearance) {
                            return null;
                          }

                          return (
                            <button
                              key={category.id}
                              type="button"
                              disabled={!onSelectCategory}
                              className={`h-full disabled:cursor-default ${appearance.barClassName}`}
                              style={{ width: `${companyCategory.percentage}%` }}
                              onClick={(event) => {
                                event.stopPropagation();
                                onSelectCategory?.(item.location, companyCategory);
                              }}
                              title={`${companyCategory.name}: ${formatCount(companyCategory.total)} ${copy.units}`}
                            >
                              <span className="sr-only">
                                {companyCategory.name} {formatCount(companyCategory.total)}{" "}
                                {copy.units}
                              </span>
                            </button>
                          );
                        })
                      : SUMMARY_SEGMENTS.map((segment) => {
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
                          const percentage =
                            item.total > 0 ? (total / item.total) * 100 : 0;

                          return (
                            <button
                              key={segment}
                              type="button"
                              disabled={!onSelectBucket}
                              className={`h-full disabled:cursor-default ${appearance.barClassName}`}
                              style={{ width: `${percentage}%` }}
                              onClick={(event) => {
                                event.stopPropagation();
                                onSelectBucket?.(item.location, segment);
                              }}
                              title={`${appearance.label[locale]}: ${formatCount(total)} ${copy.units}`}
                            >
                              <span className="sr-only">
                                {appearance.label[locale]} {formatCount(total)}{" "}
                                {copy.units}
                              </span>
                            </button>
                          );
                        })}
                  </div>
                ) : null}

                <div className="mt-3 flex flex-wrap gap-2">
                  {showAllTypes
                    ? detailCategories.map((category) => {
                        const companyCategory = categoriesById.get(category.id);

                        if (!companyCategory?.total) {
                          return null;
                        }

                        const appearance = detailAppearanceByCategoryId.get(category.id);

                        if (!appearance) {
                          return null;
                        }

                        return (
                          <button
                            key={category.id}
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              onSelectCategory?.(item.location, companyCategory);
                            }}
                            disabled={!onSelectCategory}
                            className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 ${appearance.badgeClassName}`}
                          >
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${appearance.barClassName}`}
                            />
                            <span>{companyCategory.name}</span>
                            <span>{formatCount(companyCategory.total)}</span>
                            <span className="text-current/70">
                              {copy.bucketShare(companyCategory.percentage.toFixed(1))}
                            </span>
                          </button>
                        );
                      })
                    : SUMMARY_SEGMENTS.map((segment) => {
                        const total =
                          segment === "laptop"
                            ? item.laptop
                            : segment === "intel-nuc"
                              ? item.intelNuc
                              : item.other;
                        const appearance = bucketAppearance[segment];
                        const percentage =
                          item.total > 0 ? (total / item.total) * 100 : 0;

                        return (
                          <button
                            key={segment}
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              onSelectBucket?.(item.location, segment);
                            }}
                            disabled={total === 0 || !onSelectBucket}
                            className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50 ${appearance.badgeClassName}`}
                          >
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${appearance.barClassName}`}
                            />
                            <span>{appearance.label[locale]}</span>
                            <span>{formatCount(total)}</span>
                            <span className="text-current/70">
                              {copy.bucketShare(percentage.toFixed(1))}
                            </span>
                          </button>
                        );
                      })}
                </div>
              </div>
            );
          })}
        </div>

        {onSelectCompany || onSelectBucket || onSelectCategory ? (
          <p className="mt-4 text-xs text-slate-500">{copy.clickHint}</p>
        ) : null}
      </div>
    </div>
  );
}

export default AssetDistributionByCompanyChart;

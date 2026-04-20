"use client";

import { useI18n } from "@/components/i18n/LanguageProvider";

interface Props {
  data: {
    location: string;
    total: number;
  }[];
}

const UNMAPPED_LOCATION = "Tanpa Company";

const copyByLocale = {
  id: {
    noData: "Data company aset belum tersedia.",
    noCompany: "Tanpa Company",
    assets: "aset",
    unit: "unit",
    totalCompany: "Total Company",
    totalCompanyDescription: "Company dengan aset assigned tercatat.",
    totalAssets: "Total Aset",
    averageAssetsPerCompany: (value: string) => `Rata-rata ${value} aset per company.`,
    dominantCompany: "Company Dominan",
    currentAssets: (value: string) => `${value} aset saat ini.`,
    locationStatusAllUnmapped:
      "Distribusi company belum representatif karena semua aset masih belum punya company assignment.",
    locationStatusSomeUnmapped: (value: string) =>
      `${value} aset masih belum punya company assignment yang valid.`,
    locationStatusComplete:
      "Semua aset sudah punya company assignment, distribusi saat ini bisa dibaca sebagai kondisi aktual.",
    completeAssignments: (value: string, label: string) =>
      `Lengkapi company assignment untuk ${value} aset yang masih "${label}".`,
    keepAssignmentQuality:
      "Pertahankan kualitas assignment company agar distribusi tetap akurat.",
    standardizeCompanyNames:
      "Standarisasi penamaan company agar aset tidak terus menumpuk di bucket yang terlalu umum.",
    reviewSimilarCompanyNames:
      "Review penamaan company yang mirip agar tidak terpecah jadi beberapa bucket berbeda.",
    validateConcentration: (company: string, percentage: string) =>
      `${company} menampung ${percentage}% aset. Validasi apakah konsentrasi ini memang wajar.`,
    distributionBalanced:
      "Sebaran aset mulai lebih merata; fokus berikutnya adalah menjaga konsistensi assignment company baru.",
    rankingSingle: (total: string, company: string) =>
      `Ranking saat ini belum punya pembanding karena seluruh ${total} aset masih berada di bucket ${company}.`,
    rankingLead: (company: string, total: string, gap: string, secondCompany: string) =>
      `${company} memimpin dengan ${total} aset, unggul ${gap} aset dari ${secondCompany}.`,
    coverageTitle: "Coverage company aset",
    coverageDescription: "Porsi aset yang sudah punya company assignment.",
    mappedAssets: "Aset ber-company",
    mappedAssetsDescription: "Sudah punya company assignment yang valid.",
    unmappedAssets: "Aset tanpa company",
    unmappedAssetsDescription: "Masih perlu assignment company.",
    mappedSummary: (value: string) =>
      `${value} aset sudah bisa dibaca pada distribusi company.`,
    unmappedSummary:
      "Belum ada aset yang bisa dibaca pada distribusi company karena semua data masih Tanpa Company.",
    detectedCompanies: "Company Terdeteksi",
    detectedCompaniesDescription: (label: string) => `Company selain "${label}".`,
    missingCompany: "Belum Punya Company",
    missingCompanyDescription: (label: string) => `Aset masih berada di "${label}".`,
    rankingTitle: "Ranking company",
    rankingDescription: "Urutan kontribusi aset per company.",
    needsMapping: "Perlu mapping",
    percentageOfTotalAssets: (percentage: string) => `${percentage}% dari total aset`,
    dominantCompanyTitle: "Company Paling Dominan",
    controlsShare: (percentage: string) => `Menguasai ${percentage}% dari total aset.`,
    nextPositionGap: "Gap Posisi Berikutnya",
    noComparison: "Belum ada",
    moreAssetsThan: (gap: string, company: string) => `${gap} aset lebih banyak dari ${company}.`,
    completeForComparison:
      "Lengkapi company assignment agar ranking punya pembanding.",
    qualityStatusTitle: "Status kualitas company",
    qualityStatusDescription: "Baca distribusi ini bersama kualitas input data company.",
    coverage: "Coverage",
    assetsWithCompany: "Aset Ber-Company",
    averagePerCompany: "Avg Per Company",
    averagePerCompanyDescription:
      "Rata-rata aset untuk tiap company yang terdeteksi.",
    companyDominance: "Dominasi Company",
    companyDominanceDescription: (company: string) =>
      `Porsi aset yang terkonsentrasi di ${company}.`,
    quickFixTitle: "Langkah perbaikan cepat",
    quickFixDescription: "Aksi yang paling relevan dari distribusi saat ini.",
    dataQuality: "Data quality",
  },
  en: {
    noData: "Asset company data is not available yet.",
    noCompany: "No Company",
    assets: "assets",
    unit: "units",
    totalCompany: "Total Companies",
    totalCompanyDescription: "Companies with assigned assets recorded.",
    totalAssets: "Total Assets",
    averageAssetsPerCompany: (value: string) => `Average ${value} assets per company.`,
    dominantCompany: "Dominant Company",
    currentAssets: (value: string) => `${value} assets currently.`,
    locationStatusAllUnmapped:
      "Company distribution is not representative yet because every asset still lacks a company assignment.",
    locationStatusSomeUnmapped: (value: string) =>
      `${value} assets still do not have a valid company assignment.`,
    locationStatusComplete:
      "All assets already have company assignments, so this distribution reflects the current condition.",
    completeAssignments: (value: string, label: string) =>
      `Complete company assignments for ${value} assets still marked as "${label}".`,
    keepAssignmentQuality:
      "Keep company assignment quality consistent so the distribution stays accurate.",
    standardizeCompanyNames:
      "Standardize company naming so assets do not keep piling into overly broad buckets.",
    reviewSimilarCompanyNames:
      "Review similar company names so they do not split into multiple duplicate buckets.",
    validateConcentration: (company: string, percentage: string) =>
      `${company} holds ${percentage}% of assets. Validate whether this concentration is expected.`,
    distributionBalanced:
      "Asset distribution is becoming more balanced; the next focus is keeping new company assignments consistent.",
    rankingSingle: (total: string, company: string) =>
      `The ranking has no comparison yet because all ${total} assets are still in the ${company} bucket.`,
    rankingLead: (company: string, total: string, gap: string, secondCompany: string) =>
      `${company} leads with ${total} assets, ahead of ${secondCompany} by ${gap} assets.`,
    coverageTitle: "Asset Company Coverage",
    coverageDescription: "Share of assets that already have a company assignment.",
    mappedAssets: "Assets with company",
    mappedAssetsDescription: "Already have a valid company assignment.",
    unmappedAssets: "Assets without company",
    unmappedAssetsDescription: "Still need a company assignment.",
    mappedSummary: (value: string) =>
      `${value} assets can now be read in the company distribution.`,
    unmappedSummary:
      "No assets can be read in the company distribution yet because all data is still marked No Company.",
    detectedCompanies: "Detected Companies",
    detectedCompaniesDescription: (label: string) => `Companies other than "${label}".`,
    missingCompany: "Missing Company",
    missingCompanyDescription: (label: string) => `Assets still in "${label}".`,
    rankingTitle: "Company Ranking",
    rankingDescription: "Asset contribution order by company.",
    needsMapping: "Needs mapping",
    percentageOfTotalAssets: (percentage: string) => `${percentage}% of total assets`,
    dominantCompanyTitle: "Most Dominant Company",
    controlsShare: (percentage: string) => `Controls ${percentage}% of total assets.`,
    nextPositionGap: "Next Position Gap",
    noComparison: "No comparison",
    moreAssetsThan: (gap: string, company: string) => `${gap} more assets than ${company}.`,
    completeForComparison:
      "Complete company assignments so the ranking has a comparison.",
    qualityStatusTitle: "Company Quality Status",
    qualityStatusDescription: "Read this distribution together with company data input quality.",
    coverage: "Coverage",
    assetsWithCompany: "Assets With Company",
    averagePerCompany: "Avg Per Company",
    averagePerCompanyDescription:
      "Average assets for each detected company.",
    companyDominance: "Company Dominance",
    companyDominanceDescription: (company: string) =>
      `Share of assets concentrated in ${company}.`,
    quickFixTitle: "Quick Fix Steps",
    quickFixDescription: "The most relevant actions from the current distribution.",
    dataQuality: "Data quality",
  },
} as const;

const truncateLabel = (value: string, maxLength: number) =>
  value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value;

function ItemsByLocationChart({ data }: Props) {
  const { locale } = useI18n();
  const copy = copyByLocale[locale];
  const languageTag = locale === "en" ? "en-US" : "id-ID";
  const formatCount = (value: number) => value.toLocaleString(languageTag);
  const formatLocation = (location: string) =>
    location === UNMAPPED_LOCATION ? copy.noCompany : location;

  if (!data.length) {
    return (
      <div className="flex h-[350px] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/70">
        <p className="text-sm text-slate-500">{copy.noData}</p>
      </div>
    );
  }

  const chartData = data.slice(0, 8);
  const totalAssets = data.reduce((sum, item) => sum + item.total, 0);
  const topLocation = data[0];
  const averageAssetsPerLocation = totalAssets / data.length;
  const unmappedAssets = data.find((item) => item.location === UNMAPPED_LOCATION)?.total ?? 0;
  const mappedAssets = Math.max(totalAssets - unmappedAssets, 0);
  const mappedLocations = data.filter((item) => item.location !== UNMAPPED_LOCATION).length;
  const averageMappedAssetsPerLocation = mappedLocations > 0 ? mappedAssets / mappedLocations : 0;
  const mappedPercentage = totalAssets ? (mappedAssets / totalAssets) * 100 : 0;
  const topLocationShare = totalAssets ? (topLocation.total / totalAssets) * 100 : 0;
  const secondLocation = data[1] ?? null;
  const topLocationGap = secondLocation ? Math.max(topLocation.total - secondLocation.total, 0) : topLocation.total;
  const showLocationChart = mappedLocations > 0;
  const locationStatus =
    unmappedAssets === totalAssets
      ? copy.locationStatusAllUnmapped
      : unmappedAssets > 0
        ? copy.locationStatusSomeUnmapped(formatCount(unmappedAssets))
        : copy.locationStatusComplete;
  const locationActions = [
    unmappedAssets > 0
      ? copy.completeAssignments(formatCount(unmappedAssets), copy.noCompany)
      : copy.keepAssignmentQuality,
    mappedLocations <= 1
      ? copy.standardizeCompanyNames
      : copy.reviewSimilarCompanyNames,
    topLocationShare >= 60
      ? copy.validateConcentration(formatLocation(topLocation.location), topLocationShare.toFixed(1))
      : copy.distributionBalanced,
  ];
  const rankingNarrative =
    data.length === 1
      ? copy.rankingSingle(formatCount(totalAssets), formatLocation(topLocation.location))
      : copy.rankingLead(
          formatLocation(topLocation.location),
          formatCount(topLocation.total),
          formatCount(topLocationGap),
          formatLocation(secondLocation?.location ?? "")
        );
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            {copy.totalCompany}
          </p>
          <p className="mt-2 text-2xl font-semibold text-emerald-950">{formatCount(data.length)}</p>
          <p className="mt-1 text-sm text-emerald-900/75">{copy.totalCompanyDescription}</p>
        </div>
        <div className="rounded-2xl border border-sky-100 bg-sky-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
            {copy.totalAssets}
          </p>
          <p className="mt-2 text-2xl font-semibold text-sky-950">{formatCount(totalAssets)}</p>
          <p className="mt-1 text-sm text-sky-900/75">
            {copy.averageAssetsPerCompany(averageAssetsPerLocation.toFixed(1))}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
            {copy.dominantCompany}
          </p>
          <p className="mt-2 line-clamp-1 text-lg font-semibold text-amber-950">
            {formatLocation(topLocation.location)}
          </p>
          <p className="mt-1 text-sm text-amber-900/75">
            {copy.currentAssets(formatCount(topLocation.total))}
          </p>
        </div>
      </div>

      <div className={showLocationChart ? "grid gap-5 xl:grid-cols-[minmax(0,1.08fr)_320px]" : "grid gap-4 xl:grid-cols-2"}>
        {showLocationChart ? (
          <div className="rounded-3xl border border-emerald-100/80 bg-[linear-gradient(180deg,#fbfffc_0%,#f1fbf4_100%)] p-3 sm:p-4">
            <div className="space-y-4">
              {chartData.map((item) => {
                const percentage = totalAssets ? (item.total / totalAssets) * 100 : 0;

                return (
                  <div
                    key={item.location}
                    className="grid grid-cols-[minmax(0,116px)_minmax(0,1fr)_auto] items-center gap-3"
                    title={`${formatLocation(item.location)} - ${formatCount(item.total)} ${copy.assets}`}
                  >
                    <p className="text-sm font-medium text-slate-900">
                      {truncateLabel(formatLocation(item.location), 16)}
                    </p>
                    <div className="relative h-5 overflow-hidden rounded-full bg-[repeating-linear-gradient(90deg,#d6e9dd_0,#d6e9dd_1px,transparent_1px,transparent_20%)]">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-700"
                        style={{ width: `${Math.max(percentage, 4)}%` }}
                      />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">
                      {formatCount(item.total)}
                    </p>
                  </div>
                );
              })}

              <div className="grid grid-cols-[116px_minmax(0,1fr)_auto] items-center gap-3 pt-2 text-xs text-slate-500">
                <span />
                <div className="flex justify-between">
                  <span>0</span>
                  <span>{formatCount(Math.round(totalAssets * 0.25))}</span>
                  <span>{formatCount(Math.round(totalAssets * 0.5))}</span>
                  <span>{formatCount(Math.round(totalAssets * 0.75))}</span>
                  <span>{formatCount(totalAssets)}</span>
                </div>
                <span />
              </div>
            </div>
          </div>
        ) : null}

        <div className={showLocationChart ? "space-y-4" : "grid gap-4 xl:grid-cols-2 xl:col-span-2"}>
          <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">{copy.coverageTitle}</p>
                <p className="text-sm text-slate-500">{copy.coverageDescription}</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {mappedPercentage.toFixed(1)}%
              </span>
            </div>

            <div className="mt-4 space-y-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{copy.mappedAssets}</p>
                    <p className="text-xs text-slate-500">{copy.mappedAssetsDescription}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-emerald-700">{formatCount(mappedAssets)}</p>
                    <p className="text-xs text-slate-500">{mappedPercentage.toFixed(1)}%</p>
                  </div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-700"
                    style={{ width: `${Math.max(mappedPercentage, 6)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{copy.unmappedAssets}</p>
                    <p className="text-xs text-slate-500">{copy.unmappedAssetsDescription}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-amber-700">{formatCount(unmappedAssets)}</p>
                    <p className="text-xs text-slate-500">{(100 - mappedPercentage).toFixed(1)}%</p>
                  </div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500"
                    style={{ width: `${Math.max(100 - mappedPercentage, unmappedAssets > 0 ? 6 : 0)}%` }}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/90 p-3">
                <p className="text-sm text-slate-600">
                  {mappedAssets > 0
                    ? copy.mappedSummary(formatCount(mappedAssets))
                    : copy.unmappedSummary}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  {copy.detectedCompanies}
                </p>
                <p className="mt-2 text-xl font-semibold text-emerald-950">
                  {formatCount(mappedLocations)}
                </p>
                <p className="mt-1 text-xs text-emerald-900/75">
                  {copy.detectedCompaniesDescription(copy.noCompany)}
                </p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                  {copy.missingCompany}
                </p>
                <p className="mt-2 text-xl font-semibold text-amber-950">
                  {formatCount(unmappedAssets)}
                </p>
                <p className="mt-1 text-xs text-amber-900/75">
                  {copy.missingCompanyDescription(copy.noCompany)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">{copy.rankingTitle}</p>
                <p className="text-sm text-slate-500">{copy.rankingDescription}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {formatCount(data.length)} company
              </span>
            </div>

            <div className="mt-4 max-h-[420px] space-y-3 overflow-y-auto pr-1">
              {chartData.map((item, index) => {
                const percentage = totalAssets ? (item.total / totalAssets) * 100 : 0;
                const isUnmapped = item.location === UNMAPPED_LOCATION;

                return (
                  <div
                    key={item.location}
                    className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          #{index + 1}
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-slate-950">{formatLocation(item.location)}</p>
                          {isUnmapped ? (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                              {copy.needsMapping}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-emerald-700">{formatCount(item.total)}</p>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max(percentage, 6)}%`,
                          background: isUnmapped
                            ? "linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)"
                            : "linear-gradient(90deg, #34d399 0%, #10b981 55%, #047857 100%)",
                        }}
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                      <span>{copy.percentageOfTotalAssets(percentage.toFixed(1))}</span>
                      <span>{formatCount(item.total)} {copy.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            {copy.dominantCompanyTitle}
          </p>
          <p className="mt-2 text-lg font-semibold text-emerald-950">{formatLocation(topLocation.location)}</p>
          <p className="mt-1 text-sm text-emerald-900/75">
            {copy.controlsShare(topLocationShare.toFixed(1))}
          </p>
        </div>

        <div className="rounded-3xl border border-sky-100 bg-sky-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
            {copy.nextPositionGap}
          </p>
          <p className="mt-2 text-lg font-semibold text-sky-950">
            {secondLocation ? formatCount(topLocationGap) : copy.noComparison}
          </p>
          <p className="mt-1 text-sm text-sky-900/75">
            {secondLocation
              ? copy.moreAssetsThan(formatCount(topLocationGap), formatLocation(secondLocation.location))
              : copy.completeForComparison}
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
        <p className="text-sm text-slate-600">{rankingNarrative}</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-950">{copy.qualityStatusTitle}</p>
              <p className="text-sm text-slate-500">
                {copy.qualityStatusDescription}
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {copy.coverage} {mappedPercentage.toFixed(1)}%
            </span>
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-700"
              style={{ width: `${Math.max(mappedPercentage, 6)}%` }}
            />
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                {copy.assetsWithCompany}
              </p>
              <p className="mt-2 text-xl font-semibold text-emerald-950">
                {formatCount(mappedAssets)}
              </p>
              <p className="mt-1 text-xs text-emerald-900/75">{copy.percentageOfTotalAssets(mappedPercentage.toFixed(1))}.</p>
            </div>
            <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                {copy.averagePerCompany}
              </p>
              <p className="mt-2 text-xl font-semibold text-sky-950">
                {averageMappedAssetsPerLocation.toFixed(1)}
              </p>
              <p className="mt-1 text-xs text-sky-900/75">
                {copy.averagePerCompanyDescription}
              </p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                {copy.companyDominance}
              </p>
              <p className="mt-2 text-xl font-semibold text-amber-950">{topLocationShare.toFixed(1)}%</p>
              <p className="mt-1 text-xs text-amber-900/75">
                {copy.companyDominanceDescription(formatLocation(topLocation.location))}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-sm font-medium text-slate-900">{locationStatus}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-950">{copy.quickFixTitle}</p>
              <p className="text-sm text-slate-500">{copy.quickFixDescription}</p>
            </div>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              {copy.dataQuality}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {locationActions.map((action, index) => (
              <div
                key={action}
                className="flex gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                  {index + 1}
                </div>
                <p className="text-sm leading-6 text-slate-600">{action}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemsByLocationChart;

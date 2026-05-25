"use client";

import { useI18n } from "@/components/i18n/LanguageProvider";

interface OperatingSystemSpreadItem {
  name: string;
  total: number;
  percentage: number;
}

interface Props {
  data: OperatingSystemSpreadItem[];
  onSelectOs?: (osName: string) => void;
}

const copyByLocale = {
  id: {
    noData: "Data sistem operasi belum tersedia.",
    assets: "aset",
    totalAssets: "Total aset terdeteksi",
    average: "Rata-rata per OS",
    dominant: "OS dominan",
    share: "Porsi",
  },
  en: {
    noData: "Operating system data is not available yet.",
    assets: "assets",
    totalAssets: "Total detected assets",
    average: "Average per OS",
    dominant: "Dominant OS",
    share: "Share",
  },
} as const;

const BAR_COLORS = [
  "bg-emerald-500",
  "bg-sky-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-rose-500",
  "bg-cyan-500",
];

function OperatingSystemSpreadChart({ data, onSelectOs }: Props) {
  const { locale } = useI18n();
  const copy = copyByLocale[locale];
  const languageTag = locale === "en" ? "en-US" : "id-ID";
  const formatCount = (value: number) => value.toLocaleString(languageTag);

  if (!data.length) {
    return (
      <div className="flex h-[320px] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/70">
        <p className="text-sm text-slate-500">{copy.noData}</p>
      </div>
    );
  }

  const totalAssets = data.reduce((sum, item) => sum + item.total, 0);
  const topOs = data[0];
  const averagePerOs = totalAssets / data.length;
  const maxTotal = Math.max(...data.map((item) => item.total), 1);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            {copy.totalAssets}
          </p>
          <p className="mt-2 text-2xl font-semibold text-emerald-950">
            {formatCount(totalAssets)}
          </p>
        </div>
        <div className="rounded-2xl border border-sky-100 bg-sky-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
            {copy.average}
          </p>
          <p className="mt-2 text-2xl font-semibold text-sky-950">
            {averagePerOs.toFixed(1)}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
            {copy.dominant}
          </p>
          <p className="mt-2 line-clamp-1 text-lg font-semibold text-amber-950">
            {topOs.name}
          </p>
          <p className="mt-1 text-sm text-amber-900/75">
            {topOs.percentage.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white p-5">
        <div className="space-y-4">
          {data.slice(0, 10).map((item, index) => {
            const barColor = BAR_COLORS[index % BAR_COLORS.length];

            const content = (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-950">{item.name}</p>
                    <p className="text-sm text-slate-500">
                      {formatCount(item.total)} {copy.assets}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-slate-600">
                    {copy.share}: {item.percentage.toFixed(1)}%
                  </p>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${barColor}`}
                    style={{ width: `${(item.total / maxTotal) * 100}%` }}
                  />
                </div>
              </div>
            );

            if (!onSelectOs) {
              return <div key={item.name}>{content}</div>;
            }

            return (
              <button
                key={item.name}
                type="button"
                onClick={() => onSelectOs(item.name)}
                className="w-full rounded-2xl p-1 text-left transition-colors hover:bg-slate-50"
              >
                {content}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default OperatingSystemSpreadChart;

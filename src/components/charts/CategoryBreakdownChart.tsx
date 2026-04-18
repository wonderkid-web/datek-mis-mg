"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface Props {
  data: {
    name: string;
    total: number;
  }[];
}

type CategoryTooltipProps = {
  active?: boolean;
  payload?: Array<{
    value?: number;
    payload?: {
      name: string;
      total: number;
      percentage: number;
      fill: string;
    };
  }>;
};

const CHART_COLORS = [
  "#10b981",
  "#0ea5e9",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#14b8a6",
  "#6366f1",
  "#f97316",
];

const formatCount = (value: number) => value.toLocaleString("id-ID");

function CategoryTooltip({ active, payload }: CategoryTooltipProps) {
  if (!active || !payload?.length || !payload[0]?.payload) {
    return null;
  }

  const item = payload[0].payload;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-xl backdrop-blur">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
        <p className="text-sm font-semibold text-slate-950">{item.name}</p>
      </div>
      <div className="mt-2 space-y-1 text-sm text-slate-600">
        <p>
          Total aset: <span className="font-semibold text-slate-950">{formatCount(item.total)}</span>
        </p>
        <p>
          Porsi: <span className="font-semibold text-slate-950">{item.percentage.toFixed(1)}%</span>
        </p>
      </div>
    </div>
  );
}

function CategoryBreakdownChart({ data }: Props) {
  if (!data.length) {
    return (
      <div className="flex h-[350px] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/70">
        <p className="text-sm text-slate-500">Data kategori aset belum tersedia.</p>
      </div>
    );
  }

  const totalAssets = data.reduce((sum, item) => sum + item.total, 0);
  const averageAssetsPerCategory = totalAssets / data.length;
  const topThreeShare =
    totalAssets > 0
      ? (data.slice(0, 3).reduce((sum, item) => sum + item.total, 0) / totalAssets) * 100
      : 0;
  const topThreeTotal = data.slice(0, 3).reduce((sum, item) => sum + item.total, 0);
  const remainingCategoriesTotal = Math.max(totalAssets - topThreeTotal, 0);
  const categoriesBelowAverage = data.filter((item) => item.total < averageAssetsPerCategory).length;
  const topTwoTotal = data.slice(0, 2).reduce((sum, item) => sum + item.total, 0);

  const chartData = data.map((item, index) => ({
    ...item,
    percentage: totalAssets ? (item.total / totalAssets) * 100 : 0,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }));
  const dominantCategory = chartData[0];
  const smallestCategory = chartData[chartData.length - 1];
  const secondCategory = chartData[1] ?? null;
  const topTwoShare = totalAssets > 0 ? (topTwoTotal / totalAssets) * 100 : 0;
  const dominantGap = secondCategory ? dominantCategory.total - secondCategory.total : dominantCategory.total;
  const spreadPercentage = dominantCategory.percentage - smallestCategory.percentage;
  const distributionNarrative = secondCategory
    ? `${dominantCategory.name} masih memimpin, tetapi gap ke ${secondCategory.name} berada di ${formatCount(
        dominantGap
      )} aset atau ${(dominantCategory.percentage - secondCategory.percentage).toFixed(1)} poin persentase.`
    : `${dominantCategory.name} menjadi satu-satunya kategori yang saat ini terisi data aset.`;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-violet-100 bg-violet-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">
            Total Kategori
          </p>
          <p className="mt-2 text-2xl font-semibold text-violet-950">{formatCount(data.length)}</p>
          <p className="mt-1 text-sm text-violet-900/75">Kategori dengan aset yang aktif tercatat.</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Kategori Dominan
          </p>
          <p className="mt-2 line-clamp-1 text-lg font-semibold text-emerald-950">
            {dominantCategory.name}
          </p>
          <p className="mt-1 text-sm text-emerald-900/75">
            {formatCount(dominantCategory.total)} aset atau{" "}
            {((dominantCategory.total / totalAssets) * 100).toFixed(1)}% dari total.
          </p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
            Konsentrasi Top 3
          </p>
          <p className="mt-2 text-2xl font-semibold text-amber-950">{topThreeShare.toFixed(1)}%</p>
          <p className="mt-1 text-sm text-amber-900/75">
            Seberapa besar aset menumpuk di tiga kategori terbesar.
          </p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)]">
        <div className="rounded-3xl border border-slate-200/80 bg-[radial-gradient(circle_at_top,#f8fafc_0%,#eef7f1_52%,#f8fafc_100%)] p-3 sm:p-4">
          <div className="relative h-[340px]">
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Total Aset
              </p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
                {formatCount(totalAssets)}
              </p>
              <p className="mt-2 text-sm text-slate-500">Distribusi real dari kategori inventaris.</p>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CategoryTooltip />} />
                <Pie
                  data={chartData}
                  dataKey="total"
                  nameKey="name"
                  innerRadius={84}
                  outerRadius={122}
                  paddingAngle={2}
                  stroke="#ffffff"
                  strokeWidth={4}
                  isAnimationActive={false}
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-3">
          {chartData.map((item, index) => (
            <div
              key={item.name}
              className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span
                    className="mt-1 h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      #{index + 1}
                    </p>
                    <p className="text-sm font-semibold text-slate-950">{item.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-950">{formatCount(item.total)}</p>
                  <p className="text-xs text-slate-500">{item.percentage.toFixed(1)}%</p>
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(item.percentage, 6)}%`,
                    backgroundColor: item.fill,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-950">Spektrum distribusi kategori</p>
              <p className="text-sm text-slate-500">
                Lebar segmen menunjukkan kontribusi tiap kategori terhadap total aset.
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {formatCount(totalAssets)} aset
            </span>
          </div>

          <div className="mt-5 flex h-4 overflow-hidden rounded-full bg-slate-100">
            {chartData.map((item) => (
              <div
                key={item.name}
                style={{ width: `${Math.max(item.percentage, 4)}%`, backgroundColor: item.fill }}
                title={`${item.name}: ${item.percentage.toFixed(1)}%`}
              />
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {chartData.map((item) => (
              <div
                key={item.name}
                className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-1 h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.fill }}
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.percentage.toFixed(1)}% dari total</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-slate-950">{formatCount(item.total)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Dominan vs #2
              </p>
              <p className="mt-2 text-xl font-semibold text-emerald-950">
                {secondCategory ? formatCount(dominantGap) : formatCount(dominantCategory.total)}
              </p>
              <p className="mt-1 text-xs text-emerald-900/75">
                {secondCategory
                  ? `Selisih aset ${dominantCategory.name} dibanding ${secondCategory.name}.`
                  : "Belum ada kategori pembanding kedua."}
              </p>
            </div>

            <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                Top 2 Share
              </p>
              <p className="mt-2 text-xl font-semibold text-sky-950">{topTwoShare.toFixed(1)}%</p>
              <p className="mt-1 text-xs text-sky-900/75">
                Proporsi dua kategori terbesar terhadap seluruh aset.
              </p>
            </div>

            <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">
                Rentang Komposisi
              </p>
              <p className="mt-2 text-xl font-semibold text-violet-950">{spreadPercentage.toFixed(1)} pts</p>
              <p className="mt-1 text-xs text-violet-900/75">
                Selisih persentase kategori terbesar dan terkecil.
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-sm text-slate-600">{distributionNarrative}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-950">Insight kategori</p>
              <p className="text-sm text-slate-500">Ringkasan cepat untuk membaca komposisi saat ini.</p>
            </div>
            <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
              Snapshot
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Rata-rata Kategori
              </p>
              <p className="mt-2 text-xl font-semibold text-emerald-950">
                {averageAssetsPerCategory.toFixed(1)}
              </p>
              <p className="mt-1 text-xs text-emerald-900/75">Aset per kategori secara rata-rata.</p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                Kategori Terkecil
              </p>
              <p className="mt-2 text-lg font-semibold text-amber-950">{smallestCategory.name}</p>
              <p className="mt-1 text-xs text-amber-900/75">
                {formatCount(smallestCategory.total)} aset atau {smallestCategory.percentage.toFixed(1)}%.
              </p>
            </div>
            <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                Di Luar Top 3
              </p>
              <p className="mt-2 text-xl font-semibold text-sky-950">
                {remainingCategoriesTotal > 0
                  ? `${((remainingCategoriesTotal / totalAssets) * 100).toFixed(1)}%`
                  : "0.0%"}
              </p>
              <p className="mt-1 text-xs text-sky-900/75">
                {formatCount(remainingCategoriesTotal)} aset di luar tiga kategori terbesar.
              </p>
            </div>
            <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">
                Di Bawah Rata-rata
              </p>
              <p className="mt-2 text-xl font-semibold text-violet-950">
                {formatCount(categoriesBelowAverage)}
              </p>
              <p className="mt-1 text-xs text-violet-900/75">
                Jumlah kategori dengan aset di bawah rata-rata distribusi.
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-950">{dominantCategory.name}</span> masih jadi
              kategori dominan dengan {dominantCategory.percentage.toFixed(1)}% dari seluruh aset.
              {remainingCategoriesTotal > 0
                ? ` Sisanya tersebar di kategori lain sebesar ${(
                    (remainingCategoriesTotal / totalAssets) *
                    100
                  ).toFixed(1)}%.`
                : " Tidak ada sisa kategori di luar kelompok utama."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryBreakdownChart;

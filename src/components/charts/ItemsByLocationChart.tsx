"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  data: {
    location: string;
    total: number;
  }[];
}

type LocationTooltipProps = {
  active?: boolean;
  payload?: Array<{
    value?: number;
    payload?: {
      location: string;
      total: number;
    };
  }>;
};

const formatCount = (value: number) => value.toLocaleString("id-ID");

const truncateLabel = (value: string, maxLength: number) =>
  value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value;

function LocationTooltip({ active, payload }: LocationTooltipProps) {
  if (!active || !payload?.length || !payload[0]?.payload) {
    return null;
  }

  const item = payload[0].payload;

  return (
    <div className="rounded-2xl border border-emerald-100 bg-white/95 px-4 py-3 shadow-xl backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
        Lokasi
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-950">{item.location}</p>
      <p className="mt-2 text-sm text-slate-600">
        Total aset: <span className="font-semibold text-slate-950">{formatCount(item.total)}</span>
      </p>
    </div>
  );
}

function ItemsByLocationChart({ data }: Props) {
  if (!data.length) {
    return (
      <div className="flex h-[350px] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/70">
        <p className="text-sm text-slate-500">Data lokasi aset belum tersedia.</p>
      </div>
    );
  }

  const totalAssets = data.reduce((sum, item) => sum + item.total, 0);
  const topLocation = data[0];
  const averageAssetsPerLocation = totalAssets / data.length;
  const unmappedAssets = data.find((item) => item.location === "Tanpa Lokasi")?.total ?? 0;
  const mappedAssets = Math.max(totalAssets - unmappedAssets, 0);
  const mappedLocations = data.filter((item) => item.location !== "Tanpa Lokasi").length;
  const averageMappedAssetsPerLocation = mappedLocations > 0 ? mappedAssets / mappedLocations : 0;
  const mappedPercentage = totalAssets ? (mappedAssets / totalAssets) * 100 : 0;
  const topLocationShare = totalAssets ? (topLocation.total / totalAssets) * 100 : 0;
  const secondLocation = data[1] ?? null;
  const topLocationGap = secondLocation ? Math.max(topLocation.total - secondLocation.total, 0) : topLocation.total;
  const showLocationChart = mappedLocations > 0;
  const locationStatus =
    unmappedAssets === totalAssets
      ? "Distribusi lokasi belum representatif karena semua aset masih belum punya mapping lokasi."
      : unmappedAssets > 0
        ? `${formatCount(unmappedAssets)} aset masih perlu dipetakan ke lokasi fisik yang valid.`
        : "Semua aset sudah punya lokasi fisik, distribusi saat ini bisa dibaca sebagai kondisi aktual.";
  const locationActions = [
    unmappedAssets > 0
      ? `Prioritaskan update field lokasiFisik untuk ${formatCount(unmappedAssets)} aset yang masih "Tanpa Lokasi".`
      : "Pertahankan kualitas input lokasiFisik agar distribusi tetap akurat.",
    mappedLocations <= 1
      ? "Standarisasi penamaan lokasi agar aset tidak terus menumpuk di bucket yang terlalu umum."
      : "Review penamaan lokasi yang mirip agar tidak terpecah jadi beberapa bucket berbeda.",
    topLocationShare >= 60
      ? `${topLocation.location} menampung ${topLocationShare.toFixed(1)}% aset. Validasi apakah konsentrasi ini memang wajar.`
      : "Sebaran aset mulai lebih merata; fokus berikutnya adalah menjaga konsistensi mapping lokasi baru.",
  ];
  const rankingNarrative =
    data.length === 1
      ? `Ranking saat ini belum punya pembanding karena seluruh ${formatCount(totalAssets)} aset masih berada di bucket ${topLocation.location}.`
      : `${topLocation.location} memimpin dengan ${formatCount(topLocation.total)} aset, unggul ${formatCount(topLocationGap)} aset dari ${secondLocation?.location}.`;
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Total Lokasi
          </p>
          <p className="mt-2 text-2xl font-semibold text-emerald-950">{formatCount(data.length)}</p>
          <p className="mt-1 text-sm text-emerald-900/75">Lokasi fisik dengan aset tercatat.</p>
        </div>
        <div className="rounded-2xl border border-sky-100 bg-sky-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
            Total Aset
          </p>
          <p className="mt-2 text-2xl font-semibold text-sky-950">{formatCount(totalAssets)}</p>
          <p className="mt-1 text-sm text-sky-900/75">
            Rata-rata {averageAssetsPerLocation.toFixed(1)} aset per lokasi.
          </p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
            Lokasi Terpadat
          </p>
          <p className="mt-2 line-clamp-1 text-lg font-semibold text-amber-950">
            {topLocation.location}
          </p>
          <p className="mt-1 text-sm text-amber-900/75">
            {formatCount(topLocation.total)} aset saat ini.
          </p>
        </div>
      </div>

      <div className={showLocationChart ? "grid gap-5 xl:grid-cols-[minmax(0,1.08fr)_320px]" : "grid gap-4 xl:grid-cols-2"}>
        {showLocationChart ? (
          <div className="rounded-3xl border border-emerald-100/80 bg-[linear-gradient(180deg,#fbfffc_0%,#f1fbf4_100%)] p-3 sm:p-4">
            <div className="h-[260px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  layout="vertical"
                  margin={{ top: 4, right: 30, left: 8, bottom: 4 }}
                  barCategoryGap={14}
                >
                  <defs>
                    <linearGradient id="dashboard-location-bar" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="55%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#047857" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid horizontal={false} stroke="#d6e9dd" strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#5f7768", fontSize: 12 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="location"
                    width={116}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#0f172a", fontSize: 12 }}
                    tickFormatter={(value: string) => truncateLabel(value, 16)}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(16, 185, 129, 0.08)" }}
                    content={<LocationTooltip />}
                  />
                  <Bar
                    dataKey="total"
                    fill="url(#dashboard-location-bar)"
                    radius={[0, 12, 12, 0]}
                    barSize={18}
                  >
                    <LabelList
                      dataKey="total"
                      position="right"
                      offset={10}
                      formatter={(value) => formatCount(Number(value ?? 0))}
                      className="fill-slate-700 text-xs font-medium"
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : null}

        <div className={showLocationChart ? "space-y-4" : "grid gap-4 xl:grid-cols-2 xl:col-span-2"}>
          <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">Coverage lokasi aset</p>
                <p className="text-sm text-slate-500">Porsi aset yang sudah punya lokasi fisik.</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {mappedPercentage.toFixed(1)}%
              </span>
            </div>

            <div className="mt-4 space-y-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">Aset terlokasi</p>
                    <p className="text-xs text-slate-500">Sudah punya `lokasiFisik` yang valid.</p>
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
                    <p className="text-sm font-semibold text-slate-950">Aset tanpa lokasi</p>
                    <p className="text-xs text-slate-500">Masih perlu mapping ke lokasi fisik.</p>
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
                    ? `${formatCount(mappedAssets)} aset sudah bisa dibaca pada distribusi lokasi.`
                    : "Belum ada aset yang bisa dibaca pada distribusi lokasi karena semua data masih Tanpa Lokasi."}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Lokasi Terdeteksi
                </p>
                <p className="mt-2 text-xl font-semibold text-emerald-950">
                  {formatCount(mappedLocations)}
                </p>
                <p className="mt-1 text-xs text-emerald-900/75">Lokasi selain {"Tanpa Lokasi"}.</p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                  Belum Terpetakan
                </p>
                <p className="mt-2 text-xl font-semibold text-amber-950">
                  {formatCount(unmappedAssets)}
                </p>
                <p className="mt-1 text-xs text-amber-900/75">Aset masih berada di {"Tanpa Lokasi"}.</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">Ranking lokasi</p>
                <p className="text-sm text-slate-500">Urutan kontribusi aset per lokasi.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {formatCount(data.length)} lokasi
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {data.map((item, index) => {
                const percentage = totalAssets ? (item.total / totalAssets) * 100 : 0;
                const isUnmapped = item.location === "Tanpa Lokasi";

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
                          <p className="text-sm font-semibold text-slate-950">{item.location}</p>
                          {isUnmapped ? (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                              Perlu mapping
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
                      <span>{percentage.toFixed(1)}% dari total aset</span>
                      <span>{formatCount(item.total)} unit</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Lokasi Paling Dominan
                </p>
                <p className="mt-2 text-lg font-semibold text-emerald-950">{topLocation.location}</p>
                <p className="mt-1 text-xs text-emerald-900/75">
                  Menguasai {topLocationShare.toFixed(1)}% dari total aset.
                </p>
              </div>

              <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                  Gap Posisi Berikutnya
                </p>
                <p className="mt-2 text-lg font-semibold text-sky-950">
                  {secondLocation ? formatCount(topLocationGap) : "Belum ada"}
                </p>
                <p className="mt-1 text-xs text-sky-900/75">
                  {secondLocation
                    ? `${formatCount(topLocationGap)} aset lebih banyak dari ${secondLocation.location}.`
                    : "Tambahkan mapping lokasi valid agar ranking punya pembanding."}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-sm text-slate-600">{rankingNarrative}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-950">Status kualitas lokasi</p>
              <p className="text-sm text-slate-500">
                Baca distribusi ini bersama kualitas input data lokasi.
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              Coverage {mappedPercentage.toFixed(1)}%
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
                Aset Terlokasi
              </p>
              <p className="mt-2 text-xl font-semibold text-emerald-950">
                {formatCount(mappedAssets)}
              </p>
              <p className="mt-1 text-xs text-emerald-900/75">{mappedPercentage.toFixed(1)}% dari total aset.</p>
            </div>
            <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                Avg Per Lokasi
              </p>
              <p className="mt-2 text-xl font-semibold text-sky-950">
                {averageMappedAssetsPerLocation.toFixed(1)}
              </p>
              <p className="mt-1 text-xs text-sky-900/75">
                Rata-rata aset untuk tiap lokasi yang terdeteksi.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                Dominasi Lokasi
              </p>
              <p className="mt-2 text-xl font-semibold text-amber-950">{topLocationShare.toFixed(1)}%</p>
              <p className="mt-1 text-xs text-amber-900/75">
                Porsi aset yang terkonsentrasi di {topLocation.location}.
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
              <p className="text-sm font-semibold text-slate-950">Langkah perbaikan cepat</p>
              <p className="text-sm text-slate-500">Aksi yang paling relevan dari distribusi saat ini.</p>
            </div>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              Data quality
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

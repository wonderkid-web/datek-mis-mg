"use client";

import { useMemo, useState } from "react";
import {
  CalendarRange,
  ClipboardCopy,
  FileSpreadsheet,
  Loader2,
  Presentation,
  Sparkles,
} from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { getDashboardPresentationData } from "@/lib/dashboardService";

type PresentationData = Awaited<ReturnType<typeof getDashboardPresentationData>>;
type PeriodMode = "single" | "range";

const getCurrentMonthValue = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const formatCount = (value: number, locale: "id" | "en") =>
  new Intl.NumberFormat(locale === "en" ? "en-US" : "id-ID").format(value);

const formatPercent = (value: number) => `${value.toFixed(1)}%`;

const normalizeText = (value: string | null | undefined) =>
  value?.trim() ? value.replaceAll("_", " ") : "-";

const formatBucketName = (value: string) => {
  if (value === "laptop") return "Laptop";
  if (value === "intel-nuc") return "Intel NUC";
  return "Asset lainnya";
};

const buildPeriodLabel = (
  data: PresentationData,
  locale: "id" | "en"
) => {
  const languageTag = locale === "en" ? "en-US" : "id-ID";
  const monthFormatter = new Intl.DateTimeFormat(languageTag, {
    month: "long",
    year: "numeric",
  });
  const start = new Date(data.period.startDate);
  const end = new Date(data.period.endExclusiveDate);
  end.setDate(0);

  if (data.period.startMonth === data.period.endMonth) {
    return monthFormatter.format(start);
  }

  return `${monthFormatter.format(start)} - ${monthFormatter.format(end)}`;
};

const buildPresentationPrompt = (
  data: PresentationData,
  locale: "id" | "en"
) => {
  const periodLabel = buildPeriodLabel(data, locale);
  const totalAssets = formatCount(data.snapshot.metrics.totalAssets, locale);
  const assignedAssets = formatCount(data.snapshot.metrics.assignedAssets, locale);
  const unassignedAssets = formatCount(data.snapshot.metrics.unassignedAssets, locale);
  const totalAdditions = formatCount(data.additions.total, locale);

  const monthLines = data.additions.byMonth
    .map((row) => `- ${row.month}: ${formatCount(row.count, locale)} asset baru`)
    .join("\n");
  const bucketLines = data.additions.byBucket
    .map((row) => `- ${formatBucketName(row.name)}: ${formatCount(row.count, locale)} asset (${formatPercent(row.percentage)})`)
    .join("\n");
  const categoryLines = data.additions.byCategory.slice(0, 8)
    .map((row) => `- ${row.name}: ${formatCount(row.count, locale)} asset (${formatPercent(row.percentage)})`)
    .join("\n") || "- Tidak ada penambahan asset pada periode ini.";
  const companyLines = data.additions.byCompany.slice(0, 8)
    .map((row) => `- ${normalizeText(row.name)}: ${formatCount(row.count, locale)} asset (${formatPercent(row.percentage)})`)
    .join("\n") || "- Tidak ada penambahan asset pada periode ini.";

  return `Buatkan materi presentasi manajemen berdasarkan data asset DATEK periode ${periodLabel}.

Gunakan data berikut secara akurat dan jangan menambahkan angka yang tidak ada di data.

Catatan akurasi:
- Data penghapusan asset tidak disertakan karena sistem tidak menyimpan histori penghapusan asset.
- Jangan membuat analisis penghapusan asset atau net growth.
- Fokuskan narasi pada penambahan asset tercatat dan snapshot kondisi asset saat export.

Snapshot saat export:
- Total asset saat ini: ${totalAssets}
- Asset assigned saat ini: ${assignedAssets}
- Asset belum assigned saat ini: ${unassignedAssets}

Penambahan asset tercatat:
- Total asset baru periode ini: ${totalAdditions}

Penambahan per bulan:
${monthLines}

Penambahan per bucket:
${bucketLines}

Penambahan per kategori:
${categoryLines}

Penambahan per company/SBU:
${companyLines}

Susun output menjadi:
1. Executive summary singkat untuk atasan.
2. Highlight penambahan asset periode ${periodLabel}.
3. Breakdown kategori dan company/SBU yang paling relevan.
4. Kondisi snapshot asset saat export.
5. Rekomendasi tindak lanjut yang konservatif dan berbasis data.

Gunakan bahasa Indonesia formal, ringkas, dan cocok untuk slide presentasi.`;
};

const buildDataMarkdown = (
  data: PresentationData,
  locale: "id" | "en"
) => {
  const periodLabel = buildPeriodLabel(data, locale);
  const lines = [
    `# Ringkasan Data Asset DATEK`,
    ``,
    `Periode: ${periodLabel}`,
    `Generated at: ${new Intl.DateTimeFormat(locale === "en" ? "en-US" : "id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(data.generatedAt))}`,
    ``,
    `> ${data.accuracyNote}`,
    ``,
    `## Snapshot Saat Export`,
    ``,
    `- Total asset: ${formatCount(data.snapshot.metrics.totalAssets, locale)}`,
    `- Asset assigned: ${formatCount(data.snapshot.metrics.assignedAssets, locale)}`,
    `- Asset belum assigned: ${formatCount(data.snapshot.metrics.unassignedAssets, locale)}`,
    ``,
    `## Penambahan Asset Tercatat`,
    ``,
    `- Total asset baru: ${formatCount(data.additions.total, locale)}`,
    ``,
    `### Per Bulan`,
    ``,
    ...data.additions.byMonth.map((row) => `- ${row.month}: ${formatCount(row.count, locale)}`),
    ``,
    `### Per Bucket`,
    ``,
    ...data.additions.byBucket.map((row) => `- ${formatBucketName(row.name)}: ${formatCount(row.count, locale)} (${formatPercent(row.percentage)})`),
    ``,
    `### Per Kategori`,
    ``,
    ...(data.additions.byCategory.length
      ? data.additions.byCategory.map((row) => `- ${row.name}: ${formatCount(row.count, locale)} (${formatPercent(row.percentage)})`)
      : ["- Tidak ada penambahan asset pada periode ini."]),
    ``,
    `### Per Company/SBU`,
    ``,
    ...(data.additions.byCompany.length
      ? data.additions.byCompany.map((row) => `- ${normalizeText(row.name)}: ${formatCount(row.count, locale)} (${formatPercent(row.percentage)})`)
      : ["- Tidak ada penambahan asset pada periode ini."]),
  ];

  return lines.join("\n");
};

const appendJsonSheet = (
  workbook: XLSX.WorkBook,
  rows: Record<string, string | number | null>[],
  sheetName: string
) => {
  const worksheet = XLSX.utils.json_to_sheet(rows.length ? rows : [{ Keterangan: "Tidak ada data" }]);
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
};

export function DashboardPresentationExportDialog() {
  const { locale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [periodMode, setPeriodMode] = useState<PeriodMode>("single");
  const [startMonth, setStartMonth] = useState<string>(getCurrentMonthValue);
  const [endMonth, setEndMonth] = useState<string>(getCurrentMonthValue);
  const [data, setData] = useState<PresentationData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generatedPrompt = useMemo(
    () => (data ? buildPresentationPrompt(data, locale) : ""),
    [data, locale]
  );
  const markdownSummary = useMemo(
    () => (data ? buildDataMarkdown(data, locale) : ""),
    [data, locale]
  );

  const handleGenerate = async () => {
    const resolvedEndMonth = periodMode === "single" ? startMonth : endMonth;

    if (!startMonth || !resolvedEndMonth) {
      toast.error("Pilih bulan terlebih dahulu.");
      return;
    }

    if (resolvedEndMonth < startMonth) {
      toast.error("Bulan akhir tidak boleh lebih awal dari bulan awal.");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await getDashboardPresentationData({
        startMonth,
        endMonth: resolvedEndMonth,
      });
      setData(result);
      toast.success("Data presentasi siap digunakan.");
    } catch (error) {
      console.error("Failed to generate dashboard presentation data:", error);
      toast.error("Gagal menyiapkan data presentasi.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyText = async (value: string, successMessage: string) => {
    if (!value) {
      toast.error("Belum ada data yang bisa disalin.");
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      toast.success(successMessage);
    } catch (error) {
      console.error("Failed to copy text:", error);
      toast.error("Gagal menyalin teks.");
    }
  };

  const handleExcelExport = () => {
    if (!data) {
      toast.error("Generate data terlebih dahulu.");
      return;
    }

    const workbook = XLSX.utils.book_new();
    const periodLabel = buildPeriodLabel(data, locale);

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet([
        ["Field", "Value"],
        ["Periode", periodLabel],
        ["Generated At", data.generatedAt],
        ["Catatan Akurasi", data.accuracyNote],
        ["Total Asset Saat Ini", data.snapshot.metrics.totalAssets],
        ["Asset Assigned Saat Ini", data.snapshot.metrics.assignedAssets],
        ["Asset Belum Assigned Saat Ini", data.snapshot.metrics.unassignedAssets],
        ["Asset Baru Periode Ini", data.additions.total],
      ]),
      "Ringkasan"
    );

    appendJsonSheet(
      workbook,
      data.additions.byMonth.map((row) => ({
        Bulan: row.month,
        "Asset Baru": row.count,
      })),
      "Tambah Per Bulan"
    );

    appendJsonSheet(
      workbook,
      data.additions.byBucket.map((row) => ({
        Bucket: formatBucketName(row.name),
        "Asset Baru": row.count,
        Persentase: formatPercent(row.percentage),
      })),
      "Tambah Per Bucket"
    );

    appendJsonSheet(
      workbook,
      data.additions.byCategory.map((row) => ({
        Kategori: row.name,
        "Asset Baru": row.count,
        Persentase: formatPercent(row.percentage),
      })),
      "Tambah Per Kategori"
    );

    appendJsonSheet(
      workbook,
      data.additions.byCompany.map((row) => ({
        "Company/SBU": normalizeText(row.name),
        "Asset Baru": row.count,
        Persentase: formatPercent(row.percentage),
      })),
      "Tambah Per Company"
    );

    appendJsonSheet(
      workbook,
      data.additions.details.map((asset) => ({
        ID: asset.id,
        "Nama Asset": asset.assetName,
        "Nomor Seri": asset.serialNumber,
        "Nomor Asset": asset.assetNumber,
        Kategori: asset.category,
        Bucket: formatBucketName(asset.bucket),
        "Company/SBU": normalizeText(asset.company),
        "Assigned To": normalizeText(asset.assignedTo),
        Homebase: normalizeText(asset.homebase),
        Status: asset.status,
        "Created At": asset.createdAt,
      })),
      "Detail Asset Baru"
    );

    XLSX.writeFile(workbook, `datek-dashboard-presentasi-${data.period.startMonth}-${data.period.endMonth}.xlsx`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="bg-white/15 text-white hover:bg-white/25">
          <Presentation className="mr-2 h-4 w-4" />
          Bahan Presentasi
        </Button>
      </DialogTrigger>
      <DialogContent size="5xl" className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            Generate bahan presentasi dashboard
          </DialogTitle>
          <DialogDescription>
            Data penghapusan asset tidak disertakan agar output tetap akurat untuk kebutuhan manajemen.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50/70 p-4 md:grid-cols-[180px_1fr_1fr_auto] md:items-end">
          <div className="space-y-2">
            <Label>Mode periode</Label>
            <Select value={periodMode} onValueChange={(value) => setPeriodMode(value as PeriodMode)}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Satu bulan</SelectItem>
                <SelectItem value="range">Range bulan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{periodMode === "single" ? "Bulan" : "Bulan awal"}</Label>
            <Input
              type="month"
              value={startMonth}
              onChange={(event) => {
                setStartMonth(event.target.value);
                if (periodMode === "single") {
                  setEndMonth(event.target.value);
                }
              }}
              className="bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label>Bulan akhir</Label>
            <Input
              type="month"
              value={periodMode === "single" ? startMonth : endMonth}
              onChange={(event) => setEndMonth(event.target.value)}
              disabled={periodMode === "single"}
              className="bg-white"
            />
          </div>

          <Button onClick={handleGenerate} disabled={isGenerating} className="whitespace-nowrap">
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CalendarRange className="mr-2 h-4 w-4" />
            )}
            Generate
          </Button>
        </div>

        {data ? (
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-950">Prompt presentasi</h3>
                  <p className="text-xs text-slate-500">Siap ditempel ke AI/pembuat slide.</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyText(generatedPrompt, "Prompt berhasil disalin.")}
                >
                  <ClipboardCopy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
              </div>
              <Textarea value={generatedPrompt} readOnly className="min-h-[360px] resize-y bg-white font-mono text-xs leading-5" />
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-950">Data pendukung</h3>
                  <p className="text-xs text-slate-500">Ringkasan Markdown dan export Excel dari sumber data yang sama.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyText(markdownSummary, "Ringkasan Markdown berhasil disalin.")}
                  >
                    <ClipboardCopy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExcelExport}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Excel
                  </Button>
                </div>
              </div>
              <Textarea value={markdownSummary} readOnly className="min-h-[360px] resize-y bg-white font-mono text-xs leading-5" />
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
            <p className="text-sm font-medium text-slate-700">Pilih periode, lalu generate data.</p>
            <p className="mt-1 text-sm text-slate-500">
              Output akan berisi penambahan asset tercatat dan snapshot kondisi asset saat export.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

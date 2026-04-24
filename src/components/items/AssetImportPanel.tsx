"use client";

import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ASSET_IMPORT_CONFIG, AssetImportFamily, ParsedAssetImportRow } from "@/lib/assetImportConfig";
import {
  createMissingAssetImportMasterData,
  importAssetRows,
  previewAssetImport,
  AssetImportMissingMasterDataGroup,
  AssetImportPreviewResult,
} from "@/lib/assetBulkImportService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getErrorMessage } from "@/lib/errorMessage";

interface AssetImportPanelProps {
  family: AssetImportFamily;
}

function normalizeHeader(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function hasRowContent(row: ParsedAssetImportRow) {
  return Object.values(row).some((value) => String(value ?? "").trim().length > 0);
}

export function AssetImportPanel({ family }: AssetImportPanelProps) {
  const router = useRouter();
  const config = ASSET_IMPORT_CONFIG[family];
  const [fileName, setFileName] = useState("");
  const [parsedRows, setParsedRows] = useState<ParsedAssetImportRow[]>([]);
  const [preview, setPreview] = useState<AssetImportPreviewResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isCreatingMasterData, setIsCreatingMasterData] = useState(false);

  const headerAliasMap = useMemo(() => {
    const entries = new Map<string, keyof ParsedAssetImportRow>();

    config.columns.forEach((column) => {
      entries.set(normalizeHeader(column.templateHeader), column.key);
      column.aliases.forEach((alias) => {
        entries.set(normalizeHeader(alias), column.key);
      });
    });

    return entries;
  }, [config.columns]);

  const handleDownloadTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet([config.sampleRow]);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, config.label);
    XLSX.writeFile(workbook, `template-import-${family.toLowerCase()}.xlsx`);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const fileBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(fileBuffer, {
        type: "array",
        cellDates: true,
      });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
        defval: "",
        raw: false,
        dateNF: "yyyy-mm-dd",
      });

      const normalizedRows = rawRows
        .map((rawRow) => {
          const parsedRow: ParsedAssetImportRow = {};

          Object.entries(rawRow).forEach(([header, value]) => {
            const key = headerAliasMap.get(normalizeHeader(header));
            if (!key) {
              return;
            }

            parsedRow[key] = String(value ?? "").trim();
          });

          return parsedRow;
        })
        .filter(hasRowContent);

      setFileName(file.name);
      setParsedRows(normalizedRows);
      setPreview(null);

      if (!normalizedRows.length) {
        toast.error("File tidak berisi row yang bisa diproses.");
        return;
      }

      toast.success(`${normalizedRows.length} row berhasil dibaca dari file.`);
    } catch (error) {
      console.error("Failed to parse import file:", error);
      toast.error("File gagal dibaca. Pastikan format Excel sesuai template.");
      setFileName("");
      setParsedRows([]);
      setPreview(null);
    }
  };

  const handleValidate = async () => {
    if (!parsedRows.length) {
      toast.error("Pilih file import dulu.");
      return;
    }

    setIsValidating(true);

    try {
      const result = await previewAssetImport(family, parsedRows);
      setPreview(result);

      if (result.invalidRows > 0) {
        const firstInvalidRow = result.rows.find((row) => !row.isValid);
        toast.error(
          firstInvalidRow?.errors.length
            ? `Row ${firstInvalidRow.rowNumber}: ${firstInvalidRow.errors[0]}`
            : `Ada ${result.invalidRows} row yang masih invalid.`
        );
        return;
      }

      toast.success(`Semua ${result.validRows} row siap diimport.`);
    } catch (error) {
      console.error("Failed to validate import file:", error);
      toast.error(getErrorMessage(error, "Validasi import gagal diproses."));
    } finally {
      setIsValidating(false);
    }
  };

  const handleImport = async () => {
    if (!parsedRows.length) {
      toast.error("Pilih file import dulu.");
      return;
    }

    if (!preview) {
      toast.error("Jalankan preview dulu sebelum import.");
      return;
    }

    if (preview.invalidRows > 0) {
      toast.error("Masih ada row invalid. Perbaiki file dulu.");
      return;
    }

    setIsImporting(true);

    try {
      const result = await importAssetRows(family, parsedRows);

      if (result.failedRows.length > 0) {
        const firstFailedRow = result.failedRows[0];
        toast.error(
          firstFailedRow
            ? `Import selesai sebagian. ${result.importedRows} berhasil, ${result.failedRows.length} gagal. Row ${firstFailedRow.rowNumber}: ${firstFailedRow.error}`
            : `Import selesai sebagian. ${result.importedRows} berhasil, ${result.failedRows.length} gagal.`
        );
      } else {
        toast.success(`${result.importedRows} asset ${config.label} berhasil diimport.`);
      }

      const refreshedPreview = await previewAssetImport(family, parsedRows);
      setPreview(refreshedPreview);
      router.refresh();
    } catch (error) {
      console.error("Failed to import rows:", error);
      toast.error(getErrorMessage(error, "Import asset gagal diproses."));
    } finally {
      setIsImporting(false);
    }
  };

  const handleCreateMissingMasterData = async () => {
    if (!parsedRows.length) {
      toast.error("Pilih file import dulu.");
      return;
    }

    if (!preview?.missingMasterData.length) {
      toast.error("Tidak ada master data yang perlu dibuat.");
      return;
    }

    setIsCreatingMasterData(true);

    try {
      const result = await createMissingAssetImportMasterData(family, parsedRows);
      const refreshedPreview = await previewAssetImport(family, parsedRows);
      setPreview(refreshedPreview);

      toast.success(
        `${result.createdItems} master data dibuat dari ${result.groups.length} kategori.`
      );
    } catch (error) {
      console.error("Failed to create missing master data:", error);
      toast.error(getErrorMessage(error, "Gagal membuat master data yang belum ada."));
    } finally {
      setIsCreatingMasterData(false);
    }
  };

  const handleCopyMissingSql = async () => {
    if (!preview?.missingMasterDataSql) {
      toast.error("Tidak ada SQL yang bisa disalin.");
      return;
    }

    try {
      await navigator.clipboard.writeText(preview.missingMasterDataSql);
      toast.success("SQL master data berhasil disalin.");
    } catch (error) {
      console.error("Failed to copy SQL:", error);
      toast.error("Gagal menyalin SQL.");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{config.label}</CardTitle>
          <CardDescription>{config.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {config.columns.map((column) => (
              <Badge key={column.templateHeader} variant="secondary">
                {column.templateHeader}
              </Badge>
            ))}
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="md:max-w-sm"
            />
            <Button type="button" variant="outline" onClick={handleDownloadTemplate}>
              Download Template
            </Button>
            <Button type="button" onClick={handleValidate} disabled={isValidating || !parsedRows.length}>
              {isValidating ? "Validating..." : "Validate & Preview"}
            </Button>
            <Button
              type="button"
              onClick={handleImport}
              disabled={isImporting || !preview || preview.invalidRows > 0 || preview.validRows === 0}
            >
              {isImporting ? "Importing..." : `Import ${preview?.validRows ?? 0} Rows`}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            {fileName ? `File: ${fileName}` : "Belum ada file dipilih."}
          </div>
        </CardContent>
      </Card>

      {preview ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Rows</CardDescription>
              <CardTitle>{preview.totalRows}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Valid Rows</CardDescription>
              <CardTitle className="text-emerald-600">{preview.validRows}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Invalid Rows</CardDescription>
              <CardTitle className="text-red-600">{preview.invalidRows}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      ) : null}

      {preview?.missingMasterData.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Master Data Belum Ada</CardTitle>
            <CardDescription>
              Ini daftar value master data yang bikin import invalid. Bisa dibuat otomatis, atau copy SQL jika mau inject manual.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {preview.missingMasterData.map((group) => (
                <MissingMasterDataGroupCard key={group.key} group={group} />
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={handleCreateMissingMasterData}
                disabled={isCreatingMasterData}
              >
                {isCreatingMasterData
                  ? "Creating Master Data..."
                  : "Create Master Data yang Belum Ada"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCopyMissingSql}
              >
                Copy SQL
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {preview ? (
        <Card>
          <CardHeader>
            <CardTitle>Preview Import</CardTitle>
            <CardDescription>
              Import hanya bisa dijalankan kalau semua row valid.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Row</TableHead>
                    <TableHead>{family === "PC" ? "Brand" : "Model"}</TableHead>
                    <TableHead>Serial Number</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Validation</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.rows.map((row) => (
                    <TableRow key={`${row.rowNumber}-${row.serialNumber}`}>
                      <TableCell>{row.rowNumber}</TableCell>
                      <TableCell>{row.summary || "-"}</TableCell>
                      <TableCell>{row.serialNumber || "-"}</TableCell>
                      <TableCell>{row.statusAsset || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={row.isValid ? "default" : "destructive"}>
                          {row.isValid ? "Valid" : "Invalid"}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md whitespace-normal text-sm text-muted-foreground">
                        {row.errors.length ? row.errors.join(" ") : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function MissingMasterDataGroupCard({
  group,
}: {
  group: AssetImportMissingMasterDataGroup;
}) {
  return (
    <div className="rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="font-medium">{group.label}</div>
        <Badge variant="secondary">{group.items.length}</Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        {group.items.map((item) => (
          <Badge key={item} variant="outline">
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}

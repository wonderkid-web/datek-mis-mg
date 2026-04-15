"use client";

import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  EMPLOYEE_IMPORT_COLUMNS,
  EMPLOYEE_IMPORT_SAMPLE_ROW,
  ParsedEmployeeImportRow,
} from "@/lib/employeeImportConfig";
import {
  importEmployeeRows,
  previewEmployeeImport,
  EmployeeImportPreviewResult,
} from "@/lib/employeeBulkImportService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function normalizeHeader(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function hasRowContent(row: ParsedEmployeeImportRow) {
  return Object.values(row).some((value) => String(value ?? "").trim().length > 0);
}

export function EmployeeImportPanel() {
  const router = useRouter();
  const [fileName, setFileName] = useState("");
  const [parsedRows, setParsedRows] = useState<ParsedEmployeeImportRow[]>([]);
  const [preview, setPreview] = useState<EmployeeImportPreviewResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const headerAliasMap = useMemo(() => {
    const entries = new Map<string, keyof ParsedEmployeeImportRow>();

    EMPLOYEE_IMPORT_COLUMNS.forEach((column) => {
      entries.set(normalizeHeader(column.templateHeader), column.key);
      column.aliases.forEach((alias) => {
        entries.set(normalizeHeader(alias), column.key);
      });
    });

    return entries;
  }, []);

  const handleDownloadTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet([EMPLOYEE_IMPORT_SAMPLE_ROW]);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Employee");
    XLSX.writeFile(workbook, "template-import-employee.xlsx");
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
      });

      const normalizedRows = rawRows
        .map((rawRow) => {
          const parsedRow: ParsedEmployeeImportRow = {};

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

      toast.success(`${normalizedRows.length} row employee berhasil dibaca dari file.`);
    } catch (error) {
      console.error("Failed to parse employee import file:", error);
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
      const result = await previewEmployeeImport(parsedRows);
      setPreview(result);

      if (result.invalidRows > 0) {
        toast.error(`Ada ${result.invalidRows} row employee yang masih invalid.`);
        return;
      }

      toast.success(`Semua ${result.validRows} row employee siap diimport.`);
    } catch (error) {
      console.error("Failed to validate employee import:", error);
      toast.error("Validasi employee import gagal diproses.");
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
      const result = await importEmployeeRows(parsedRows);

      if (result.failedRows.length > 0) {
        toast.error(
          `Import selesai sebagian. ${result.importedRows} berhasil, ${result.failedRows.length} gagal.`
        );
      } else {
        toast.success(`${result.importedRows} employee berhasil diimport.`);
      }

      const refreshedPreview = await previewEmployeeImport(parsedRows);
      setPreview(refreshedPreview);
      router.refresh();
    } catch (error) {
      console.error("Failed to import employee rows:", error);
      toast.error("Import employee gagal diproses.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Import Employee</CardTitle>
          <CardDescription>
            Bulk create employee dengan nama field biasa, tanpa perlu input manual satu per satu.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {EMPLOYEE_IMPORT_COLUMNS.map((column) => (
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
            <Button
              type="button"
              onClick={handleValidate}
              disabled={isValidating || !parsedRows.length}
            >
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
                    <TableHead>Full Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Validation</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.rows.map((row) => (
                    <TableRow key={`${row.rowNumber}-${row.summary}`}>
                      <TableCell>{row.rowNumber}</TableCell>
                      <TableCell>{row.summary || "-"}</TableCell>
                      <TableCell>{row.email || "-"}</TableCell>
                      <TableCell>{row.isActive ? "Yes" : "No"}</TableCell>
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

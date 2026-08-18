"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

// Helper function to safely access nested properties
const getNestedValue = (obj: any, path: string): any => {
  if (obj === null || obj === undefined) {
    return "";
  }
  const value = path.split('.').reduce((acc, part) => acc && acc[part], obj);
  // Handle date objects
  if (value instanceof Date) {
    return value.toLocaleDateString();
  }
  return value !== null && value !== undefined ? value : "";
};

const PDF_MARGIN = 36;
const PDF_BRAND_COLOR: [number, number, number] = [16, 122, 87];
const PDF_HEADER_TEXT: [number, number, number] = [17, 24, 39];
const PDF_MUTED_TEXT: [number, number, number] = [107, 114, 128];

const humanizeFileName = (fileName: string) =>
  fileName
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

interface ExportActionsProps<TData extends object> {
  data: TData[];
  fileName: string;
  columns: {
    header: string;
    accessorKey?: string;
    accessorFn?: (row: TData, index: number) => unknown;
  }[];
  getExportData?: () => Promise<TData[]>;
  /** Judul besar di header PDF. Default: diturunkan dari fileName. */
  title?: string;
  /** Baris keterangan tambahan di bawah judul (mis. filter yang sedang aktif). */
  subtitle?: string;
  /** Default: otomatis (landscape bila kolom lebih dari 5). */
  orientation?: "portrait" | "landscape";
}

export function ExportActions<TData extends object>({
  data,
  fileName,
  columns,
  getExportData,
  title,
  subtitle,
  orientation,
}: ExportActionsProps<TData>) {
  const [isExporting, setIsExporting] = useState<"excel" | "pdf" | null>(null);

  const resolveExportData = async () => {
    if (!getExportData) {
      return data;
    }

    return getExportData();
  };

  const getCellValue = (row: TData, column: ExportActionsProps<TData>["columns"][number], index: number) =>
    column.accessorFn
      ? column.accessorFn(row, index)
      : getNestedValue(row, column.accessorKey ?? "");

  const handleExcelExport = async () => {
    setIsExporting("excel");
    try {
      const exportData = await resolveExportData();
      if (!exportData.length) {
        toast.error("Tidak ada data yang bisa diexport.");
        return;
      }

      // For Excel, we create a flattened structure with headers as keys
      const flattenedData = exportData.map((row, index) => {
        const newRow: { [key: string]: any } = {};
        columns.forEach((col) => {
          newRow[col.header] = getCellValue(row, col, index);
        });
        return newRow;
      });

      const worksheet = XLSX.utils.json_to_sheet(flattenedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
      XLSX.writeFile(workbook, `${fileName}.xlsx`);
    } catch (error) {
      console.error("Failed to export Excel:", error);
      toast.error("Gagal menyiapkan export Excel.");
    } finally {
      setIsExporting(null);
    }
  };

  const handlePdfExport = async () => {
    setIsExporting("pdf");
    try {
      const exportData = await resolveExportData();
      if (!exportData.length) {
        toast.error("Tidak ada data yang bisa diexport.");
        return;
      }

      const resolvedOrientation =
        orientation ?? (columns.length > 5 ? "landscape" : "portrait");
      const doc = new jsPDF({
        orientation: resolvedOrientation,
        unit: "pt",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const documentTitle = title ?? humanizeFileName(fileName);
      const printedAt = new Date().toLocaleString("id-ID", {
        dateStyle: "long",
        timeStyle: "short",
      });

      const drawHeader = () => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(...PDF_HEADER_TEXT);
        doc.text(documentTitle, PDF_MARGIN, PDF_MARGIN + 6);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...PDF_MUTED_TEXT);
        const metaLine = `Dicetak: ${printedAt}  •  Total data: ${exportData.length}`;
        doc.text(metaLine, PDF_MARGIN, PDF_MARGIN + 22);
        if (subtitle) {
          doc.text(subtitle, PDF_MARGIN, PDF_MARGIN + 35);
        }

        const ruleY = PDF_MARGIN + (subtitle ? 44 : 31);
        doc.setDrawColor(...PDF_BRAND_COLOR);
        doc.setLineWidth(1.2);
        doc.line(PDF_MARGIN, ruleY, pageWidth - PDF_MARGIN, ruleY);
      };

      const tableHead = columns.map((col) => col.header);
      const tableBody = exportData.map((row, index) =>
        columns.map((col) => {
          const value = getCellValue(row, col, index);
          return value === null || value === undefined || value === ""
            ? "-"
            : String(value);
        })
      );

      const headerHeight = subtitle ? 60 : 48;

      autoTable(doc, {
        head: [tableHead],
        body: tableBody,
        startY: PDF_MARGIN + headerHeight,
        margin: {
          top: PDF_MARGIN + headerHeight,
          right: PDF_MARGIN,
          bottom: PDF_MARGIN + 20,
          left: PDF_MARGIN,
        },
        theme: "grid",
        styles: {
          font: "helvetica",
          fontSize: 8,
          cellPadding: 5,
          overflow: "linebreak",
          valign: "middle",
          textColor: [31, 41, 55],
          lineColor: [226, 232, 240],
          lineWidth: 0.5,
        },
        headStyles: {
          fillColor: PDF_BRAND_COLOR,
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 8.5,
          halign: "left",
        },
        alternateRowStyles: {
          fillColor: [246, 249, 248],
        },
        columnStyles: {
          0: { cellWidth: 34, halign: "center" },
        },
        didDrawPage: drawHeader,
      });

      const totalPages = doc.getNumberOfPages();
      for (let page = 1; page <= totalPages; page += 1) {
        doc.setPage(page);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...PDF_MUTED_TEXT);
        doc.text(
          `Halaman ${page} dari ${totalPages}`,
          pageWidth - PDF_MARGIN,
          pageHeight - PDF_MARGIN / 2,
          { align: "right" }
        );
        doc.text(documentTitle, PDF_MARGIN, pageHeight - PDF_MARGIN / 2);
      }

      doc.save(`${fileName}.pdf`);
    } catch (error) {
      console.error("Failed to export PDF:", error);
      toast.error("Gagal menyiapkan export PDF.");
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="whitespace-nowrap"
        onClick={handleExcelExport}
        disabled={isExporting !== null}
      >
        <FileDown className="mr-2 h-4 w-4" />
        {isExporting === "excel" ? "Preparing..." : "Excel"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="whitespace-nowrap"
        onClick={handlePdfExport}
        disabled={isExporting !== null}
      >
        <FileDown className="mr-2 h-4 w-4" />
        {isExporting === "pdf" ? "Preparing..." : "PDF"}
      </Button>
    </div>
  );
}

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

interface ExportActionsProps<TData extends object> {
  data: TData[];
  fileName: string;
  columns: { header: string; accessorKey: string }[];
  getExportData?: () => Promise<TData[]>;
}

export function ExportActions<TData extends object>({
  data,
  fileName,
  columns,
  getExportData,
}: ExportActionsProps<TData>) {
  const [isExporting, setIsExporting] = useState<"excel" | "pdf" | null>(null);

  const resolveExportData = async () => {
    if (!getExportData) {
      return data;
    }

    return getExportData();
  };

  const handleExcelExport = async () => {
    setIsExporting("excel");
    try {
      const exportData = await resolveExportData();
      if (!exportData.length) {
        toast.error("Tidak ada data yang bisa diexport.");
        return;
      }

      // For Excel, we create a flattened structure with headers as keys
      const flattenedData = exportData.map((row) => {
        const newRow: { [key: string]: any } = {};
        columns.forEach((col) => {
          newRow[col.header] = getNestedValue(row, col.accessorKey);
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

      const doc = new jsPDF();

      const tableHead = columns.map((col) => col.header);
      const tableBody = exportData.map((row) =>
        columns.map((col) => {
          const value = getNestedValue(row, col.accessorKey);
          return String(value);
        })
      );

      autoTable(doc, {
        head: [tableHead],
        body: tableBody,
      });

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

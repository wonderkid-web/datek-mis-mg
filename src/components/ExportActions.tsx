"use client";

import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
}

export function ExportActions<TData extends object>({
  data,
  fileName,
  columns,
}: ExportActionsProps<TData>) {
  const handleExcelExport = () => {
    // For Excel, we create a flattened structure with headers as keys
    const flattenedData = data.map((row) => {
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
  };

  const handlePdfExport = () => {
    const doc = new jsPDF();

    const tableHead = columns.map((col) => col.header);
    const tableBody = data.map((row) =>
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
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={handleExcelExport}>
        <FileDown className="mr-2 h-4 w-4" />
        Excel
      </Button>
      <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={handlePdfExport}>
        <FileDown className="mr-2 h-4 w-4" />
        PDF
      </Button>
    </div>
  );
}

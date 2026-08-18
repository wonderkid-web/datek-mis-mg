"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "../ui/skeleton";
import { ExportActions } from "../ExportActions";
import type {
  DashboardRecordRow,
  DashboardRecordType,
} from "@/lib/dashboardRecordsService";

const PAGE_SIZE = 10;
const EXPORT_CHUNK_SIZE = 500;

const integerFormatter = new Intl.NumberFormat("id-ID");
const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

type RecordColumn = {
  key: string;
  header: string;
  align?: "left" | "right";
  format?: (value: DashboardRecordRow[string]) => string;
};

const formatDate = (value: DashboardRecordRow[string]) => {
  if (!value) return "-";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const formatDateTime = (value: DashboardRecordRow[string]) => {
  if (!value) return "-";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
};

const formatNumber = (value: DashboardRecordRow[string]) =>
  value === null || value === undefined || value === ""
    ? "-"
    : integerFormatter.format(Number(value));

const formatCurrency = (value: DashboardRecordRow[string]) =>
  value === null || value === undefined || value === ""
    ? "-"
    : currencyFormatter.format(Number(value));

const formatSpeed = (value: DashboardRecordRow[string]) =>
  value === null || value === undefined || value === ""
    ? "-"
    : `${Number(value).toFixed(2)} Mbps`;

const formatTemperature = (value: DashboardRecordRow[string]) =>
  value === null || value === undefined || value === ""
    ? "-"
    : `${Number(value)} °C`;

const RECORD_COLUMNS: Record<DashboardRecordType, RecordColumn[]> = {
  "service-record": [
    { key: "date", header: "Tanggal", format: formatDateTime },
    { key: "ticketHelpdesk", header: "No. Tiket" },
    { key: "assetNumber", header: "Asset Number" },
    { key: "assetName", header: "Asset Name" },
    { key: "user", header: "User" },
    { key: "repairType", header: "Repair Type" },
    { key: "cost", header: "Cost", align: "right", format: formatCurrency },
    { key: "remarks", header: "Remarks" },
  ],
  "computer-maintenance": [
    { key: "date", header: "Periode", format: formatDate },
    { key: "assetNumber", header: "Asset Number" },
    { key: "assetName", header: "Asset Name" },
    { key: "user", header: "User" },
    { key: "company", header: "Company" },
    { key: "connection", header: "Connection" },
    { key: "storageSystemC", header: "Storage C" },
    { key: "storageDataD", header: "Storage D" },
    { key: "health", header: "Health" },
    {
      key: "temperature",
      header: "Suhu",
      align: "right",
      format: formatTemperature,
    },
    { key: "remarks", header: "Remarks" },
  ],
  "printer-maintenance": [
    { key: "date", header: "Report Date", format: formatDate },
    { key: "assetDetails", header: "Asset Details" },
    {
      key: "totalPages",
      header: "Total Pages",
      align: "right",
      format: formatNumber,
    },
    { key: "blackCount", header: "Black", align: "right", format: formatNumber },
    {
      key: "yellowCount",
      header: "Yellow",
      align: "right",
      format: formatNumber,
    },
    {
      key: "magentaCount",
      header: "Magenta",
      align: "right",
      format: formatNumber,
    },
    { key: "cyanCount", header: "Cyan", align: "right", format: formatNumber },
    { key: "remarks", header: "Remarks" },
  ],
  "cctv-maintenance": [
    { key: "date", header: "Periode", format: formatDate },
    { key: "perusahaan", header: "Perusahaan" },
    { key: "lokasi", header: "Lokasi Camera" },
    { key: "sbu", header: "SBU" },
    { key: "status", header: "Status" },
    { key: "remarks", header: "Remarks" },
  ],
  "isp-report": [
    { key: "date", header: "Report Date", format: formatDate },
    { key: "sbu", header: "SBU" },
    { key: "isp", header: "ISP" },
    { key: "bandwidth", header: "Bandwidth" },
    {
      key: "downloadSpeed",
      header: "Download",
      align: "right",
      format: formatSpeed,
    },
    {
      key: "uploadSpeed",
      header: "Upload",
      align: "right",
      format: formatSpeed,
    },
    { key: "link", header: "Link" },
  ],
};

const EXPORT_FILE_NAMES: Record<DashboardRecordType, string> = {
  "service-record": "service_records",
  "computer-maintenance": "computer_maintenance",
  "printer-maintenance": "printer_maintenance",
  "cctv-maintenance": "cctv_maintenance",
  "isp-report": "isp_speed_test",
};

const renderCell = (column: RecordColumn, row: DashboardRecordRow) => {
  const value = row[column.key];
  if (column.format) {
    return column.format(value);
  }
  return value === null || value === undefined || value === ""
    ? "-"
    : String(value);
};

interface RecordTableProps {
  type: DashboardRecordType;
  title: string;
  days: number;
}

function RecordTable({ type, title, days }: RecordTableProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const [search, setSearch] = useState("");

  const columns = RECORD_COLUMNS[type];

  useEffect(() => {
    setPageIndex(0);
  }, [search, type]);

  const buildParams = (page: number, pageSize: number) =>
    new URLSearchParams({
      type,
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(days > 0 ? { days: days.toString() } : {}),
    });

  const queryParams = buildParams(pageIndex + 1, PAGE_SIZE);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboardRecords", queryParams.toString()],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/records?${queryParams.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to fetch records");
      }
      return res.json() as Promise<{
        data: DashboardRecordRow[];
        total: number;
        pageCount: number;
      }>;
    },
  });

  const rows = data?.data ?? [];
  const pageCount = data?.pageCount ?? 0;

  // Export mengambil seluruh data hasil filter, bukan hanya halaman aktif.
  const getExportData = async () => {
    const collected: DashboardRecordRow[] = [];
    let page = 1;
    let totalPages = 1;

    do {
      const res = await fetch(
        `/api/dashboard/records?${buildParams(page, EXPORT_CHUNK_SIZE).toString()}`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch records for export");
      }

      const payload = await res.json();
      collected.push(...((payload?.data ?? []) as DashboardRecordRow[]));
      totalPages = payload?.pageCount ?? 1;
      page += 1;
    } while (page <= totalPages);

    return collected;
  };

  const exportColumns = useMemo(
    () => [
      {
        header: "No.",
        accessorFn: (_row: DashboardRecordRow, index: number) => index + 1,
      },
      ...columns.map((column) => ({
        header: column.header,
        accessorFn: (row: DashboardRecordRow) => renderCell(column, row),
      })),
    ],
    [columns]
  );

  const getPaginationGroup = () => {
    if (pageCount <= 1) return [];

    const delta = 2;
    const left = pageIndex - delta;
    const right = pageIndex + delta + 1;
    const range: number[] = [];
    for (let i = 1; i <= pageCount; i++) {
      if (i === 1 || i === pageCount || (i >= left && i < right)) {
        range.push(i);
      }
    }

    const rangeWithDots: (number | string)[] = [];
    let previous: number | undefined;
    for (const i of range) {
      if (previous) {
        if (i - previous === 2) {
          rangeWithDots.push(previous + 1);
        } else if (i - previous !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      previous = i;
    }
    return rangeWithDots;
  };

  if (isError) {
    return <div className="py-6 text-sm">Failed to load data.</div>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3 py-4">
        <Input
          placeholder="Cari data..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="max-w-sm"
        />
        <ExportActions
          columns={exportColumns}
          data={rows}
          getExportData={getExportData}
          fileName={EXPORT_FILE_NAMES[type]}
          title={title}
          subtitle={
            days > 0
              ? `Periode: ${days} hari terakhir${
                  search.trim() ? `  |  Pencarian: "${search.trim()}"` : ""
                }`
              : undefined
          }
        />
      </div>
      <div className="max-h-[55vh] overflow-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">No.</TableHead>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={column.align === "right" ? "text-right" : undefined}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: PAGE_SIZE }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {Array.from({ length: columns.length + 1 }).map((__, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className="h-6" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length ? (
              rows.map((row, rowIndex) => (
                <TableRow key={row.id}>
                  <TableCell>{pageIndex * PAGE_SIZE + rowIndex + 1}</TableCell>
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={
                        column.align === "right" ? "text-right" : undefined
                      }
                    >
                      {renderCell(column, row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 py-4">
        <span className="text-sm text-muted-foreground">
          {`Page ${pageIndex + 1} of ${Math.max(pageCount, 1)} • Total ${
            data?.total ?? 0
          } data`}
        </span>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex((current) => Math.max(current - 1, 0))}
            disabled={pageIndex === 0}
          >
            Previous
          </Button>
          <div className="flex items-center space-x-1">
            {getPaginationGroup().map((page, index) =>
              typeof page === "string" ? (
                <span key={`dots-${index}`} className="px-2">
                  ...
                </span>
              ) : (
                <Button
                  key={page}
                  variant={pageIndex === page - 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPageIndex(page - 1)}
                >
                  {page}
                </Button>
              )
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPageIndex((current) =>
                current + 1 < pageCount ? current + 1 : current
              )
            }
            disabled={pageIndex + 1 >= pageCount}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ServiceRecordsDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  description?: string;
  type: DashboardRecordType | null;
  days?: number;
}

export function ServiceRecordsDetailDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  type,
  days = 30,
}: ServiceRecordsDetailDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-5xl xl:max-w-6xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        {type ? (
          <RecordTable type={type} title={title} days={days} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

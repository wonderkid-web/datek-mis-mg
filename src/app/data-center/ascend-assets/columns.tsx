"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  AscendAsset,
  AscendAssetSortDirection,
  AscendAssetSortField,
} from "@/lib/ascendAssetTypes";
import {
  getAscendCompanyLabel,
  getAscendStatusLabel,
} from "@/lib/ascendAssetMappings";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function formatDate(value: string | null) {
  return value ? dateFormatter.format(new Date(value)) : "-";
}

interface SortableHeaderProps {
  label: string;
  field: AscendAssetSortField;
  sortBy: AscendAssetSortField;
  direction: AscendAssetSortDirection;
  onSort: (field: AscendAssetSortField) => void;
}

function SortableHeader({
  label,
  field,
  sortBy,
  direction,
  onSort,
}: SortableHeaderProps) {
  const Icon =
    sortBy !== field ? ArrowUpDown : direction === "asc" ? ArrowUp : ArrowDown;

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 px-2 font-semibold"
      onClick={() => onSort(field)}
    >
      {label}
      <Icon className="ml-1 h-3.5 w-3.5" />
    </Button>
  );
}

interface CreateColumnsOptions {
  pageIndex: number;
  pageSize: number;
  sortBy: AscendAssetSortField;
  sortDirection: AscendAssetSortDirection;
  onSort: (field: AscendAssetSortField) => void;
}

export function createAscendAssetColumns({
  pageIndex,
  pageSize,
  sortBy,
  sortDirection,
  onSort,
}: CreateColumnsOptions): ColumnDef<AscendAsset>[] {
  const header = (label: string, field: AscendAssetSortField) => (
    <SortableHeader
      label={label}
      field={field}
      sortBy={sortBy}
      direction={sortDirection}
      onSort={onSort}
    />
  );

  const columns: Array<ColumnDef<AscendAsset> & { cellClassName?: string }> = [
    {
      id: "number",
      header: "No",
      cell: ({ row }) => pageIndex * pageSize + row.index + 1,
      cellClassName: "text-right tabular-nums",
    },
    {
      accessorKey: "assetCode",
      header: () => header("Asset Code", "assetCode"),
      cellClassName: "min-w-[210px] font-mono text-xs",
    },
    {
      accessorKey: "assetName",
      header: () => header("Asset Name", "assetName"),
      cellClassName: "min-w-[240px] font-medium",
    },
    {
      accessorKey: "barcode",
      header: () => header("Barcode", "barcode"),
      cellClassName: "min-w-[140px] font-mono text-xs",
      cell: ({ row }) => row.original.barcode || "-",
    },
    {
      accessorKey: "companyCode",
      header: () => header("Company", "companyCode"),
      cell: ({ row }) => getAscendCompanyLabel(row.original.companyCode),
      cellClassName: "min-w-[180px]",
    },
    {
      accessorKey: "unitCode",
      header: () => header("Unit", "unitCode"),
    },
    {
      accessorKey: "userName",
      header: () => header("User", "userName"),
      cell: ({ row }) => row.original.userName || "-",
      cellClassName: "min-w-[150px]",
    },
    {
      accessorKey: "acquisitionDate",
      header: () => header("Acquisition Date", "acquisitionDate"),
      cell: ({ row }) => formatDate(row.original.acquisitionDate),
      cellClassName: "whitespace-nowrap",
    },
    {
      accessorKey: "registerDate",
      header: () => header("Register Date", "registerDate"),
      cell: ({ row }) => formatDate(row.original.registerDate),
      cellClassName: "whitespace-nowrap",
    },
    // {
    //   accessorKey: "acquisitionCost",
    //   header: () => header("Cost", "acquisitionCost"),
    //   cell: ({ row }) => currencyFormatter.format(row.original.acquisitionCost),
    //   cellClassName: "whitespace-nowrap text-right tabular-nums",
    // },
    {
      accessorKey: "statusCode",
      header: () => header("Status", "statusCode"),
      cell: ({ row }) => getAscendStatusLabel(row.original.statusCode),
      cellClassName: "min-w-[150px] text-center",
    },
    {
      accessorKey: "disabled",
      header: () => header("State", "disabled"),
      cell: ({ row }) => (
        <Badge variant={row.original.disabled ? "secondary" : "default"}>
          {row.original.disabled ? "Inactive" : "Active"}
        </Badge>
      ),
    },
  ];

  return columns;
}

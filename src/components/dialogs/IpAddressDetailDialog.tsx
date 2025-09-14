"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpDown } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { ExportActions } from "../ExportActions";

type Row = {
  id: number;
  ip: string;
  connection: string;
  role: string;
  status: string;
  company: string | null;
  user: { namaLengkap: string } | null;
  assetAssignment?: { nomorAsset: string | null; asset?: { namaAsset: string; nomorSeri: string } } | null;
};

const columns: ColumnDef<Row>[] = [
  {
    accessorKey: "id",
    header: "#",
    cell: ({ row, table }) => {
      const { pageIndex, pageSize } = table.getState().pagination;
      return pageIndex * pageSize + row.index + 1;
    },
  },
  {
    accessorKey: "user.namaLengkap",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>User<ArrowUpDown className="ml-2 h-4 w-4" /></Button>
    ),
    cell: ({ row }) => row.original.user?.namaLengkap || "-",
  },
  { accessorKey: "ip", header: "IP Address" },
  { accessorKey: "connection", header: "Connection" },
  { accessorKey: "role", header: "Role" },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "company", header: "Company" },
  {
    accessorKey: "assetAssignment",
    header: "Asset",
    cell: ({ row }) => {
      const a = row.original.assetAssignment;
      if (!a) return "-";
      const label = [a.nomorAsset, a.asset?.namaAsset, a.asset?.nomorSeri].filter(Boolean).join(" • ");
      return label || "-";
    },
  },
];

const exportCols = [
  { header: "User", accessorKey: "user.namaLengkap" },
  { header: "IP Address", accessorKey: "ip" },
  { header: "Connection", accessorKey: "connection" },
  { header: "Role", accessorKey: "role" },
  { header: "Status", accessorKey: "status" },
  { header: "Company", accessorKey: "company" },
  { header: "Asset No", accessorKey: "assetAssignment.nomorAsset" },
  { header: "Asset Name", accessorKey: "assetAssignment.asset.namaAsset" },
  { header: "Serial Number", accessorKey: "assetAssignment.asset.nomorSeri" },
];

interface IpTableProps { filters: Record<string, any>; }

function IpTable({ filters }: IpTableProps) {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const queryParams = new URLSearchParams({
    page: (pagination.pageIndex + 1).toString(),
    pageSize: pagination.pageSize.toString(),
    q: globalFilter,
    ...filters,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["ipAddressesDialog", queryParams.toString()],
    queryFn: async () => {
      const res = await fetch(`/api/ip-addresses?${queryParams.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to fetch ip addresses");
      }
      return res.json();
    },
  });

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    pageCount: data?.pageCount ?? 0,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: { pagination, sorting, columnFilters, globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });

  const getPaginationGroup = () => {
    const pageIndex = table.getState().pagination.pageIndex;
    const pageCount = table.getPageCount();
    if (pageCount <= 1) return [];
    const delta = 2;
    const left = pageIndex - delta;
    const right = pageIndex + delta + 1;
    const range = [] as number[];
    for (let i = 1; i <= pageCount; i++) {
      if (i === 1 || i === pageCount || (i >= left && i < right)) {
        range.push(i);
      }
    }
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;
    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }
    return rangeWithDots;
  };

  if (isError) return <div>Failed to load data.</div>;

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Filter..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        <ExportActions columns={exportCols} data={data?.data ?? []} fileName="ip_addresses_export" />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: pagination.pageSize }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((col, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-6" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">No results.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between py-4">
        <span className="text-sm text-muted-foreground">Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</span>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
          <div className="flex items-center space-x-1">
            {getPaginationGroup().map((page, index) => typeof page === "string" ? (
              <span key={`dots-${index}`} className="px-2">...</span>
            ) : (
              <Button key={page} variant={table.getState().pagination.pageIndex === page - 1 ? "default" : "outline"} size="sm" onClick={() => table.setPageIndex(page - 1)}>
                {page}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
        </div>
      </div>
    </div>
  );
}

interface IpAddressesDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  filters?: Record<string, any>;
}

export function IpAddressesDetailDialog({ isOpen, onOpenChange, title, filters = {} }: IpAddressesDetailDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-fit">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <IpTable filters={filters} />
      </DialogContent>
    </Dialog>
  );
}


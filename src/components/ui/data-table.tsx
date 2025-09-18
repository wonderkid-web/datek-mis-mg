"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  PaginationState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  Table as TanstackTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";

// --- Custom Hook untuk Pagination ---
const DOTS = "...";

const usePagination = ({
  totalPageCount,
  siblingCount = 1,
  currentPage,
}: {
  totalPageCount: number;
  siblingCount?: number;
  currentPage: number;
}) => {
  const paginationRange = useMemo(() => {
    const totalPageNumbers = siblingCount + 5;

    if (totalPageNumbers >= totalPageCount) {
      return Array.from({ length: totalPageCount }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(
      currentPage + siblingCount,
      totalPageCount
    );

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPageCount - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPageCount;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, DOTS, totalPageCount];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPageCount - rightItemCount + 1 + i
      );
      return [firstPageIndex, DOTS, ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }

    return Array.from({ length: totalPageCount }, (_, i) => i + 1);
  }, [totalPageCount, siblingCount, currentPage]);

  return paginationRange;
};

// --- Komponen Pagination yang Diperbarui ---
function DataTablePagination<TData>({
  table,
}: {
  table: TanstackTable<TData>;
}) {
  const currentPage = table.getState().pagination.pageIndex + 1;
  const pageCount = table.getPageCount();

  const paginationRange = usePagination({
    currentPage,
    totalPageCount: pageCount,
  });

  return (
    <div className="flex items-center justify-between px-2 mt-4">
      <div className="flex-1 text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {currentPage} of {pageCount}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {paginationRange?.map((pageNumber, index) => {
            if (pageNumber === DOTS) {
              return (
                <span key={index} className="px-2 py-1 text-sm">...</span>
              );
            }
            return (
              <Button
                key={index}
                variant={pageNumber === currentPage ? "default" : "outline"}
                className="h-8 w-8 p-0"
                onClick={() => table.setPageIndex(Number(pageNumber) - 1)}
              >
                {pageNumber}
              </Button>
            );
          })}
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}


interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  totalCount?: number;
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "administrator";
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility: { actions: isAdmin },
      pagination,
    },
  });

  // Clamp page index when data/pageCount changes (e.g., after filtering or data refresh)
  React.useEffect(() => {
    const pageCount = table.getPageCount();
    if (pagination.pageIndex > 0 && pagination.pageIndex >= pageCount && pageCount > 0) {
      setPagination((prev) => ({ ...prev, pageIndex: pageCount - 1 }));
    }
  }, [pagination.pageIndex, pagination.pageSize, data, table]);

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-gray-200">
                {headerGroup.headers.map((header) => {
                  const columnDef = header.column.columnDef as any;
                  const headerClassName = columnDef.headerClassName;
                  const headerStyle = columnDef.headerStyle;
                  return (
                    <TableHead
                      key={header.id}
                      className={headerClassName}
                      style={headerStyle}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="even:bg-emerald-50"
                >
                  {row.getVisibleCells().map((cell) => {
                    const columnDef = cell.column.columnDef as any;
                    const cellClassName = columnDef.cellClassName;
                    const cellStyle = columnDef.cellStyle;
                    return (
                      <TableCell
                        key={cell.id}
                        className={cellClassName}
                        style={cellStyle}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}

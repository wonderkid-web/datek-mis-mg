"use client";

import React, { useState } from "react";
import { Item, User } from "@/lib/types";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  ColumnFiltersState,
  SortingState,
  getSortedRowModel,
} from "@tanstack/react-table";
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
import { ArrowUpDown } from "lucide-react";
import * as XLSX from "xlsx";
import { useRouter } from "next/navigation";
import {
  ASSET_INFO,
  CATEGORIES,
  COMPANIES,
  LOCATIONS,
  STATUSES,
  UNITS,
} from "@/lib/constants";

interface AssetTableProps {
  items: Item[];
  users: User[];
  handleEdit: (item: Item) => void;
  handleDelete: (id: string) => void;
}

export default function AssetTable({
  items,
  users,
  handleEdit,
  handleDelete,
}: AssetTableProps) {
  const router = useRouter();
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [showColumnFilters, setShowColumnFilters] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<Item>[] = React.useMemo(
    () => [
      {
        accessorKey: "assetNumber",
        header: "Nomor Aset",
        cell: (info) => info.getValue(),
        enableColumnFilter: true,
        enableSorting: true,
      },
      
      {
        accessorKey: "unit",
        header: "Unit",
        cell: (info) =>
          ASSET_INFO.filter(asset=> asset.table == "AAM.Unit").find((u) => u.type === info.getValue())?.description || "-",
        enableColumnFilter: true,
        enableSorting: true,
      },
      {
        accessorKey: "category",
        header: "Region",
        cell: (info) =>
          CATEGORIES.find((c) => c.type === info.getValue())?.description || "-",
        enableColumnFilter: true,
        enableSorting: true,
      },
      {
        accessorKey: "company",
        header: "Perusahaan",
        cell: (info) =>
          COMPANIES.find((c) => c.type === info.getValue())?.description || "-",
        enableColumnFilter: true,
        enableSorting: true,
      },
      {
        accessorKey: "department",
        header: "Departemen",
        cell: (info) => info.getValue(),
        enableColumnFilter: true,
        enableSorting: true,
      },
      {
        accessorKey: "location",
        header: "Lokasi",
        cell: (info) =>
          LOCATIONS.find((l) => l.type === info.getValue())?.description || "-",
        enableColumnFilter: true,
        enableSorting: true,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) =>
          STATUSES.find((s) => s.type === info.getValue())?.description || "-",
        enableColumnFilter: true,
        enableSorting: true,
      },
      {
        accessorKey: "user",
        header: "Pengguna",
        cell: (info) => users.find((u) => u.id === info.getValue())?.name || "-",
        enableColumnFilter: true,
        enableSorting: true,
      },
      {
        accessorKey: "guaranteeDate",
        header: "Tgl Garansi",
        cell: (info) => {
          const dateValue = info.getValue();
          return dateValue instanceof Date && !isNaN(dateValue.getTime())
            ? dateValue.toLocaleDateString()
            : "-";
        },
        enableColumnFilter: true,
        enableSorting: true,
      },
      {
        accessorKey: "registrationDate",
        header: "Tgl Registrasi",
        cell: (info) => {
          const dateValue = info.getValue();
          return dateValue instanceof Date && !isNaN(dateValue.getTime())
            ? dateValue.toLocaleDateString()
            : "-";
        },
        enableColumnFilter: true,
        enableSorting: true,
      },
      {
        accessorKey: "ipAddress",
        header: "IP Address",
        cell: (info) => info.getValue(),
        enableColumnFilter: true,
        enableSorting: true,
      },
      {
        accessorKey: "remote",
        header: "Remote",
        cell: (info) => info.getValue(),
        enableColumnFilter: true,
        enableSorting: true,
      },
      {
        id: "actions",
        header: () => <div className="text-center">Actions</div>,
        cell: ({ row }) => (
          <div className="flex space-x-2 justify-center">
            <Button
              variant="link"
              onClick={() => router.push(`/items/${row.original.id}`)}
              className="text-blue-600 p-0 h-auto"
            >
              Detail
            </Button>
            <Button
              variant="link"
              onClick={() => handleEdit(row.original)}
              className="text-primary p-0 h-auto"
            >
              Edit
            </Button>
            <Button
              variant="link"
              onClick={() => handleDelete(row.original.id!)}
              className="text-red-600 p-0 h-auto"
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [users, handleEdit, handleDelete, router]
  );

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      globalFilter,
      columnFilters,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  React.useEffect(() => {
    if (!showColumnFilters) {
      table.setColumnFilters([]);
    }
  }, [showColumnFilters, table]);

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      items.map((item) => ({
        "Nomor Aset": item.assetNumber,
        Deskripsi: item.description,
        Unit: UNITS.find((u) => u.type === item.unit)?.description || "-",
        Region: CATEGORIES.find((c) => c.type === item.category)?.description || "-",
        Perusahaan: COMPANIES.find((c) => c.type === item.company)?.description || "-",
        Departemen: item.department,
        Lokasi: LOCATIONS.find((l) => l.type === item.location)?.description || "-",
        Status: STATUSES.find((s) => s.type === item.status)?.description || "-",
        Pengguna: users.find((u) => u.id === item.user)?.name || "-",
        "Tanggal Garansi": item.guaranteeDate
          ? new Date(item.guaranteeDate).toLocaleDateString()
          : "-",
        "Tanggal Registrasi": item.registrationDate
          ? new Date(item.registrationDate).toLocaleDateString()
          : "-",
        "Alamat IP": item.ipAddress || "-",
        "Remote Access": item.remote || "-",
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Items");
    XLSX.writeFile(workbook, "items.xlsx");
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Input
          type="text"
          placeholder="Filter aset..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center space-x-2">
          <label htmlFor="toggleColumnFilters" className="text-sm font-medium">
            Show Column Filters
          </label>
          <input
            type="checkbox"
            id="toggleColumnFilters"
            checked={showColumnFilters}
            onChange={(e) => setShowColumnFilters(e.target.checked)}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <Button onClick={handleExport}>Export to Excel</Button>
        </div>
      </div>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={
                        header.id === "actions"
                          ? "sticky right-0 bg-white z-10 shadow-md"
                          : ""
                      }
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          {...{onClick: header.column.getToggleSortingHandler(),
                          }}
                          className="flex items-center justify-center"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <ArrowUpDown
                              className={`ml-2 h-4 w-4 ${header.column.getIsSorted() ? "" : "text-gray-400"}`}
                            />
                          )}
                        </div>
                      )}
                      {showColumnFilters && header.column.getCanFilter() ? (
                        <div>
                          <Input
                            type="text"
                            value={
                              (header.column.getFilterValue() ?? "") as string
                            }
                            onChange={(e) =>
                              header.column.setFilterValue(e.target.value)
                            }
                            placeholder={`Filter ${header.column.columnDef.header}...`}
                            className="w-36 border shadow rounded"
                          />
                        </div>
                      ) : null}
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
                  className="even:bg-gray-50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={
                        cell.column.id === "actions"
                          ? "sticky right-0 bg-white z-10 even:bg-gray-50 shadow-md"
                          : ""
                      }
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
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
      <div className="mt-4 flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
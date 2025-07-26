"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import { getManufacturesByAssetCategory } from "@/lib/manufactureService";
import { Manufacture } from "@/lib/types";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

export default function ViewDevicesLaptopPage() {
  const [laptops, setLaptops] = useState<Manufacture[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLaptops();
  }, []);

  const fetchLaptops = async () => {
    try {
      const data = await getManufacturesByAssetCategory("laptop");
      // Filter for laptops that have an assetNumber (meaning they are inventoried)
      setLaptops(data.filter(laptop => !!laptop.assetNumber));
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching laptops:", error);
      toast.error("Gagal memuat data Laptop.");
      setIsLoading(false);
    }
  };

  const columns: ColumnDef<Manufacture>[] = React.useMemo(
    () => [
      {
        accessorKey: "assetNumber",
        header: "Nomor Aset",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "brand",
        header: "Brand",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "model",
        header: "Model",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "serialNumber",
        header: "Serial Number",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "user",
        header: "Pengguna",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "processor",
        header: "Processor",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "ram",
        header: "RAM",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "storage",
        header: "Storage",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "screenSize",
        header: "Screen Size",
        cell: (info) => info.getValue(),
      },
    ],
    []
  );

  const table = useReactTable({
    data: laptops,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="min-h-screen max-h-screen overflow-auto bg-gray-100">
      <main className="container mx-auto p-8">
        <h1 className="mb-8 text-3xl font-bold">Daftar Laptop yang Diinventarisasi</h1>

        <Card className="shadow-lg rounded-lg">
          <CardContent className="p-6">
            {isLoading ? (
              <p>Memuat data laptop...</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center"
                        >
                          Tidak ada laptop yang diinventarisasi.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <div className="mt-4 flex items-center justify-end space-x-2">
                  <div className="flex-1 text-sm text-muted-foreground">
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    Previous
                  </Button>
                  {[...Array(table.getPageCount()).keys()].map((pageIdx) => (
                    <Button
                      key={pageIdx}
                      variant={table.getState().pagination.pageIndex === pageIdx ? "default" : "outline"}
                      size="sm"
                      onClick={() => table.setPageIndex(pageIdx)}
                    >
                      {pageIdx + 1}
                    </Button>
                  ))}
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
            )}
          </CardContent>
        </Card>
      </main>
      <Toaster />
    </div>
  );
}

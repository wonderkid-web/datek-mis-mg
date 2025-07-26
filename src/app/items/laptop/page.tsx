"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster, toast } from "sonner";
import { getManufacturesByAssetCategory, updateManufacture } from "@/lib/manufactureService";
import { getUsers } from "@/lib/userService";
import { Manufacture, User } from "@/lib/types";
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

export default function ItemsLaptopPage() {
  const [manufacturedLaptops, setManufacturedLaptops] = useState<Manufacture[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedManufactureId, setSelectedManufactureId] = useState<string | null>(null);
  const [assetNumber, setAssetNumber] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const laptopsData = await getManufacturesByAssetCategory("laptop");
      // Filter out laptops that already have an assetNumber
      setManufacturedLaptops(laptopsData.filter(laptop => !laptop.assetNumber));
      const usersData = await getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Gagal memuat data.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!selectedManufactureId || !assetNumber || !selectedUser) {
      toast.error("Harap isi semua kolom.");
      setIsLoading(false);
      return;
    }

    try {
      await updateManufacture(selectedManufactureId, { assetNumber, user: selectedUser });
      toast.success("Laptop berhasil diinventarisasi!");
      // Reset form and refetch data
      setSelectedManufactureId(null);
      setAssetNumber("");
      setSelectedUser("");
      fetchData();
    } catch (error) {
      console.error("Error assigning asset number:", error);
      toast.error("Gagal menginventarisasi laptop.");
    } finally {
      setIsLoading(false);
    }
  };

  const columns: ColumnDef<Manufacture>[] = React.useMemo(
    () => [
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
        id: "actions",
        header: "Aksi",
        cell: ({ row }) => (
          <Button
            size="sm"
            onClick={() => setSelectedManufactureId(row.original.id!)}
            disabled={!!row.original.assetNumber} // Disable if already assigned
          >
            {row.original.assetNumber ? "Sudah Diinventarisasi" : "Inventarisasi"}
          </Button>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: manufacturedLaptops,
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
        <h1 className="mb-8 text-3xl font-bold">Inventarisasi Laptop</h1>

        <Card className="shadow-lg rounded-lg mb-8">
          <CardHeader className="bg-primary text-primary-foreground p-6">
            <CardTitle className="text-2xl font-bold">Inventarisasi Laptop Baru</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="w-full">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-semibold w-1/3">Pilih Laptop:</TableCell>
                    <TableCell className="w-2/3">
                      <Select onValueChange={setSelectedManufactureId} value={selectedManufactureId || ""}>
                        <SelectTrigger className="w-1/2">
                          <SelectValue placeholder="Pilih Laptop yang belum diinventarisasi..." />
                        </SelectTrigger>
                        <SelectContent>
                          {manufacturedLaptops.map((laptop) => (
                            <SelectItem key={laptop.id} value={laptop.id!}>
                              {`${laptop.brand} ${laptop.model} (SN: ${laptop.serialNumber})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Nomor Aset:</TableCell>
                    <TableCell>
                      <Input
                        id="assetNumber"
                        type="text"
                        placeholder="Masukkan Nomor Aset..."
                        value={assetNumber}
                        onChange={(e) => setAssetNumber(e.target.value)}
                        className="w-1/2"
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Pengguna:</TableCell>
                    <TableCell>
                      <Select onValueChange={setSelectedUser} value={selectedUser}>
                        <SelectTrigger className="w-1/2">
                          <SelectValue placeholder="Pilih Pengguna..." />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id!}>
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2} className="text-right">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Menyimpan..." : "Simpan Inventarisasi"}
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </form>
          </CardContent>
        </Card>

        <h2 className="mb-6 text-2xl font-bold">Daftar Laptop yang Belum Diinventarisasi</h2>
        <Card className="shadow-lg rounded-lg">
          <CardContent className="p-6">
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
                        Tidak ada laptop yang belum diinventarisasi.
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
          </CardContent>
        </Card>
      </main>
      <Toaster />
    </div>
  );
}

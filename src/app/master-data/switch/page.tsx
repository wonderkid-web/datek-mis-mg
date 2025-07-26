"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createSwitch,
  getSwitches,
  updateSwitch,
  deleteSwitch,
} from "@/lib/switchService";
import { Switch } from "@/lib/types";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";

export default function SwitchPage() {
  const [formData, setFormData] = useState<Partial<Switch>>({
    type: "",
    brand: "",
    port: 0,
    power: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [switches, setSwitches] = useState<Switch[]>([]);
  const [editingItem, setEditingItem] = useState<Switch | null>(null);

  const fetchSwitches = useCallback(async () => {
    try {
      const data = await getSwitches();
      setSwitches(data);
    } catch (error) {
      console.error("Error fetching switches:", error);
      toast.error("Gagal memuat data Switch.");
    }
  }, []);

  useEffect(() => {
    fetchSwitches();
  }, [fetchSwitches]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: id === "port" ? parseInt(value) : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (
      !formData.type ||
      !formData.brand ||
      formData.port === undefined ||
      !formData.power
    ) {
      toast.error(
        "Harap isi semua kolom yang diperlukan (Type, Brand, Port, Power)."
      );
      setIsLoading(false);
      return;
    }

    try {
      if (editingItem) {
        await updateSwitch(editingItem.id!, formData as Partial<Switch>);
        toast.success("Data Switch berhasil diperbarui!");
      } else {
        await createSwitch(
          formData as Omit<Switch, "id" | "createdAt" | "updatedAt">
        );
        toast.success("Data Switch berhasil ditambahkan!");
      }
      setFormData({ type: "", brand: "", port: 0, power: "" });
      setEditingItem(null);
      fetchSwitches();
    } catch (error) {
      console.error("Error saving switch:", error);
      toast.error("Gagal menyimpan data Switch.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback((item: Switch) => {
    setEditingItem(item);
    setFormData({
      type: item.type,
      brand: item.brand,
      port: item.port,
      power: item.power,
    });
  }, []);

  const handleCancelEdit = () => {
    setEditingItem(null);
    setFormData({ type: "", brand: "", port: 0, power: "" });
  };

  const handleDelete = useCallback(
    async (id: string) => {
      if (window.confirm("Apakah Anda yakin ingin menghapus item ini?")) {
        try {
          await deleteSwitch(id);
          toast.success("Data Switch berhasil dihapus!");
          fetchSwitches();
        } catch (error) {
          console.error("Error deleting switch:", error);
          toast.error("Gagal menghapus data Switch.");
        }
      }
    },
    [fetchSwitches]
  );

  const columns: ColumnDef<Switch>[] = React.useMemo(
    () => [
      {
        accessorKey: "type",
        header: "Type",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "brand",
        header: "Brand",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "port",
        header: "Port",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "power",
        header: "Power",
        cell: (info) => info.getValue(),
      },
      {
        id: "actions",
        header: "Aksi",
        cell: ({ row }) => (
          <div className="flex space-x-2 justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleEdit(row.original)}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleDelete(row.original.id!)}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [handleEdit, handleDelete]
  );

  const table = useReactTable({
    data: switches,
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
        <h1 className="mb-8 text-3xl font-bold">
          Manajemen Master Data: Switch
        </h1>

        <Card className="shadow-lg rounded-lg mb-8">
          <CardHeader className="bg-primary text-primary-foreground p-6">
            <CardTitle className="text-2xl font-bold">
              {editingItem ? "Edit Data Switch" : "Tambah Data Switch"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="w-full">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-semibold w-1/3">Type:</TableCell>
                    <TableCell className="w-2/3">
                      <Input
                        id="type"
                        type="text"
                        placeholder="Type..."
                        value={formData.type}
                        onChange={handleChange}
                        className="w-1/2"
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Brand:</TableCell>
                    <TableCell>
                      <Input
                        id="brand"
                        type="text"
                        placeholder="Brand..."
                        value={formData.brand}
                        onChange={handleChange}
                        className="w-1/2"
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Port:</TableCell>
                    <TableCell>
                      <Input
                        id="port"
                        type="number"
                        placeholder="Port..."
                        value={formData.port}
                        onChange={handleChange}
                        className="w-1/2"
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Power:</TableCell>
                    <TableCell>
                      <Input
                        id="power"
                        type="text"
                        placeholder="Power..."
                        value={formData.power}
                        onChange={handleChange}
                        className="w-1/2"
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2} className="text-right">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading
                          ? "Menyimpan..."
                          : editingItem
                          ? "Perbarui Data Switch"
                          : "Simpan Data Switch"}
                      </Button>
                      {editingItem && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancelEdit}
                          className="ml-2"
                        >
                          Batal Edit
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </form>
          </CardContent>
        </Card>

        <h2 className="mb-6 text-2xl font-bold">Daftar Switch</h2>
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
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="mt-4 flex items-center justify-end space-x-2">
                <div className="flex-1 text-sm text-muted-foreground">
                  Page {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount()}
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
                    variant={
                      table.getState().pagination.pageIndex === pageIdx
                        ? "default"
                        : "outline"
                    }
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

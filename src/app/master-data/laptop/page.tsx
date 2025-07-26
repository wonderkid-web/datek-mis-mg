"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { createLaptop, getLaptops, updateLaptop, deleteLaptop } from "@/lib/laptopService";
import { Laptop } from "@/lib/types";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";

export default function LaptopPage() {
  const [formData, setFormData] = useState<Partial<Laptop>>({
    brand: "",
    model: "",
    processor: "",
    ram: "",
    storage: "",
    screenSize: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [laptops, setLaptops] = useState<Laptop[]>([]);
  const [editingItem, setEditingItem] = useState<Laptop | null>(null);

  useEffect(() => {
    fetchLaptops();
  }, []);

  const fetchLaptops = async () => {
    try {
      const data = await getLaptops();
      setLaptops(data);
    } catch (error) {
      console.error("Error fetching laptops:", error);
      toast.error("Gagal memuat data Laptop.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.brand || !formData.model || !formData.processor || !formData.ram || !formData.storage || !formData.screenSize) {
      toast.error("Harap isi semua kolom yang diperlukan.");
      setIsLoading(false);
      return;
    }

    try {
      if (editingItem) {
        await updateLaptop(editingItem.id!, formData as Partial<Laptop>);
        toast.success("Data Laptop berhasil diperbarui!");
      } else {
        await createLaptop(formData as Omit<Laptop, "id" | "createdAt" | "updatedAt">);
        toast.success("Data Laptop berhasil ditambahkan!");
      }
      setFormData({ brand: "", model: "", processor: "", ram: "", storage: "", screenSize: "" });
      setEditingItem(null);
      fetchLaptops();
    } catch (error) {
      console.error("Error saving laptop:", error);
      toast.error("Gagal menyimpan data Laptop.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: Laptop) => {
    setEditingItem(item);
    setFormData({ brand: item.brand, model: item.model, processor: item.processor, ram: item.ram, storage: item.storage, screenSize: item.screenSize });
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setFormData({ brand: "", model: "", processor: "", ram: "", storage: "", screenSize: "" });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus item ini?")) {
      try {
        await deleteLaptop(id);
        toast.success("Data Laptop berhasil dihapus!");
        fetchLaptops();
      } catch (error) {
        console.error("Error deleting laptop:", error);
        toast.error("Gagal menghapus data Laptop.");
      }
    }
  };

  const columns: ColumnDef<Laptop>[] = React.useMemo(
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
        <h1 className="mb-8 text-3xl font-bold">Manajemen Master Data: Laptop</h1>

        <Card className="shadow-lg rounded-lg mb-8">
          <CardHeader className="bg-primary text-primary-foreground p-6">
            <CardTitle className="text-2xl font-bold">{editingItem ? "Edit Data Laptop" : "Tambah Data Laptop"}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="w-full">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-semibold w-1/3">Brand:</TableCell>
                    <TableCell className="w-2/3">
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
                    <TableCell className="font-semibold">Model:</TableCell>
                    <TableCell>
                      <Input
                        id="model"
                        type="text"
                        placeholder="Model..."
                        value={formData.model}
                        onChange={handleChange}
                        className="w-1/2"
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Processor:</TableCell>
                    <TableCell>
                      <Input
                        id="processor"
                        type="text"
                        placeholder="Processor..."
                        value={formData.processor}
                        onChange={handleChange}
                        className="w-1/2"
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">RAM:</TableCell>
                    <TableCell>
                      <Input
                        id="ram"
                        type="text"
                        placeholder="RAM..."
                        value={formData.ram}
                        onChange={handleChange}
                        className="w-1/2"
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Storage:</TableCell>
                    <TableCell>
                      <Input
                        id="storage"
                        type="text"
                        placeholder="Storage..."
                        value={formData.storage}
                        onChange={handleChange}
                        className="w-1/2"
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Screen Size:</TableCell>
                    <TableCell>
                      <Input
                        id="screenSize"
                        type="text"
                        placeholder="Screen Size..."
                        value={formData.screenSize}
                        onChange={handleChange}
                        className="w-1/2"
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2} className="text-right">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Menyimpan..." : editingItem ? "Perbarui Data Laptop" : "Simpan Data Laptop"}
                      </Button>
                      {editingItem && (
                        <Button type="button" variant="outline" onClick={handleCancelEdit} className="ml-2">
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

        <h2 className="mb-6 text-2xl font-bold">Daftar Laptop</h2>
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

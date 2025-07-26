"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { createSwitch, getSwitches, updateSwitch, deleteSwitch } from "@/lib/switchService";
import { Switch } from "@/lib/types";

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

  useEffect(() => {
    fetchSwitches();
  }, []);

  const fetchSwitches = async () => {
    try {
      const data = await getSwitches();
      setSwitches(data);
    } catch (error) {
      console.error("Error fetching switches:", error);
      toast.error("Gagal memuat data Switch.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: id === "port" ? parseInt(value) : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.type || !formData.brand || formData.port === undefined || !formData.power) {
      toast.error("Harap isi semua kolom yang diperlukan (Type, Brand, Port, Power).");
      setIsLoading(false);
      return;
    }

    try {
      if (editingItem) {
        await updateSwitch(editingItem.id!, formData as Partial<Switch>);
        toast.success("Data Switch berhasil diperbarui!");
      } else {
        await createSwitch(formData as Omit<Switch, "id" | "createdAt" | "updatedAt">);
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

  const handleEdit = (item: Switch) => {
    setEditingItem(item);
    setFormData({ type: item.type, brand: item.brand, port: item.port, power: item.power });
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setFormData({ type: "", brand: "", port: 0, power: "" });
  };

  const handleDelete = async (id: string) => {
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
  };

  return (
    <div className="min-h-screen max-h-screen overflow-auto bg-gray-100">
      <main className="container mx-auto p-8">
        <h1 className="mb-8 text-3xl font-bold">Manajemen Master Data: Switch</h1>

        <Card className="shadow-lg rounded-lg mb-8">
          <CardHeader className="bg-primary text-primary-foreground p-6">
            <CardTitle className="text-2xl font-bold">{editingItem ? "Edit Data Switch" : "Tambah Data Switch"}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Input
                    id="type"
                    type="text"
                    placeholder="Type..."
                    value={formData.type}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    type="text"
                    placeholder="Brand..."
                    value={formData.brand}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="port">Port</Label>
                  <Input
                    id="port"
                    type="number"
                    placeholder="Port..."
                    value={formData.port}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="power">Power</Label>
                  <Input
                    id="power"
                    type="text"
                    placeholder="Power..."
                    value={formData.power}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="md:col-span-2 flex justify-end mt-6">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Menyimpan..." : editingItem ? "Perbarui Data Switch" : "Simpan Data Switch"}
                </Button>
                {editingItem && (
                  <Button type="button" variant="outline" onClick={handleCancelEdit} className="ml-2">
                    Batal Edit
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <h2 className="mb-6 text-2xl font-bold">Daftar Switch</h2>
        <Card className="shadow-lg rounded-lg">
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Port</TableHead>
                    <TableHead>Power</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {switches.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>{item.brand}</TableCell>
                      <TableCell>{item.port}</TableCell>
                      <TableCell>{item.power}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(item)} className="mr-2">
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id!)}>
                          Hapus
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
      <Toaster />
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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
import {
  MANUFACTURE_ASSET_TYPES,
  MANUFACTURE_BRANDS,
  MANUFACTURE_PROCESSORS,
  MANUFACTURE_STORAGES,
  MANUFACTURE_RAMS,
  MANUFACTURE_VGAS,
  MANUFACTURE_SCREEN_SIZES,
  MANUFACTURE_COLORS,
} from "@/lib/constants";
import { createManufacturedItem } from "@/lib/manufactureService";
import { ManufacturedItem } from "@/lib/types";

export default function ManufakturPage() {
  const [formData, setFormData] = useState<Partial<ManufacturedItem>>({
    type: "",
    brand: "",
    model: "",
    serialNumber: "",
    processor: "",
    storage: "",
    ram: "",
    vga: "",
    screenSize: "",
    color: "",
    macAddressLan: "",
    macAddressWlan: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSelectChange = (name: keyof ManufacturedItem, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Basic validation
    if (!formData.type || !formData.brand || !formData.model || !formData.serialNumber) {
      toast.error("Please fill in all required fields (Type, Brand, Model, Serial Number).");
      setIsLoading(false);
      return;
    }

    try {
      await createManufacturedItem(formData as Omit<ManufacturedItem, "id" | "createdAt" | "updatedAt">);
      toast.success("Item manufaktur berhasil ditambahkan!");
      setFormData({ // Reset form
        type: "",
        brand: "",
        model: "",
        serialNumber: "",
        processor: "",
        storage: "",
        ram: "",
        vga: "",
        screenSize: "",
        color: "",
        macAddressLan: "",
        macAddressWlan: "",
      });
    } catch (error) {
      console.error("Error adding manufactured item:", error);
      toast.error("Gagal menambahkan item manufaktur.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen max-h-screen overflow-auto bg-gray-100">
      <main className="container mx-auto p-8">
        <h1 className="mb-8 text-3xl font-bold">Manufaktur Aset Baru</h1>

        <Card className="shadow-lg rounded-lg">
          <CardHeader className="bg-primary text-primary-foreground p-6">
            <CardTitle className="text-2xl font-bold">Detail Aset</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* General Information */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800">Informasi Dasar</h2>
                <div>
                  <Label htmlFor="type">Tipe Aset</Label>
                  <Select onValueChange={(value) => handleSelectChange("type", value)} value={formData.type}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Tipe Aset" />
                    </SelectTrigger>
                    <SelectContent>
                      {MANUFACTURE_ASSET_TYPES.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="brand">Merek</Label>
                  <Select onValueChange={(value) => handleSelectChange("brand", value)} value={formData.brand}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Merek" />
                    </SelectTrigger>
                    <SelectContent>
                      {MANUFACTURE_BRANDS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="model">Model</Label>
                  <Input id="model" type="text" placeholder="Model.." value={formData.model} onChange={handleChange} />
                </div>

                <div>
                  <Label htmlFor="serialNumber">Serial Number</Label>
                  <Input id="serialNumber" type="text" placeholder="Serial Number.." value={formData.serialNumber} onChange={handleChange} />
                </div>

                <div>
                  <Label htmlFor="macAddressLan">MAC Address LAN (Opsional)</Label>
                  <Input id="macAddressLan" type="text" placeholder="MAC Address LAN..." value={formData.macAddressLan} onChange={handleChange} />
                </div>

                <div>
                  <Label htmlFor="macAddressWlan">MAC Address WLAN (Opsional)</Label>
                  <Input id="macAddressWlan" type="text" placeholder="MAC Address WLAN..." value={formData.macAddressWlan} onChange={handleChange} />
                </div>
              </div>

              {/* Hardware Specifications */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800">Spesifikasi Hardware</h2>
                <div>
                  <Label htmlFor="processor">Processor</Label>
                  <Select onValueChange={(value) => handleSelectChange("processor", value)} value={formData.processor}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Processor" />
                    </SelectTrigger>
                    <SelectContent>
                      {MANUFACTURE_PROCESSORS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="storage">Penyimpanan</Label>
                  <Select onValueChange={(value) => handleSelectChange("storage", value)} value={formData.storage}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Penyimpanan" />
                    </SelectTrigger>
                    <SelectContent>
                      {MANUFACTURE_STORAGES.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="ram">RAM</Label>
                  <Select onValueChange={(value) => handleSelectChange("ram", value)} value={formData.ram}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih RAM" />
                    </SelectTrigger>
                    <SelectContent>
                      {MANUFACTURE_RAMS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="vga">VGA (Opsional)</Label>
                  <Select onValueChange={(value) => handleSelectChange("vga", value)} value={formData.vga}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih VGA" />
                    </SelectTrigger>
                    <SelectContent>
                      {MANUFACTURE_VGAS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="screenSize">Ukuran Layar (Opsional)</Label>
                  <Select onValueChange={(value) => handleSelectChange("screenSize", value)} value={formData.screenSize}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Ukuran Layar" />
                    </SelectTrigger>
                    <SelectContent>
                      {MANUFACTURE_SCREEN_SIZES.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="color">Warna (Opsional)</Label>
                  <Select onValueChange={(value) => handleSelectChange("color", value)} value={formData.color}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Warna" />
                    </SelectTrigger>
                    <SelectContent>
                      {MANUFACTURE_COLORS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end mt-6">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Menyimpan..." : "Simpan Aset Manufaktur"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      <Toaster />
    </div>
  );
}

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
import {
  Table, TableBody, TableCell, TableRow
} from "@/components/ui/table";
import { Toaster, toast } from "sonner";
import { getLaptops } from "@/lib/laptopService";
import { createManufacture } from "@/lib/manufactureService";
import { Laptop } from "@/lib/types";

export default function ManufakturLaptopPage() {
  const [, setLaptops] = useState<Laptop[]>([]);
  const [uniqueBrands, setUniqueBrands] = useState<string[]>([]);
  const [uniqueModels, setUniqueModels] = useState<string[]>([]);
  const [uniqueProcessors, setUniqueProcessors] = useState<string[]>([]);
  const [uniqueRams, setUniqueRams] = useState<string[]>([]);
  const [uniqueStorages, setUniqueStorages] = useState<string[]>([]);
  const [uniqueScreenSizes, setUniqueScreenSizes] = useState<string[]>([]);

  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedProcessor, setSelectedProcessor] = useState<string>("");
  const [selectedRam, setSelectedRam] = useState<string>("");
  const [selectedStorage, setSelectedStorage] = useState<string>("");
  const [selectedScreenSize, setSelectedScreenSize] = useState<string>("");
  const [serialNumber, setSerialNumber] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchLaptopData = async () => {
      try {
        const data = await getLaptops();
        setLaptops(data);
        
        // Extract unique values for dropdowns
        setUniqueBrands([...new Set(data.map(item => item.brand))]);
        setUniqueModels([...new Set(data.map(item => item.model))]);
        setUniqueProcessors([...new Set(data.map(item => item.processor))]);
        setUniqueRams([...new Set(data.map(item => item.ram))]);
        setUniqueStorages([...new Set(data.map(item => item.storage))]);
        setUniqueScreenSizes([...new Set(data.map(item => item.screenSize))]);

      } catch (error) {
        console.error("Error fetching laptop master data:", error);
        toast.error("Gagal memuat data master Laptop.");
      }
    };
    fetchLaptopData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!selectedBrand || !selectedModel || !selectedProcessor || !selectedRam || !selectedStorage || !selectedScreenSize || !serialNumber) {
      toast.error("Harap isi semua kolom.");
      setIsLoading(false);
      return;
    }

    const newManufactureData = {
      brand: selectedBrand,
      model: selectedModel,
      processor: selectedProcessor,
      ram: selectedRam,
      storage: selectedStorage,
      screenSize: selectedScreenSize,
      serialNumber,
      assetCategory: 'laptop'
    };
    
    try {
        await createManufacture(newManufactureData as any);
        toast.success("Data Manufaktur Laptop berhasil ditambahkan!");
        // Reset form
        setSelectedBrand("");
        setSelectedModel("");
        setSelectedProcessor("");
        setSelectedRam("");
        setSelectedStorage("");
        setSelectedScreenSize("");
        setSerialNumber("");

    } catch (error) {
        console.error("Error saving manufactured laptop:", error);
        toast.error("Gagal menyimpan data manufaktur.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto p-8">
        <h1 className="mb-8 text-3xl font-bold">Manufaktur: Laptop</h1>

        <Card className="shadow-lg rounded-lg">
          <CardHeader className="bg-primary text-primary-foreground p-6">
            <CardTitle className="text-2xl font-bold">Tambah Data Manufaktur Laptop</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="w-full">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-semibold w-1/3">Brand:</TableCell>
                    <TableCell className="w-2/3">
                      <Select onValueChange={setSelectedBrand} value={selectedBrand}>
                        <SelectTrigger className="w-1/2"><SelectValue placeholder="Pilih Brand..." /></SelectTrigger>
                        <SelectContent>
                          {uniqueBrands.map(brand => <SelectItem key={brand} value={brand}>{brand}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-semibold">Model:</TableCell>
                    <TableCell>
                      <Select onValueChange={setSelectedModel} value={selectedModel}>
                        <SelectTrigger className="w-1/2"><SelectValue placeholder="Pilih Model..." /></SelectTrigger>
                        <SelectContent>
                          {uniqueModels.map(model => <SelectItem key={model} value={model}>{model}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-semibold">Processor:</TableCell>
                    <TableCell>
                      <Select onValueChange={setSelectedProcessor} value={selectedProcessor}>
                        <SelectTrigger className="w-1/2"><SelectValue placeholder="Pilih Processor..." /></SelectTrigger>
                        <SelectContent>
                          {uniqueProcessors.map(processor => <SelectItem key={processor} value={processor}>{processor}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-semibold">RAM:</TableCell>
                    <TableCell>
                      <Select onValueChange={setSelectedRam} value={selectedRam}>
                        <SelectTrigger className="w-1/2"><SelectValue placeholder="Pilih RAM..." /></SelectTrigger>
                        <SelectContent>
                          {uniqueRams.map(ram => <SelectItem key={ram} value={ram}>{ram}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-semibold">Storage:</TableCell>
                    <TableCell>
                      <Select onValueChange={setSelectedStorage} value={selectedStorage}>
                        <SelectTrigger className="w-1/2"><SelectValue placeholder="Pilih Storage..." /></SelectTrigger>
                        <SelectContent>
                          {uniqueStorages.map(storage => <SelectItem key={storage} value={storage}>{storage}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-semibold">Screen Size:</TableCell>
                    <TableCell>
                      <Select onValueChange={setSelectedScreenSize} value={selectedScreenSize}>
                        <SelectTrigger className="w-1/2"><SelectValue placeholder="Pilih Screen Size..." /></SelectTrigger>
                        <SelectContent>
                          {uniqueScreenSizes.map(screenSize => <SelectItem key={screenSize} value={screenSize}>{screenSize}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-semibold">Serial Number:</TableCell>
                    <TableCell className="w-1/2">
                      <Input id="serialNumber" type="text" placeholder="Serial Number..." value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} className="w-1/2" />
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell colSpan={2} className="text-right">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Menyimpan..." : "Simpan Data Manufaktur"}
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </form>
          </CardContent>
        </Card>
        
        {/* A table to display manufactured items could go here */}

      </main>
      <Toaster />
    </div>
  );
}

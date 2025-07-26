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
import { getSwitches } from "@/lib/switchService";
import { createManufacture } from "@/lib/manufactureService";
import { Switch } from "@/lib/types";

export default function ManufakturSwitchPage() {
  const [, setSwitches] = useState<Switch[]>([]);
  const [uniqueTypes, setUniqueTypes] = useState<string[]>([]);
  const [uniqueBrands, setUniqueBrands] = useState<string[]>([]);
  const [uniquePorts, setUniquePorts] = useState<number[]>([]);
  const [uniquePowers, setUniquePowers] = useState<string[]>([]);

  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedPort, setSelectedPort] = useState<string>("");
  const [selectedPower, setSelectedPower] = useState<string>("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSwitchData = async () => {
      try {
        const data = await getSwitches();
        setSwitches(data);
        
        // Extract unique values for dropdowns
        setUniqueTypes([...new Set(data.map(item => item.type))]);
        setUniqueBrands([...new Set(data.map(item => item.brand))]);
        setUniquePorts([...new Set(data.map(item => item.port))].sort((a, b) => a - b));
        setUniquePowers([...new Set(data.map(item => item.power))]);

      } catch (error) {
        console.error("Error fetching switch master data:", error);
        toast.error("Gagal memuat data master Switch.");
      }
    };
    fetchSwitchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!selectedType || !selectedBrand || !selectedPort || !selectedPower || !model || !serialNumber) {
      toast.error("Harap isi semua kolom.");
      setIsLoading(false);
      return;
    }

    const newManufactureData = {
      type: selectedType,
      brand: selectedBrand,
      port: parseInt(selectedPort, 10),
      power: selectedPower,
      model,
      serialNumber,
      assetCategory: 'switch'
    };
    
    try {
        await createManufacture(newManufactureData as any);
        toast.success("Data Manufaktur Switch berhasil ditambahkan!");
        // Reset form
        setSelectedType("");
        setSelectedBrand("");
        setSelectedPort("");
        setSelectedPower("");
        setModel("");
        setSerialNumber("");

    } catch (error) {
        console.error("Error saving manufactured switch:", error);
        toast.error("Gagal menyimpan data manufaktur.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto p-8">
        <h1 className="mb-8 text-3xl font-bold">Manufaktur: Switch</h1>

        <Card className="shadow-lg rounded-lg">
          <CardHeader className="bg-primary text-primary-foreground p-6">
            <CardTitle className="text-2xl font-bold">Tambah Data Manufaktur Switch</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="w-full">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-semibold w-1/3">Type:</TableCell>
                    <TableCell className="w-2/3">
                      <Select onValueChange={setSelectedType} value={selectedType}>
                        <SelectTrigger className="w-1/2"><SelectValue placeholder="Pilih Type..." /></SelectTrigger>
                        <SelectContent>
                          {uniqueTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-semibold">Brand:</TableCell>
                    <TableCell>
                      <Select onValueChange={setSelectedBrand} value={selectedBrand}>
                        <SelectTrigger className="w-1/2"><SelectValue placeholder="Pilih Brand..." /></SelectTrigger>
                        <SelectContent>
                          {uniqueBrands.map(brand => <SelectItem key={brand} value={brand}>{brand}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-semibold">Port:</TableCell>
                    <TableCell>
                      <Select onValueChange={setSelectedPort} value={selectedPort}>
                        <SelectTrigger className="w-1/2"><SelectValue placeholder="Pilih Jumlah Port..." /></SelectTrigger>
                        <SelectContent>
                          {uniquePorts.map(port => <SelectItem key={port} value={String(port)}>{port}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-semibold">Power:</TableCell>
                    <TableCell>
                      <Select onValueChange={setSelectedPower} value={selectedPower}>
                        <SelectTrigger className="w-1/2"><SelectValue placeholder="Pilih Power..." /></SelectTrigger>
                        <SelectContent>
                          {uniquePowers.map(power => <SelectItem key={power} value={power}>{power}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-semibold">Model:</TableCell>
                    <TableCell className="w-1/2">
                      <Input id="model" type="text" placeholder="Model..." value={model} onChange={(e) => setModel(e.target.value)} className="w-1/2" />
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

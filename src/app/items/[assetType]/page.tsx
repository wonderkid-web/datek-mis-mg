"use client";

import { useParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { getManufacturesByAssetCategory, updateManufacture } from "@/lib/manufactureService";
import { getUsers } from "@/lib/userService";
import { Manufacture, User } from "@/lib/types";
import { Toaster, toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ItemPage() {
  const params = useParams();
  const { assetType } = params;

  const [manufactures, setManufactures] = useState<Manufacture[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingManufactureId, setEditingManufactureId] = useState<string | null>(null);
  const [editedManufactureData, setEditedManufactureData] = useState<Partial<Manufacture>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [manufactureData, userData] = await Promise.all([
          getManufacturesByAssetCategory(assetType as string),
          getUsers(),
        ]);
        const unassignedManufactures = manufactureData.filter(man => !man.user);
        setManufactures(unassignedManufactures);
        setUsers(userData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Gagal memuat data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [assetType]);

  const handleEditClick = (manufacture: Manufacture) => {
    setEditingManufactureId(manufacture.id!);
    setEditedManufactureData({ ...manufacture });
  };

  const handleCancelEdit = () => {
    setEditingManufactureId(null);
    setEditedManufactureData({});
  };

  const handleSaveClick = async (manufactureId: string) => {
    if (!editedManufactureData.assetNumber || !editedManufactureData.user) {
      toast.error("Nomor Aset dan Pengguna harus diisi.");
      return;
    }

    try {
      await updateManufacture(manufactureId, editedManufactureData);
      toast.success("Data manufaktur berhasil diperbarui!");
      setEditingManufactureId(null);
      setEditedManufactureData({});
      // Re-fetch manufactures to get the latest data
      const updatedManufactures = await getManufacturesByAssetCategory(assetType as string);
      setManufactures(updatedManufactures);
    } catch (error) {
      console.error("Error updating manufacture:", error);
      toast.error("Gagal memperbarui data manufaktur.");
    }
  };

  const handleChange = (field: keyof Manufacture, value: string | number) => {
    setEditedManufactureData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto p-8">
        <h1 className="mb-8 text-3xl font-bold">Daftar Manufaktur: {assetType}</h1>

        <Card className="shadow-lg rounded-lg">
          <CardHeader className="bg-primary text-primary-foreground p-6">
            <CardTitle className="text-2xl font-bold">Daftar {assetType} yang Dimanufaktur</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <p>Memuat data...</p>
            ) : manufactures.length === 0 ? (
              <p>Tidak ada data manufaktur {assetType} yang ditemukan.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Serial Number</TableHead>
                      <TableHead>Port</TableHead>
                      <TableHead>Power</TableHead>
                      <TableHead>Nomor Aset</TableHead>
                      <TableHead>Pengguna</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {manufactures.map((man) => {
                      const isEditing = editingManufactureId === man.id;

                      return (
                        <TableRow key={man.id}>
                          <TableCell>{man.type}</TableCell>
                          <TableCell>{man.brand}</TableCell>
                          <TableCell>{man.model || "N/A"}</TableCell>
                          <TableCell>{man.serialNumber || "N/A"}</TableCell>
                          <TableCell>{man.port || "N/A"}</TableCell>
                          <TableCell>{man.power || "N/A"}</TableCell>
                          <TableCell>
                            {isEditing ? (
                              <Input
                                value={editedManufactureData.assetNumber || ""}
                                onChange={(e) => handleChange("assetNumber", e.target.value)}
                              />
                            ) : (
                              man.assetNumber || "N/A"
                            )}
                          </TableCell>
                          <TableCell>
                            {isEditing ? (
                              <Select
                                onValueChange={(value) => handleChange("user", value)}
                                value={editedManufactureData.user || ""}
                              >
                                <SelectTrigger>
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
                            ) : (
                              users.find(u => u.id === man.user)?.name || man.user || "N/A"
                            )}
                          </TableCell>
                          <TableCell>
                            {isEditing ? (
                              <>
                                <Button size="sm" onClick={() => handleSaveClick(man.id!)} className="mr-2">Simpan</Button>
                                <Button size="sm" variant="outline" onClick={handleCancelEdit}>Batal</Button>
                              </>
                            ) : (
                              <Button size="sm" onClick={() => handleEditClick(man)}>Edit</Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Toaster />
      </main>
    </div>
  );
}

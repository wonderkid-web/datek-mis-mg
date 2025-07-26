"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getManufactures } from "@/lib/manufactureService";
import { getUsers } from "@/lib/userService";
import { Manufacture, User } from "@/lib/types";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye } from "lucide-react";

export default function ViewDeviceAssetPage() {
  const params = useParams();
  const router = useRouter();
  const { assetType } = params;

  const [manufactures, setManufactures] = useState<Manufacture[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // You can adjust this value

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [manufactureData, userData] = await Promise.all([
          getManufactures(assetType as string),
          getUsers(),
        ]);
        const assignedManufactures = manufactureData.filter((man) => man.user);
        setManufactures(assignedManufactures);
        setUsers(userData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Gagal memuat data perangkat.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [assetType]);

  const handleViewClick = (manufactureId: string) => {
    router.push(`/view-devices/${assetType}/${manufactureId}`);
  };

  const filteredManufactures = useMemo(() => {
    return manufactures.filter(
      (man) =>
        man.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        man.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        man.assetNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        users
          .find((u) => u.id === man.user)
          ?.name.toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
  }, [manufactures, searchTerm, users]);

  const totalPages = Math.ceil(filteredManufactures.length / itemsPerPage);
  const currentManufactures = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredManufactures.slice(startIndex, endIndex);
  }, [filteredManufactures, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto p-8">
        <h1 className="mb-8 text-3xl font-bold">
          Daftar Perangkat: {assetType}
        </h1>

        <Card className="shadow-lg rounded-lg mb-8">
          <CardHeader className="bg-primary text-primary-foreground p-6">
            <CardTitle className="text-2xl font-bold">
              Daftar {assetType}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-4">
              <Input
                type="text"
                placeholder="Cari berdasarkan Model, Serial Number, Nomor Aset, atau Pengguna..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-1/4"
              />
            </div>
            {isLoading ? (
              <p>Memuat data...</p>
            ) : manufactures.length === 0 ? (
              <p>Tidak ada perangkat {assetType} yang ditemukan.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">No.</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Serial Number</TableHead>
                      <TableHead>Port</TableHead>
                      <TableHead>Power</TableHead>
                      <TableHead>Nomor Aset</TableHead>
                      <TableHead>Pengguna</TableHead>
                      <TableHead className="text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentManufactures.map((man, index) => {
                      const assignedUser = users.find((u) => u.id === man.user);

                      return (
                        <TableRow key={man.id}>
                          <TableCell className="text-right">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </TableCell>
                          <TableCell>{man.type}</TableCell>
                          <TableCell>{man.brand}</TableCell>
                          <TableCell>{man.model || "N/A"}</TableCell>
                          <TableCell>{man.serialNumber || "N/A"}</TableCell>
                          <TableCell>{man.port || "N/A"}</TableCell>
                          <TableCell>{man.power || "N/A"}</TableCell>
                          <TableCell>{man.assetNumber || "N/A"}</TableCell>
                          <TableCell>
                            {assignedUser?.name || man.user || "N/A"}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              size="sm"
                              onClick={() => handleViewClick(man.id!)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-600">
                Total Data: {filteredManufactures.length}
              </p>
              <div className="flex items-center">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <Button
                      key={i + 1}
                      variant={currentPage === i + 1 ? "default" : "outline"}
                      onClick={() => handlePageChange(i + 1)}
                      className="mx-1"
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Toaster />
      </main>
    </div>
  );
}

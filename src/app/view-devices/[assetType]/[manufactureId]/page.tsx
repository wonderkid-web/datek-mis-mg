"use client";

import { useParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { getManufactureById } from "@/lib/manufactureService";
import { getUsers } from "@/lib/userService";
import { Manufacture, User } from "@/lib/types";
import { Toaster, toast } from "sonner";
import QRCodeGenerator from "@/components/QRCodeGenerator";

export default function ManufactureDetailPage() {
  const params = useParams();
  const { manufactureId } = params;

  const [manufacture, setManufacture] = useState<Manufacture | null>(null);
  const [assignedUser, setAssignedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const fetchedManufacture = await getManufactureById(manufactureId as string);
        setManufacture(fetchedManufacture);

        if (fetchedManufacture?.user) {
          const fetchedUsers = await getUsers();
          const user = fetchedUsers.find(u => u.id === fetchedManufacture.user);
          setAssignedUser(user || null);
        }

      } catch (error) {
        console.error("Error fetching manufacture details:", error);
        toast.error("Gagal memuat detail manufaktur.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [manufactureId]);

  if (isLoading) {
    return <p className="p-8">Memuat detail manufaktur...</p>;
  }

  if (!manufacture) {
    return <p className="p-8">Manufaktur tidak ditemukan.</p>;
  }

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto p-8">
        <h1 className="mb-8 text-3xl font-bold">Detail Manufaktur: {manufacture.model || manufacture.serialNumber}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="shadow-lg rounded-lg">
            <CardHeader className="bg-primary text-primary-foreground p-6">
              <CardTitle className="text-2xl font-bold">Informasi Manufaktur</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-semibold">Type:</TableCell>
                    <TableCell>{manufacture.type}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Brand:</TableCell>
                    <TableCell>{manufacture.brand}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Model:</TableCell>
                    <TableCell>{manufacture.model || "N/A"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Serial Number:</TableCell>
                    <TableCell>{manufacture.serialNumber || "N/A"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Port:</TableCell>
                    <TableCell>{manufacture.port || "N/A"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Power:</TableCell>
                    <TableCell>{manufacture.power || "N/A"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Nomor Aset:</TableCell>
                    <TableCell>{manufacture.assetNumber || "N/A"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Pengguna:</TableCell>
                    <TableCell>{assignedUser?.name || manufacture.user || "N/A"}</TableCell>
                  </TableRow>
                  {assignedUser && (
                    <>
                      <TableRow>
                        <TableCell className="font-semibold">SBU Pengguna:</TableCell>
                        <TableCell>{assignedUser.sbu || "N/A"}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Departemen Pengguna:</TableCell>
                        <TableCell>{assignedUser.department || "N/A"}</TableCell>
                      </TableRow>
                    </>
                  )}
                  <TableRow>
                    <TableCell className="font-semibold">Dibuat Pada:</TableCell>
                    <TableCell>{manufacture.createdAt.toLocaleDateString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Diperbarui Pada:</TableCell>
                    <TableCell>{manufacture.updatedAt.toLocaleDateString()}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-lg flex flex-col items-center justify-center p-6">
            <CardHeader className="w-full text-center">
              <CardTitle className="text-xl font-bold">QR Code Perangkat</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-center items-center -mt-8">
              <QRCodeGenerator value={currentUrl} size={200} />
              <p className="text-sm text-gray-600 mt-4">Scan untuk melihat detail perangkat ini.</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
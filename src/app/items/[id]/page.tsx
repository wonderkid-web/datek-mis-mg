"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getItemById } from "@/lib/itemService";
import { Item, User } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import {
  CATEGORIES,
  COMPANIES,
  LOCATIONS,
  STATUSES,
  UNITS,
} from "@/lib/constants";
import { getUsers } from "@/lib/userService";
import { Toaster } from "sonner";
import QRCodeGenerator from "@/components/QRCodeGenerator";

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id as string;
  const [item, setItem] = useState<Item | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const fetchedItem = await getItemById(itemId);
      const fetchedUsers = await getUsers();
      setItem(fetchedItem);
      setUsers(fetchedUsers);
      setIsLoading(false);
    };

    if (itemId) {
      fetchData();
    }
  }, [itemId]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Memuat detail aset...
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-bold mb-4">Aset tidak ditemukan.</h1>
        <Button onClick={() => router.push("/view-devices")}>
          Kembali ke Daftar Aset
        </Button>
      </div>
    );
  }

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.name : "Tidak Diketahui";
  };

  const getUnitDescription = (unitType: string) => {
    const unit = UNITS.find((u) => u.type === unitType);
    return unit ? unit.description : "Tidak Diketahui";
  };

  const getCategoryDescription = (categoryType: string) => {
    const category = CATEGORIES.find((c) => c.type === categoryType);
    return category ? category.description : "Tidak Diketahui";
  };

  const getCompanyDescription = (companyType: string) => {
    const company = COMPANIES.find((c) => c.type === companyType);
    return company ? company.description : "Tidak Diketahui";
  };

  const getLocationDescription = (locationType: string) => {
    const location = LOCATIONS.find((l) => l.type === locationType);
    return location ? location.description : "Tidak Diketahui";
  };

  const getStatusDescription = (statusCode: string) => {
    const status = STATUSES.find((s) => s.type === statusCode);
    return status ? status.description : "Tidak Diketahui";
  };

  return (
    <div className="min-h-screen max-h-screen overflow-auto bg-gray-100">
      <main className="container mx-auto p-8">
        <h1 className="mb-8 text-3xl font-bold flex items-center space-x-3">
          <Package className="h-8 w-8 text-primary" />
          <span>Detail Aset</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 shadow-lg rounded-lg overflow-hidden">
            <CardHeader className="bg-primary text-primary-foreground p-6">
              <CardTitle className="text-2xl font-bold">
                {item.name} ({item.assetNumber})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-semibold">Nomor Aset:</TableCell>
                    <TableCell>{item.assetNumber}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Nama Aset:</TableCell>
                    <TableCell>{item.name}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Deskripsi:</TableCell>
                    <TableCell>{item.description || "-"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Unit (Jenis Aset):</TableCell>
                    <TableCell>{getUnitDescription(item.unit)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Region:</TableCell>
                    <TableCell>{getCategoryDescription(item.category)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Perusahaan:</TableCell>
                    <TableCell>{getCompanyDescription(item.company)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Departemen:</TableCell>
                    <TableCell>{item.department}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Lokasi:</TableCell>
                    <TableCell>{getLocationDescription(item.location)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Status:</TableCell>
                    <TableCell>{getStatusDescription(item.status)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Pengguna:</TableCell>
                    <TableCell>{getUserName(item.user)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Tanggal Garansi:</TableCell>
                    <TableCell>
                      {item.guaranteeDate
                        ? new Date(item.guaranteeDate).toLocaleDateString()
                        : "-"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Tanggal Registrasi:</TableCell>
                    <TableCell>
                      {item.registrationDate
                        ? new Date(item.registrationDate).toLocaleDateString()
                        : "-"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Alamat IP:</TableCell>
                    <TableCell>{item.ipAddress || "-"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Remote Access:</TableCell>
                    <TableCell>{item.remote || "-"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Dibuat Pada:</TableCell>
                    <TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Diperbarui Pada:</TableCell>
                    <TableCell>{new Date(item.updatedAt).toLocaleString()}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-lg overflow-hidden flex flex-col justify-center items-center p-6">
            <CardHeader className="w-full text-center">
              <CardTitle className="text-xl font-bold">QR Code Aset</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex justify-center items-center">
              <QRCodeGenerator value={`${window.location.origin}/items/${itemId}`} size={200} />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mt-8">
          <Button
            onClick={() => router.push(`/items?id=${item.id}`)}
            className="bg-primary hover:bg-primary-dark text-primary-foreground px-6 py-3 rounded-md shadow-md transition-colors duration-300"
          >
            Edit Aset
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/view-devices")}
            className="border-primary text-primary hover:bg-primary-foreground/10 px-6 py-3 rounded-md shadow-md transition-colors duration-300"
          >
            Kembali ke Daftar Aset
          </Button>
        </div>
      </main>
      <Toaster />
    </div>
  );
}

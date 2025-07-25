"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getItemById } from "@/lib/itemService";
import { Item, User } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Package,
  Cpu,
  HardDrive,
  MemoryStick,
  Monitor,
  Palette,
  Network,
  Laptop,
  Tag,
  Fingerprint,
} from "lucide-react";
import { COMPANIES, STATUSES } from "@/lib/constants";
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

  const getCompanyDescription = (companyType: string) => {
    const company = COMPANIES.find((c) => c.type === companyType);
    return company ? company.description : "Tidak Diketahui";
  };

  const getStatusDescription = (statusCode: string) => {
    const status = STATUSES.find((s) => s.type === statusCode);
    return status ? status.description : "Tidak Diketahui";
  };

  return (
    <div className="min-h-screen max-h-screen overflow-auto bg-gray-100">
      <main className="container mx-auto p-8">
        <h1 className="mb-4 text-3xl font-bold flex items-center space-x-3">
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
            <CardContent className="p-6 max-h-[60vh] overflow-y-auto">
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
                    <TableCell className="font-semibold">Perusahaan:</TableCell>
                    {/* @ts-expect-error its okay */}
                    <TableCell>{getCompanyDescription(item.company)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Departemen:</TableCell>
                    <TableCell>{item.department}</TableCell>
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
                    <TableCell className="font-semibold">
                      Tanggal Garansi:
                    </TableCell>
                    <TableCell>
                      {item.guaranteeDate
                        ? new Date(item.guaranteeDate).toLocaleDateString()
                        : "-"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">
                      Tanggal Registrasi:
                    </TableCell>
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
                    <TableCell className="font-semibold">
                      Dibuat Pada:
                    </TableCell>
                    <TableCell>
                      {new Date(item.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">
                      Diperbarui Pada:
                    </TableCell>
                    <TableCell>
                      {new Date(item.updatedAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-lg overflow-hidden flex flex-col justify-center items-center p-6">
            <CardHeader className="w-full text-center">
              <CardTitle className="text-xl font-bold">QR Code Aset</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-center items-center -mt-8">
              <QRCodeGenerator
                value={`${window.location.origin}/items/${itemId}`}
                size={160}
              />

              <div className="grid grid-cols-1 gap-y-1 mt-4 max-h-48 overflow-y-auto">
                {item.brand && (
                  <div className="flex items-center space-x-2 text-gray-700">
                    <Tag className="h-5 w-5" />
                    <span>Merek: {item.brand}</span>
                  </div>
                )}
                {item.model && (
                  <div className="flex items-center space-x-2 text-gray-700">
                    <Laptop className="h-5 w-5" />
                    <span>Model: {item.model}</span>
                  </div>
                )}
                {item.serialNumber && (
                  <div className="flex items-center space-x-2 text-gray-700">
                    <Fingerprint className="h-5 w-5" />
                    <span>Serial Number: {item.serialNumber}</span>
                  </div>
                )}
                {item.processor && (
                  <div className="flex items-center space-x-2 text-gray-700">
                    <Cpu className="h-5 w-5" />
                    <span>Processor: {item.processor}</span>
                  </div>
                )}
                {item.storage && (
                  <div className="flex items-center space-x-2 text-gray-700">
                    <HardDrive className="h-5 w-5" />
                    <span>Penyimpanan: {item.storage}</span>
                  </div>
                )}
                {item.ram && (
                  <div className="flex items-center space-x-2 text-gray-700">
                    <MemoryStick className="h-5 w-5" />
                    <span>RAM: {item.ram}</span>
                  </div>
                )}
                {item.vga && (
                  <div className="flex items-center space-x-2 text-gray-700">
                    <Monitor className="h-5 w-5" />
                    <span>VGA: {item.vga}</span>
                  </div>
                )}
                {item.screenSize && (
                  <div className="flex items-center space-x-2 text-gray-700">
                    <Monitor className="h-5 w-5" />
                    <span>Ukuran Layar: {item.screenSize}</span>
                  </div>
                )}
                {item.color && (
                  <div className="flex items-center space-x-2 text-gray-700">
                    <Palette className="h-5 w-5" />
                    <span>Warna: {item.color}</span>
                  </div>
                )}
                {item.macAddressLan && (
                  <div className="flex items-center space-x-2 text-gray-700">
                    <Network className="h-5 w-5" />
                    <span>MAC Address LAN: {item.macAddressLan}</span>
                  </div>
                )}
                {item.macAddressWlan && (
                  <div className="flex items-center space-x-2 text-gray-700">
                    <Network className="h-5 w-5" />
                    <span>MAC Address WLAN: {item.macAddressWlan}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mt-8">
          <Button
            onClick={() => router.push(`/items?id=${item.id}`)}
            className="bg-primary hover:bg-primary-dark text-prima ry-foreground px-6 py-3 rounded-md shadow-md transition-colors duration-300"
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

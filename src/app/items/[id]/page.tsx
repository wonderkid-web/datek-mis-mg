"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getItemById } from "@/lib/itemService";
import { Item, User } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

        <Card className="mb-8 shadow-lg rounded-lg overflow-hidden">
          <CardHeader className="bg-primary text-primary-foreground p-6">
            <CardTitle className="text-2xl font-bold">
              {item.name} ({item.assetNumber})
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-4 text-gray-700">
            <div className="space-y-4">
              <div>
                <dt className="font-semibold text-gray-900">Nomor Aset:</dt>
                <dd className="ml-2">{item.assetNumber}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-900">Nama Aset:</dt>
                <dd className="ml-2">{item.name}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-900">Deskripsi:</dt>
                <dd className="ml-2">{item.description || "-"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-900">
                  Unit (Jenis Aset):
                </dt>
                <dd className="ml-2">{getUnitDescription(item.unit)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-900">Region:</dt>
                <dd className="ml-2">
                  {getCategoryDescription(item.category)}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-900">Perusahaan:</dt>
                <dd className="ml-2">{getCompanyDescription(item.company)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-900">Departemen:</dt>
                <dd className="ml-2">{item.department}</dd>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <dt className="font-semibold text-gray-900">Lokasi:</dt>
                <dd className="ml-2">
                  {getLocationDescription(item.location)}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-900">Status:</dt>
                <dd className="ml-2">{getStatusDescription(item.status)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-900">Pengguna:</dt>
                <dd className="ml-2">{getUserName(item.user)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-900">
                  Tanggal Garansi:
                </dt>
                <dd className="ml-2">
                  {item.guaranteeDate
                    ? new Date(item.guaranteeDate).toLocaleDateString()
                    : "-"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-900">
                  Tanggal Registrasi:
                </dt>
                <dd className="ml-2">
                  {item.registrationDate
                    ? new Date(item.registrationDate).toLocaleDateString()
                    : "-"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-900">Alamat IP:</dt>
                <dd className="ml-2">{item.ipAddress || "-"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-900">Remote Access:</dt>
                <dd className="ml-2">{item.remote || "-"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-900">Dibuat Pada:</dt>
                <dd className="ml-2">
                  {new Date(item.createdAt).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-900">
                  Diperbarui Pada:
                </dt>
                <dd className="ml-2">
                  {new Date(item.updatedAt).toLocaleString()}
                </dd>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex space-x-4 mt-8">
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

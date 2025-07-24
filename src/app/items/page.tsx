"use client";

import { useEffect, useState } from "react";
import { Item, User } from "@/lib/types";
import { createItem, updateItem, getItemById } from "@/lib/itemService";
import { getUsers } from "@/lib/userService";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ASSET_INFO,
  CATEGORIES,
  COMPANIES,
  DEPARTMENTS,
  LOCATIONS,
  STATUSES,
} from "@/lib/constants";
import { useAuth } from "../context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Toaster, toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const initialFormState: Omit<Item, "id" | "createdAt" | "updatedAt"> = {
  name: "",
  description: "",
  unit: "",
  category: "",
  company: "",
  department: "",
  location: "",
  status: "",
  user: "",
  assetNumber: "",
  guaranteeDate: undefined,
  registrationDate: undefined,
  ipAddress: "",
  remote: "",
  isDeleted: false,
};

export default function ItemsPage() {
  const { user: currentUser, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState(initialFormState);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push("/auth");
    }
    fetchInitialData();

    const itemId = searchParams.get("id");
    if (itemId) {
      fetchItemForEdit(itemId);
    }
  }, [loading, currentUser, router, searchParams]);

  const fetchInitialData = async () => {
    const usersData = await getUsers();
    setUsers(usersData);
  };

  const fetchItemForEdit = async (id: string) => {
    const item = await getItemById(id);
    if (item) {
      setEditingItem(item);
      setForm({
        name:
          item.name ||
          ASSET_INFO.find((u) => u.type === item.unit && u.table === "AAM.Unit")
            ?.description ||
          "",
        description: item.description,
        unit: item.unit,
        category: item.category,
        company: item.company,
        department: item.department,
        location: item.location,
        status: item.status,
        user: item.user,
        assetNumber: item.assetNumber,
        guaranteeDate: item.guaranteeDate,
        registrationDate: item.registrationDate,
        ipAddress: item.ipAddress,
        remote: item.remote,
        isDeleted: item.isDeleted,
      });
    } else {
      toast.error("Item not found.");
      router.push("/items"); // Redirect back to items list if not found
    }
  };

  const handleSelectChange = (name: keyof typeof form, value: string) => {
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
      ...(name === "unit" && {
        name:
          ASSET_INFO.find((u) => u.type === value && u.table === "AAM.Unit")
            ?.description || "",
      }),
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting form data:", {
      unit: form.unit,
      user: form.user,
      assetNumber: form.assetNumber,
    });
    if (!form.unit || !form.user || !form.assetNumber) {
      toast.error("Please fill all required fields.");
      return;
    }

    const itemData = { ...form };
    console.log("Submitting itemData:", itemData);

    if (editingItem) {
      await updateItem(editingItem.id!, itemData);
      toast.success("Item updated successfully!");
    } else {
      await createItem(itemData);
      toast.success("Item created successfully!");
    }
    setForm(initialFormState);
    setEditingItem(null);
    fetchInitialData();
  };

  return (
    <div className="min-h-screen max-h-screen overflow-auto bg-gray-100">
      <main className="container mx-auto p-8">
        <h1 className="mb-8 text-3xl font-bold">Kelola Aset</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              {editingItem ? "Edit Aset" : "Tambah Aset Baru"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Column 1 */}
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Unit (Jenis Aset)
                  </label>
                  <Combobox
                    options={ASSET_INFO.filter(
                      (asset) => asset.table == "AAM.Unit"
                    ).map((unit) => ({
                      value: unit.type,
                      label: unit.description,
                    }))}
                    value={form.unit}
                    onValueChange={(value) => handleSelectChange("unit", value)}
                    placeholder="Pilih Unit"
                    searchPlaceholder="Cari Unit..."
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Region
                  </label>
                  <Select
                    onValueChange={(value) =>
                      handleSelectChange("category", value)
                    }
                    value={form.category}
                    required
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Region" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.type} value={cat.type}>
                          {cat.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Perusahaan
                  </label>
                  <Select
                    onValueChange={(value) =>
                      handleSelectChange("company", value)
                    }
                    value={form.company}
                    required
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Perusahaan" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPANIES.map((com) => (
                        <SelectItem key={com.type} value={com.type}>
                          {com.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Departemen
                  </label>
                  <Select
                    onValueChange={(value) =>
                      handleSelectChange("department", value)
                    }
                    value={form.department}
                    required
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Departemen" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((dep) => (
                        <SelectItem key={dep} value={dep}>
                          {dep}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Lokasi
                  </label>
                  <Select
                    onValueChange={(value) =>
                      handleSelectChange("location", value)
                    }
                    value={form.location}
                    required
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Lokasi" />
                    </SelectTrigger>
                    <SelectContent>
                      {LOCATIONS.map((loc) => (
                        <SelectItem key={loc.type} value={loc.type}>
                          {loc.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <Select
                    onValueChange={(value) =>
                      handleSelectChange("status", value)
                    }
                    value={form.status}
                    required
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((stat) => (
                        <SelectItem key={stat.type} value={stat.type}>
                          {stat.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Column 2 */}
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Nomor Aset
                  </label>
                  <Input
                    name="assetNumber"
                    value={form.assetNumber}
                    onChange={handleInputChange}
                    placeholder="Nomor Aset Unik"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Pengguna
                  </label>
                  <Select
                    onValueChange={(value) => handleSelectChange("user", value)}
                    value={form.user}
                    required
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Pengguna" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((u) => (
                        <SelectItem key={u.id!} value={u.id!}>
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Deskripsi (Merk/Model/SN)
                  </label>
                  <Textarea
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                    placeholder="Detail spesifik aset"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Tanggal Garansi
                  </label>
                  <Input
                    name="guaranteeDate"
                    type="date"
                    value={
                      form.guaranteeDate
                        ? new Date(form.guaranteeDate)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Tanggal Registrasi
                  </label>
                  <Input
                    name="registrationDate"
                    type="date"
                    value={
                      form.registrationDate
                        ? new Date(form.registrationDate)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Alamat IP
                  </label>
                  <Input
                    name="ipAddress"
                    value={form.ipAddress}
                    onChange={handleInputChange}
                    placeholder="Jika ada"
                    title="Masukkan alamat IP yang valid (contoh: 192.168.1.1)"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Remote Access
                  </label>
                  <Input
                    name="remote"
                    value={form.remote}
                    onChange={handleInputChange}
                    placeholder="Jika ada"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="md:col-span-2 flex justify-end space-x-4">
                <Button type="submit" className="w-full md:w-auto">
                  {editingItem ? "Perbarui Aset" : "Tambah Aset"}
                </Button>
                {editingItem && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingItem(null);
                      setForm(initialFormState);
                    }}
                    className="w-full md:w-auto"
                  >
                    Batal
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      <Toaster />
    </div>
  );
}

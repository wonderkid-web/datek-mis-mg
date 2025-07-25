"use client";

import { useEffect, useState, useCallback } from "react";
import { Item, User, ManufacturedItem } from "@/lib/types";
import { createItem, updateItem, getItemById } from "@/lib/itemService";
import { getUsers } from "@/lib/userService";
import { getManufacturedItems } from "@/lib/manufactureService";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ASSET_INFO,
  STATUSES,
  MANUFACTURE_ASSET_TYPES,
} from "@/lib/constants";
import { useAuth } from "../context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Toaster, toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const initialFormState: Omit<Item, "id" | "createdAt" | "updatedAt"> = {
  name: "",
  description: "",
  unit: "",
  sbu: "",
  department: "",
  status: "",
  user: "",
  assetNumber: "",
  guaranteeDate: undefined,
  registrationDate: undefined,
  ipAddress: "",
  remote: "",
  isDeleted: false,
  manufacturedItemId: undefined,
  brand: undefined,
  model: undefined,
  serialNumber: undefined,
  processor: undefined,
  storage: undefined,
  ram: undefined,
  vga: undefined,
  screenSize: undefined,
  color: undefined,
  macAddressLan: undefined,
  macAddressWlan: undefined,
};

export default function ItemsPage() {
  const { user: currentUser, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [manufacturedItems, setManufacturedItems] = useState<
    ManufacturedItem[]
  >([]);
  const [form, setForm] = useState(initialFormState);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [selectedManufacturedItem, setSelectedManufacturedItem] =
    useState<ManufacturedItem | null>(null);

  useEffect(() => {
    if (selectedManufacturedItem) {
      setForm((prevForm) => ({
        ...prevForm,
        name: selectedManufacturedItem.type, // Set item name based on manufactured type
        description: `${selectedManufacturedItem.brand} ${selectedManufacturedItem.model} SN: ${selectedManufacturedItem.serialNumber}`,
        brand: selectedManufacturedItem.brand,
        model: selectedManufacturedItem.model,
        serialNumber: selectedManufacturedItem.serialNumber,
        processor: selectedManufacturedItem.processor,
        storage: selectedManufacturedItem.storage,
        ram: selectedManufacturedItem.ram,
        vga: selectedManufacturedItem.vga,
        screenSize: selectedManufacturedItem.screenSize,
        color: selectedManufacturedItem.color,
        macAddressLan: selectedManufacturedItem.macAddressLan,
        macAddressWlan: selectedManufacturedItem.macAddressWlan,
        manufacturedItemId: selectedManufacturedItem.id,
      }));
    } else {
      // Clear manufactured item specific fields if no manufactured item is selected
      setForm((prevForm) => ({
        ...prevForm,
        brand: undefined,
        model: undefined,
        serialNumber: undefined,
        processor: undefined,
        storage: undefined,
        ram: undefined,
        vga: undefined,
        screenSize: undefined,
        color: undefined,
        macAddressLan: undefined,
        macAddressWlan: undefined,
        manufacturedItemId: undefined,
      }));
    }
  }, [selectedManufacturedItem]);

  const fetchInitialData = async () => {
    const usersData = await getUsers();
    setUsers(usersData);
    const manufacturedItemsData = await getManufacturedItems();
    setManufacturedItems(manufacturedItemsData);
  };

  const fetchItemForEdit = useCallback(
    async (id: string) => {
      const item = await getItemById(id);
      if (item) {
        setEditingItem(item);
        setForm({
          name: item.name,
          description: item.description,
          unit: item.unit,
          sbu: item.sbu,
          department: item.department,
          status: item.status,
          user: item.user,
          assetNumber: item.assetNumber,
          guaranteeDate: item.guaranteeDate,
          registrationDate: item.registrationDate,
          ipAddress: item.ipAddress,
          remote: item.remote,
          isDeleted: item.isDeleted,
          manufacturedItemId: item.manufacturedItemId,
          brand: item.brand,
          model: item.model,
          serialNumber: item.serialNumber,
          processor: item.processor,
          storage: item.storage,
          ram: item.ram,
          vga: item.vga,
          screenSize: item.screenSize,
          color: item.color,
          macAddressLan: item.macAddressLan,
          macAddressWlan: item.macAddressWlan,
        });
        // If editing an item linked to a manufactured item, set selectedManufacturedItem
        if (item.manufacturedItemId) {
          const foundManufacturedItem = manufacturedItems.find(
            (mi) => mi.id === item.manufacturedItemId
          );
          if (foundManufacturedItem) {
            setSelectedManufacturedItem(foundManufacturedItem);
          }
        }
      } else {
        toast.error("Item not found.");
        router.push("/items"); // Redirect back to items list if not found
      }
    },
    [manufacturedItems, router]
  );

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

    if (name === "unit") {
      const selectedType = MANUFACTURE_ASSET_TYPES.find(
        (type) => type.value === value
      );
      if (selectedType) {
        // Find manufactured items of the selected type
        const relevantManufacturedItems = manufacturedItems.filter(
          (mi) => mi.type === selectedType.value
        );
        // For now, let's just pick the first one if available, or clear if none
        setSelectedManufacturedItem(
          relevantManufacturedItems.length > 0
            ? relevantManufacturedItems[0]
            : null
        );
      }
    } else {
      setSelectedManufacturedItem(null);
    }
  };

  const handleUserChange = (userId: string) => {
    const selectedUser = users.find((u) => u.id === userId);
    if (selectedUser) {
      setForm((prevForm) => ({
        ...prevForm,
        user: userId,
        sbu: selectedUser.sbu || "",
        department: selectedUser.department || "",
      }));
    }
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
      manufacturedItemId: form.manufacturedItemId,
      brand: form.brand,
      model: form.model,
      serialNumber: form.serialNumber,
      processor: form.processor,
      storage: form.storage,
      ram: form.ram,
      vga: form.vga,
      screenSize: form.screenSize,
      color: form.color,
      macAddressLan: form.macAddressLan,
      macAddressWlan: form.macAddressWlan,
    });
    if (!form.unit || !form.user || !form.assetNumber) {
      toast.error("Please fill all required fields.");
      return;
    }

    const itemData = { ...form };
    console.log("Submitting itemData:", itemData);

    try {
      if (editingItem) {
        await updateItem(editingItem.id!, itemData);
        toast.success("Item updated successfully!");
      } else {
        await createItem(itemData);
        toast.success("Item created successfully!");
      }
      setForm(initialFormState);
      setEditingItem(null);
      setSelectedManufacturedItem(null);
      fetchInitialData();
    } catch (error) {
      console.error("Error submitting item:", error);
      toast.error("Gagal menyimpan item.");
    }
  };

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push("/auth");
    }
    fetchInitialData();

    const itemId = searchParams.get("id");
    if (itemId) {
      fetchItemForEdit(itemId);
    }
  }, [loading, currentUser, router, searchParams, fetchItemForEdit]);

  return (
    <div className="min-h-screen max-h-screen overflow-auto bg-gray-100">
      <main className="container mx-auto p-8">
        <h1 className="mb-8 text-3xl font-bold">Kelola Aset</h1>

        <Card className="mb-8 shadow-lg rounded-lg">
          <CardHeader className="bg-primary text-primary-foreground p-6">
            <CardTitle className="text-2xl font-bold">
              {editingItem ? "Edit Aset" : "Tambah Aset Baru"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Section 1: General Info & Core Details */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                  Informasi Umum & Detail Aset
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 pt-4">
                  {/* Fields arranged in a 2-column grid */}
                  <div>
                    <Label htmlFor="unit">Unit (Jenis Aset)</Label>
                    <Select
                      onValueChange={(value) => handleSelectChange("unit", value)}
                      value={form.unit}
                      required
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {MANUFACTURE_ASSET_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {form.unit &&
                    manufacturedItems.filter((mi) => mi.type === form.unit)
                      .length > 0 && (
                      <div>
                        <Label htmlFor="manufacturedItem">
                          Pilih Item Manufaktur
                        </Label>
                        <Select
                          onValueChange={(value) => {
                            const selected = manufacturedItems.find(
                              (mi) => mi.id === value
                            );
                            setSelectedManufacturedItem(selected || null);
                          }}
                          value={selectedManufacturedItem?.id || ""}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih Item Manufaktur" />
                          </SelectTrigger>
                          <SelectContent>
                            {manufacturedItems
                              .filter((mi) => mi.type === form.unit)
                              .map((mi) => (
                                <SelectItem key={mi.id} value={mi.id!}>
                                  {`${mi.brand} ${mi.model} (SN: ${mi.serialNumber})`}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                  <div>
                    <Label htmlFor="assetNumber">Nomor Aset</Label>
                    <Input
                      id="assetNumber"
                      name="assetNumber"
                      value={form.assetNumber}
                      onChange={handleInputChange}
                      placeholder="Nomor Aset Unik"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="user">Pengguna</Label>
                    <Select
                      onValueChange={handleUserChange}
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

                  <div>                    <Label htmlFor="sbu">SBU</Label>                    <Input                      id="sbu"                      name="sbu"                      value={form.sbu}                      readOnly                      placeholder="Ditentukan oleh Pengguna"                    />                  </div>

                  <div>
                    <Label htmlFor="department">Departemen</Label>
                    <Input
                      id="department"
                      name="department"
                      value={form.department}
                      readOnly
                      placeholder="Ditentukan oleh Pengguna"
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
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

                  {/* Full-width description */}
                  <div className="md:col-span-2">
                    <Label htmlFor="description">
                      Deskripsi (Merk/Model/SN)
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={form.description}
                      onChange={
                        selectedManufacturedItem ? undefined : handleInputChange
                      }
                      placeholder="Detail spesifik aset"
                      required
                      readOnly={!!selectedManufacturedItem && !editingItem}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Manufactured Details */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                  Detail Manufaktur
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4 pt-4">
                  <div>
                    <Label htmlFor="brand">Merek</Label>
                    <Input
                      id="brand"
                      type="text"
                      value={form.brand || ""}
                      readOnly={!!selectedManufacturedItem && !editingItem}
                    />
                  </div>
                  <div>
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      type="text"
                      value={form.model || ""}
                      readOnly={!!selectedManufacturedItem && !editingItem}
                    />
                  </div>
                  <div>
                    <Label htmlFor="serialNumber">Serial Number</Label>
                    <Input
                      id="serialNumber"
                      type="text"
                      value={form.serialNumber || ""}
                      readOnly={!!selectedManufacturedItem && !editingItem}
                    />
                  </div>
                  <div>
                    <Label htmlFor="processor">Processor</Label>
                    <Input
                      id="processor"
                      type="text"
                      value={form.processor || ""}
                      readOnly={!!selectedManufacturedItem && !editingItem}
                    />
                  </div>
                  <div>
                    <Label htmlFor="storage">Penyimpanan</Label>
                    <Input
                      id="storage"
                      type="text"
                      value={form.storage || ""}
                      readOnly={!!selectedManufacturedItem && !editingItem}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ram">RAM</Label>
                    <Input
                      id="ram"
                      type="text"
                      value={form.ram || ""}
                      readOnly={!!selectedManufacturedItem && !editingItem}
                    />
                  </div>
                  <div>
                    <Label htmlFor="vga">VGA</Label>
                    <Input
                      id="vga"
                      type="text"
                      value={form.vga || ""}
                      readOnly={!!selectedManufacturedItem && !editingItem}
                    />
                  </div>
                  <div>
                    <Label htmlFor="screenSize">Ukuran Layar</Label>
                    <Input
                      id="screenSize"
                      type="text"
                      value={form.screenSize || ""}
                      readOnly={!!selectedManufacturedItem && !editingItem}
                    />
                  </div>
                  <div>
                    <Label htmlFor="color">Warna</Label>
                    <Input
                      id="color"
                      type="text"
                      value={form.color || ""}
                      readOnly={!!selectedManufacturedItem && !editingItem}
                    />
                  </div>
                  <div>
                    <Label htmlFor="macAddressLan">MAC Address LAN</Label>
                    <Input
                      id="macAddressLan"
                      type="text"
                      value={form.macAddressLan || ""}
                      readOnly={!!selectedManufacturedItem && !editingItem}
                    />
                  </div>
                  <div>
                    <Label htmlFor="macAddressWlan">MAC Address WLAN</Label>
                    <Input
                      id="macAddressWlan"
                      type="text"
                      value={form.macAddressWlan || ""}
                      readOnly={!!selectedManufacturedItem && !editingItem}
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Additional Info */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                  Informasi Tambahan
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4 pt-4">
                  <div>
                    <Label htmlFor="guaranteeDate">Tanggal Garansi</Label>
                    <Input
                      id="guaranteeDate"
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
                    <Label htmlFor="registrationDate">
                      Tanggal Registrasi
                    </Label>
                    <Input
                      id="registrationDate"
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
                    <Label htmlFor="ipAddress">Alamat IP</Label>
                    <Input
                      id="ipAddress"
                      name="ipAddress"
                      value={form.ipAddress}
                      onChange={handleInputChange}
                      placeholder="Jika ada"
                      title="Masukkan alamat IP yang valid (contoh: 192.168.1.1)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="remote">Remote Access</Label>
                    <Input
                      id="remote"
                      name="remote"
                      value={form.remote}
                      onChange={handleInputChange}
                      placeholder="Jika ada"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6">
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
                      setSelectedManufacturedItem(null);
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

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster, toast } from "sonner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  createAssetType, getAssetTypes, updateAssetType, deleteAssetType
} from "@/lib/assetTypeService";
import {
  createBrand, getBrands, updateBrand, deleteBrand
} from "@/lib/brandService";
import {
  createProcessor, getProcessors, updateProcessor, deleteProcessor
} from "@/lib/processorService";
import {
  createStorage, getStorages, updateStorage, deleteStorage
} from "@/lib/storageService";
import {
  createRam, getRams, updateRam, deleteRam
} from "@/lib/ramService";
import {
  createVga, getVgas, updateVga, deleteVga
} from "@/lib/vgaService";
import {
  createScreenSize, getScreenSizes, updateScreenSize, deleteScreenSize
} from "@/lib/screenSizeService";
import {
  createColor, getColors, updateColor, deleteColor
} from "@/lib/colorService";
import {
  AssetType, Brand, Processor, Storage, Ram, Vga, ScreenSize, Color, MasterDataItem
} from "@/lib/types";

interface CrudSectionProps<T extends MasterDataItem> {
  title: string;
  service: {
    create: (item: Omit<T, "id" | "createdAt" | "updatedAt">) => Promise<string>;
    getAll: () => Promise<T[]>;
    update: (id: string, item: Partial<Omit<T, "id" | "createdAt"> | T>) => Promise<void>;
    delete: (id: string) => Promise<void>;
  };
  initialFormState: Omit<T, "id" | "createdAt" | "updatedAt">;
}

function CrudSection<T extends MasterDataItem>({ title, service, initialFormState }: CrudSectionProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [form, setForm] = useState(initialFormState);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);

 

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await service.getAll();
      setItems(data);
    } catch (error) {
      console.error(`Error fetching ${title.toLowerCase()}:`, error);
      toast.error(`Gagal memuat ${title.toLowerCase()}.`);
    } finally {
      setIsLoading(false);
    }
  }, [service, title]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingItem) {
        // @ts-expect-error its okay
        await service.update(editingItem.id!, form);
        toast.success(`${title} berhasil diperbarui!`);
      } else {
        await service.create(form);
        toast.success(`${title} berhasil ditambahkan!`);
      }
      setForm(initialFormState);
      setEditingItem(null);
      fetchItems();
    } catch (error) {
      console.error(`Error saving ${title.toLowerCase()}:`, error);
      toast.error(`Gagal menyimpan ${title.toLowerCase()}.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: T) => {
    setEditingItem(item);
    setForm(item);
  };

  const handleDelete = async (id: string) => {
    toast(`Anda yakin ingin menghapus ${title.toLowerCase()} ini?`, {
      action: {
        label: "Hapus",
        onClick: async () => {
          toast.promise(service.delete(id), {
            loading: `Menghapus ${title.toLowerCase()}...`,
            success: () => {
              fetchItems();
              return `${title} berhasil dihapus!`;
            },
            error: `Gagal menghapus ${title.toLowerCase()}.`,
          });
        },
      },
      cancel: {
        label: "Batal",
        onClick: () => toast.dismiss(),
      },
    });
  };

   useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return (
    <Card className="mb-8 shadow-lg rounded-lg">
      <CardHeader className="bg-secondary text-secondary-foreground p-4">
        <CardTitle className="text-xl font-bold">Kelola {title}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <Label htmlFor="name">Nama {title}</Label>
            <Input
              id="name"
              type="text"
              value={(form as any).name}
              onChange={handleChange}
              placeholder={`Masukkan nama ${title.toLowerCase()}...`}
              required
            />
          </div>
          <div className="flex space-x-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : editingItem ? "Perbarui" : "Tambah"}
            </Button>
            {editingItem && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingItem(null);
                  setForm(initialFormState);
                }}
              >
                Batal
              </Button>
            )}
          </div>
        </form>

        {isLoading ? (
          <p>Memuat {title.toLowerCase()}...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-left">Nama</th>
                  <th className="py-2 px-4 border-b text-left">Dibuat Pada</th>
                  <th className="py-2 px-4 border-b text-left">Diperbarui Pada</th>
                  <th className="py-2 px-4 border-b text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{(item as any).name}</td>
                    <td className="py-2 px-4 border-b">
                      {item.createdAt ? new Date(item.createdAt).toLocaleString() : "-"}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "-"}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(item)} className="mr-2">Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id!)}>Hapus</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function MasterDataPage() {
  return (
    <div className="min-h-screen max-h-screen overflow-auto bg-gray-100">
      <main className="container mx-auto p-8">
        <h1 className="mb-8 text-3xl font-bold">Master Data</h1>

        <Tabs defaultValue="assetTypes" className="w-full mb-8">
          <TabsList className="w-full">
            <TabsTrigger value="assetTypes">Tipe Aset</TabsTrigger>
            <TabsTrigger value="brands">Merek</TabsTrigger>
            <TabsTrigger value="processors">Processor</TabsTrigger>
            <TabsTrigger value="storages">Penyimpanan</TabsTrigger>
            <TabsTrigger value="rams">RAM</TabsTrigger>
            <TabsTrigger value="vgas">VGA</TabsTrigger>
            <TabsTrigger value="screenSizes">Ukuran Layar</TabsTrigger>
            <TabsTrigger value="colors">Warna</TabsTrigger>
          </TabsList>
          <TabsContent value="assetTypes">
            <CrudSection<AssetType>
              title="Tipe Aset"
              service={{
                create: createAssetType,
                getAll: getAssetTypes,
                update: updateAssetType,
                delete: deleteAssetType,
              }}
              initialFormState={{ name: "" }}
            />
          </TabsContent>
          <TabsContent value="brands">
            <CrudSection<Brand>
              title="Merek"
              service={{
                create: createBrand,
                getAll: getBrands,
                update: updateBrand,
                delete: deleteBrand,
              }}
              initialFormState={{ name: "" }}
            />
          </TabsContent>
          <TabsContent value="processors">
            <CrudSection<Processor>
              title="Processor"
              service={{
                create: createProcessor,
                getAll: getProcessors,
                update: updateProcessor,
                delete: deleteProcessor,
              }}
              initialFormState={{ name: "" }}
            />
          </TabsContent>
          <TabsContent value="storages">
            <CrudSection<Storage>
              title="Penyimpanan"
              service={{
                create: createStorage,
                getAll: getStorages,
                update: updateStorage,
                delete: deleteStorage,
              }}
              initialFormState={{ name: "" }}
            />
          </TabsContent>
          <TabsContent value="rams">
            <CrudSection<Ram>
              title="RAM"
              service={{
                create: createRam,
                getAll: getRams,
                update: updateRam,
                delete: deleteRam,
              }}
              initialFormState={{ name: "" }}
            />
          </TabsContent>
          <TabsContent value="vgas">
            <CrudSection<Vga>
              title="VGA"
              service={{
                create: createVga,
                getAll: getVgas,
                update: updateVga,
                delete: deleteVga,
              }}
              initialFormState={{ name: "" }}
            />
          </TabsContent>
          <TabsContent value="screenSizes">
            <CrudSection<ScreenSize>
              title="Ukuran Layar"
              service={{
                create: createScreenSize,
                getAll: getScreenSizes,
                update: updateScreenSize,
                delete: deleteScreenSize,
              }}
              initialFormState={{ name: "" }}
            />
          </TabsContent>
          <TabsContent value="colors">
            <CrudSection<Color>
              title="Warna"
              service={{
                create: createColor,
                getAll: getColors,
                update: updateColor,
                delete: deleteColor,
              }}
              initialFormState={{ name: "" }}
            />
          </TabsContent>
        </Tabs>
      </main>
      <Toaster />
    </div>
  );
}

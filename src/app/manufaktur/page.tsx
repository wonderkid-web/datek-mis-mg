"use client";

import { useEffect, useState } from "react";
import { getAssetTypes } from "@/lib/assetTypeService";
import { AssetType } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ManufakturPage() {
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [selectedAssetType, setSelectedAssetType] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchAssetTypes = async () => {
      const types = await getAssetTypes();
      setAssetTypes(types);
    };
    fetchAssetTypes();
  }, []);

  const handleAssetTypeChange = (value: string) => {
    setSelectedAssetType(value);
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Halaman Manufaktur</h1>

      <Card>
        <CardHeader>
          <CardTitle>Pilih Jenis Aset</CardTitle>
        </CardHeader>
        <CardContent>
          <Select onValueChange={handleAssetTypeChange}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Pilih jenis aset..." />
            </SelectTrigger>
            <SelectContent>
              {assetTypes.map((type) => (
                // @ts-expect-error its okay
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedAssetType && (
        <div className="mt-8">
          {/* Form dinamis akan ditampilkan di sini */}
          <p>Anda memilih jenis aset dengan ID: {selectedAssetType}</p>
        </div>
      )}
    </div>
  );
}
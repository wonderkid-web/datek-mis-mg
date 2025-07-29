"use server";
import { prisma } from "./prisma";
import { Asset } from "@prisma/client";

interface CreateAssetData {
  nomorAsset?: string;
  namaAsset: string;
  categoryId: number;
  merk?: string | null;
  model?: string | null;
  nomorSeri: string;
  tanggalPembelian?: Date | null;
  tanggalGaransi?: Date | null;
  nilaiPerolehan?: number | null;
  statusAsset: string;
  lokasiFisik?: string | null;
}

interface CreateLaptopSpecsData {
  processorOptionId?: number | null;
  ramOptionId?: number | null;
  storageTypeOptionId?: number | null;
  osOptionId?: number | null;
  portOptionId?: number | null;
  powerOptionId?: number | null;
  microsoftOfficeOptionId?: number | null;
  colorOptionId?: number | null;
  macWlan?: string | null;
  macLan?: string | null;
}

export async function createAssetAndLaptopSpecs(
  assetData: CreateAssetData,
  laptopSpecsData: CreateLaptopSpecsData
): Promise<Asset> {
  const newAsset = await prisma.asset.create({
    data: {
      ...assetData,
      laptopSpecs: {
        create: laptopSpecsData,
      },
    },
    include: {
      laptopSpecs: true, // Include laptopSpecs in the returned asset
    },
  });
  return newAsset;
}

export async function getAssets(): Promise<Asset[]> {
  const assets = await prisma.asset.findMany({
    include: {
      category: true, // Include category details
      laptopSpecs: {
        include: {
          brandOption: true,
          colorOption: true,
          microsoftOfficeOption: true,
          osOption: true,
          portOption: true,
          powerOption: true,
          processorOption: true,
          ramOption: true,
          storageTypeOption: true,
          typeOption: true,
        },
      },
    },
  });

  return assets.map(asset => ({
    ...asset,
    // Convert Decimal to number for client-side compatibility
    nilaiPerolehan: asset.nilaiPerolehan ? asset.nilaiPerolehan.toNumber() : null,
  }));
}

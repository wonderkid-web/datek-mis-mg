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

interface CreateLaptopSpecsDataInput {
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
  brandOptionId?: number | null;
  typeOptionId?: number | null;
  graphicOptionId?: number | null;
  vgaOptionId?: number | null;
  licenseOptionId?: number | null;
  licenseKey?: string | null;
}

export async function createAssetAndLaptopSpecs(
  assetData: CreateAssetData,
  laptopSpecsDataInput: CreateLaptopSpecsDataInput
): Promise<Asset> {
  const laptopSpecsCreateData: any = {
    macWlan: laptopSpecsDataInput.macWlan,
    macLan: laptopSpecsDataInput.macLan,
  };

  if (laptopSpecsDataInput.processorOptionId) {
    laptopSpecsCreateData.processorOption = { connect: { id: laptopSpecsDataInput.processorOptionId } };
  }
  if (laptopSpecsDataInput.ramOptionId) {
    laptopSpecsCreateData.ramOption = { connect: { id: laptopSpecsDataInput.ramOptionId } };
  }
  if (laptopSpecsDataInput.storageTypeOptionId) {
    laptopSpecsCreateData.storageTypeOption = { connect: { id: laptopSpecsDataInput.storageTypeOptionId } };
  }
  if (laptopSpecsDataInput.osOptionId) {
    laptopSpecsCreateData.osOption = { connect: { id: laptopSpecsDataInput.osOptionId } };
  }
  if (laptopSpecsDataInput.portOptionId) {
    laptopSpecsCreateData.portOption = { connect: { id: laptopSpecsDataInput.portOptionId } };
  }
  if (laptopSpecsDataInput.powerOptionId) {
    laptopSpecsCreateData.powerOption = { connect: { id: laptopSpecsDataInput.powerOptionId } };
  }
  if (laptopSpecsDataInput.microsoftOfficeOptionId) {
    laptopSpecsCreateData.microsoftOfficeOption = { connect: { id: laptopSpecsDataInput.microsoftOfficeOptionId } };
  }
  if (laptopSpecsDataInput.colorOptionId) {
    laptopSpecsCreateData.colorOption = { connect: { id: laptopSpecsDataInput.colorOptionId } };
  }
  if (laptopSpecsDataInput.brandOptionId) {
    laptopSpecsCreateData.brandOption = { connect: { id: laptopSpecsDataInput.brandOptionId } };
  }
  if (laptopSpecsDataInput.typeOptionId) {
    laptopSpecsCreateData.typeOption = { connect: { id: laptopSpecsDataInput.typeOptionId } };
  }
  if (laptopSpecsDataInput.graphicOptionId) {
    laptopSpecsCreateData.graphicOption = { connect: { id: laptopSpecsDataInput.graphicOptionId } };
  }
  if (laptopSpecsDataInput.vgaOptionId) {
    laptopSpecsCreateData.vgaOption = { connect: { id: laptopSpecsDataInput.vgaOptionId } };
  }
  if (laptopSpecsDataInput.licenseOptionId) {
    laptopSpecsCreateData.licenseOption = { connect: { id: laptopSpecsDataInput.licenseOptionId } };
  }

  const newAsset = await prisma.asset.create({
    data: {
      ...assetData,
      laptopSpecs: {
        create: laptopSpecsCreateData,
      },
    },
    include: {
      laptopSpecs: true,
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
          powerOption: true,
          processorOption: true,
          ramOption: true,
          storageTypeOption: true,
          typeOption: true,
        },
      },
    },
  });
// @ts-expect-error its okay
  return assets.map(asset => ({
    ...asset,
    // Convert Decimal to number for client-side compatibility
    nilaiPerolehan: asset.nilaiPerolehan ? asset.nilaiPerolehan.toNumber() : null,
  }));
}

export async function getAssetById(id: number): Promise<Asset | null> {
  const asset = await prisma.asset.findUnique({
    where: { id },
    include: {
      category: true,
      laptopSpecs: {
        include: {
          brandOption: true,
          colorOption: true,
          microsoftOfficeOption: true,
          osOption: true,
          powerOption: true,
          processorOption: true,
          ramOption: true,
          storageTypeOption: true,
          typeOption: true,
          graphicOption: true,
          vgaOption: true,
          licenseOption: true,
        },
      },
    },
  });

  if (!asset) return null;

  return {
    ...asset,
    // @ts-expect-error its okay
    nilaiPerolehan: asset.nilaiPerolehan ? asset.nilaiPerolehan.toNumber() : null,
  };
}
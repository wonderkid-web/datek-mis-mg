"use server";
import { prisma } from "./prisma";
import { Asset } from "@prisma/client";

interface CreateAssetData {
  namaAsset: string;
  categoryId: number;
  nomorSeri: string;
  tanggalPembelian?: Date | null;
  tanggalGaransi?: Date | null;
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
    laptopSpecsCreateData.processorOption = {
      connect: { id: laptopSpecsDataInput.processorOptionId },
    };
  }
  if (laptopSpecsDataInput.ramOptionId) {
    laptopSpecsCreateData.ramOption = {
      connect: { id: laptopSpecsDataInput.ramOptionId },
    };
  }
  if (laptopSpecsDataInput.storageTypeOptionId) {
    laptopSpecsCreateData.storageTypeOption = {
      connect: { id: laptopSpecsDataInput.storageTypeOptionId },
    };
  }
  if (laptopSpecsDataInput.osOptionId) {
    laptopSpecsCreateData.osOption = {
      connect: { id: laptopSpecsDataInput.osOptionId },
    };
  }
  if (laptopSpecsDataInput.portOptionId) {
    laptopSpecsCreateData.portOption = {
      connect: { id: laptopSpecsDataInput.portOptionId },
    };
  }
  if (laptopSpecsDataInput.powerOptionId) {
    laptopSpecsCreateData.powerOption = {
      connect: { id: laptopSpecsDataInput.powerOptionId },
    };
  }
  if (laptopSpecsDataInput.microsoftOfficeOptionId) {
    laptopSpecsCreateData.microsoftOfficeOption = {
      connect: { id: laptopSpecsDataInput.microsoftOfficeOptionId },
    };
  }
  if (laptopSpecsDataInput.colorOptionId) {
    laptopSpecsCreateData.colorOption = {
      connect: { id: laptopSpecsDataInput.colorOptionId },
    };
  }
  if (laptopSpecsDataInput.brandOptionId) {
    laptopSpecsCreateData.brandOption = {
      connect: { id: laptopSpecsDataInput.brandOptionId },
    };
  }
  if (laptopSpecsDataInput.typeOptionId) {
    laptopSpecsCreateData.typeOption = {
      connect: { id: laptopSpecsDataInput.typeOptionId },
    };
  }
  if (laptopSpecsDataInput.graphicOptionId) {
    laptopSpecsCreateData.graphicOption = {
      connect: { id: laptopSpecsDataInput.graphicOptionId },
    };
  }
  if (laptopSpecsDataInput.vgaOptionId) {
    laptopSpecsCreateData.vgaOption = {
      connect: { id: laptopSpecsDataInput.vgaOptionId },
    };
  }
  if (laptopSpecsDataInput.licenseOptionId) {
    laptopSpecsCreateData.licenseOption = {
      connect: { id: laptopSpecsDataInput.licenseOptionId },
    };
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

export async function getAssets(categoryId?: number): Promise<Asset[]> {
  const whereClause = categoryId ? { categoryId } : {};

  const assets = await prisma.asset.findMany({
    where: whereClause,
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
          graphicOption: true,
          vgaOption: true,
          licenseOption: true,
        },
      },
      intelNucSpecs: {
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
      printerSpecs: {
        include: {
          brandOption: true,
          typeOption: true,
          modelOption: true,
        },
      },
    },
  });

  return assets.map((asset) => ({
    ...asset,
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
      intelNucSpecs: {
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
      printerSpecs: {
        include: {
          brandOption: true,
          typeOption: true,
          modelOption: true,
        },
      },
    },
  });

  if (!asset) return null;

  return {
    ...asset,
  };
}

export async function updateBasicAssetInfo(
  id: number,
  data: Partial<CreateAssetData>
): Promise<Asset> {
  const updatedAsset = await prisma.asset.update({
    where: { id },
    data,
  });

  return {
    ...updatedAsset,
  };
}

interface UpdateLaptopSpecsDataInput {
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

interface UpdatePrinterSpecsDataInput {
  typeOptionId?: number | null;
  brandOptionId?: number | null;
  modelOptionId?: number | null;
}

export async function updateAssetAndLaptopSpecs(
  id: number,
  assetData: Partial<CreateAssetData>,
  laptopSpecsDataInput: UpdateLaptopSpecsDataInput
): Promise<Asset> {
  const laptopSpecsUpdateData: any = {};

  if (laptopSpecsDataInput.macWlan !== undefined) {
    laptopSpecsUpdateData.macWlan = laptopSpecsDataInput.macWlan;
  }
  if (laptopSpecsDataInput.macLan !== undefined) {
    laptopSpecsUpdateData.macLan = laptopSpecsDataInput.macLan;
  }
  if (laptopSpecsDataInput.licenseKey !== undefined) {
    laptopSpecsUpdateData.licenseKey = laptopSpecsDataInput.licenseKey;
  }

  if (laptopSpecsDataInput.processorOptionId !== undefined) {
    laptopSpecsUpdateData.processorOption = laptopSpecsDataInput.processorOptionId === null ? { disconnect: true } : { connect: { id: laptopSpecsDataInput.processorOptionId } };
  }
  if (laptopSpecsDataInput.ramOptionId !== undefined) {
    laptopSpecsUpdateData.ramOption = laptopSpecsDataInput.ramOptionId === null ? { disconnect: true } : { connect: { id: laptopSpecsDataInput.ramOptionId } };
  }
  if (laptopSpecsDataInput.storageTypeOptionId !== undefined) {
    laptopSpecsUpdateData.storageTypeOption = laptopSpecsDataInput.storageTypeOptionId === null ? { disconnect: true } : { connect: { id: laptopSpecsDataInput.storageTypeOptionId } };
  }
  if (laptopSpecsDataInput.osOptionId !== undefined) {
    laptopSpecsUpdateData.osOption = laptopSpecsDataInput.osOptionId === null ? { disconnect: true } : { connect: { id: laptopSpecsDataInput.osOptionId } };
  }
  if (laptopSpecsDataInput.portOptionId !== undefined) {
    laptopSpecsUpdateData.portOption = laptopSpecsDataInput.portOptionId === null ? { disconnect: true } : { connect: { id: laptopSpecsDataInput.portOptionId } };
  }
  if (laptopSpecsDataInput.powerOptionId !== undefined) {
    laptopSpecsUpdateData.powerOption = laptopSpecsDataInput.powerOptionId === null ? { disconnect: true } : { connect: { id: laptopSpecsDataInput.powerOptionId } };
  }
  if (laptopSpecsDataInput.microsoftOfficeOptionId !== undefined) {
    laptopSpecsUpdateData.microsoftOfficeOption = laptopSpecsDataInput.microsoftOfficeOptionId === null ? { disconnect: true } : { connect: { id: laptopSpecsDataInput.microsoftOfficeOptionId } };
  }
  if (laptopSpecsDataInput.colorOptionId !== undefined) {
    laptopSpecsUpdateData.colorOption = laptopSpecsDataInput.colorOptionId === null ? { disconnect: true } : { connect: { id: laptopSpecsDataInput.colorOptionId } };
  }
  if (laptopSpecsDataInput.brandOptionId !== undefined) {
    laptopSpecsUpdateData.brandOption = laptopSpecsDataInput.brandOptionId === null ? { disconnect: true } : { connect: { id: laptopSpecsDataInput.brandOptionId } };
  }
  if (laptopSpecsDataInput.typeOptionId !== undefined) {
    laptopSpecsUpdateData.typeOption = laptopSpecsDataInput.typeOptionId === null ? { disconnect: true } : { connect: { id: laptopSpecsDataInput.typeOptionId } };
  }
  if (laptopSpecsDataInput.graphicOptionId !== undefined) {
    laptopSpecsUpdateData.graphicOption = laptopSpecsDataInput.graphicOptionId === null ? { disconnect: true } : { connect: { id: laptopSpecsDataInput.graphicOptionId } };
  }
  if (laptopSpecsDataInput.vgaOptionId !== undefined) {
    laptopSpecsUpdateData.vgaOption = laptopSpecsDataInput.vgaOptionId === null ? { disconnect: true } : { connect: { id: laptopSpecsDataInput.vgaOptionId } };
  }
  if (laptopSpecsDataInput.licenseOptionId !== undefined) {
    laptopSpecsUpdateData.licenseOption = laptopSpecsDataInput.licenseOptionId === null ? { disconnect: true } : { connect: { id: laptopSpecsDataInput.licenseOptionId } };
  }

  const updatedAsset = await prisma.asset.update({
    where: { id },
    data: {
      ...assetData,
      laptopSpecs: {
        update: laptopSpecsUpdateData,
      },
    },
    include: {
      laptopSpecs: true,
    },
  });
  return updatedAsset;
}

export async function updateAssetAndPrinterSpecs(
  id: number,
  assetData: Partial<CreateAssetData>,
  printerSpecsDataInput: UpdatePrinterSpecsDataInput
): Promise<Asset> {
  const printerSpecsUpdateData: any = {};

  if (printerSpecsDataInput.typeOptionId !== undefined) {
    printerSpecsUpdateData.typeOption = printerSpecsDataInput.typeOptionId === null ? { disconnect: true } : { connect: { id: printerSpecsDataInput.typeOptionId } };
  }
  if (printerSpecsDataInput.brandOptionId !== undefined) {
    printerSpecsUpdateData.brandOption = printerSpecsDataInput.brandOptionId === null ? { disconnect: true } : { connect: { id: printerSpecsDataInput.brandOptionId } };
  }
  if (printerSpecsDataInput.modelOptionId !== undefined) {
    printerSpecsUpdateData.modelOption = printerSpecsDataInput.modelOptionId === null ? { disconnect: true } : { connect: { id: printerSpecsDataInput.modelOptionId } };
  }

  const updatedAsset = await prisma.asset.update({
    where: { id },
    data: {
      ...assetData,
      printerSpecs: {
        update: printerSpecsUpdateData,
      },
    },
    include: {
      printerSpecs: true,
    },
  });
  return updatedAsset;
}

export async function deleteAsset(id: number): Promise<Asset> {
  // Find the asset first to determine its category
  const asset = await prisma.asset.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!asset) {
    throw new Error("Asset not found");
  }

  // Start a transaction to ensure all or nothing is deleted
  return await prisma.$transaction(async (tx) => {
    // 1. Delete related assignments first
    await tx.assetAssignment.deleteMany({ where: { assetId: id } });

    // 2. Conditionally delete specs based on category
    if (asset.category.slug === "laptop") {
      await tx.laptopSpecs.deleteMany({ where: { assetId: id } });
    } else if (asset.category.slug === "intel-nuc") {
      await tx.intelNucSpecs.deleteMany({ where: { assetId: id } });
    } else if (asset.category.slug === "printer") {
      await tx.printerSpecs.deleteMany({ where: { assetId: id } });
    }

    // 3. Finally, delete the main asset record
    const deletedAsset = await tx.asset.delete({
      where: { id },
    });

    return deletedAsset;
  });
}
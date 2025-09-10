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

interface CreateIntelNucSpecsDataInput {
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

export async function createAssetAndIntelNucSpecs(
  assetData: CreateAssetData,
  intelNucSpecsDataInput: CreateIntelNucSpecsDataInput
): Promise<Asset> {
  const intelNucSpecsCreateData: any = {
    macWlan: intelNucSpecsDataInput.macWlan,
    macLan: intelNucSpecsDataInput.macLan,
  };

  if (intelNucSpecsDataInput.processorOptionId) {
    intelNucSpecsCreateData.processorOption = {
      connect: { id: intelNucSpecsDataInput.processorOptionId },
    };
  }
  if (intelNucSpecsDataInput.ramOptionId) {
    intelNucSpecsCreateData.ramOption = {
      connect: { id: intelNucSpecsDataInput.ramOptionId },
    };
  }
  if (intelNucSpecsDataInput.storageTypeOptionId) {
    intelNucSpecsCreateData.storageTypeOption = {
      connect: { id: intelNucSpecsDataInput.storageTypeOptionId },
    };
  }
  if (intelNucSpecsDataInput.osOptionId) {
    intelNucSpecsCreateData.osOption = {
      connect: { id: intelNucSpecsDataInput.osOptionId },
    };
  }
  if (intelNucSpecsDataInput.portOptionId) {
    intelNucSpecsCreateData.portOption = {
      connect: { id: intelNucSpecsDataInput.portOptionId },
    };
  }
  if (intelNucSpecsDataInput.powerOptionId) {
    intelNucSpecsCreateData.powerOption = {
      connect: { id: intelNucSpecsDataInput.powerOptionId },
    };
  }
  if (intelNucSpecsDataInput.microsoftOfficeOptionId) {
    intelNucSpecsCreateData.microsoftOfficeOption = {
      connect: { id: intelNucSpecsDataInput.microsoftOfficeOptionId },
    };
  }
  if (intelNucSpecsDataInput.colorOptionId) {
    intelNucSpecsCreateData.colorOption = {
      connect: { id: intelNucSpecsDataInput.colorOptionId },
    };
  }
  if (intelNucSpecsDataInput.brandOptionId) {
    intelNucSpecsCreateData.brandOption = {
      connect: { id: intelNucSpecsDataInput.brandOptionId },
    };
  }
  if (intelNucSpecsDataInput.typeOptionId) {
    intelNucSpecsCreateData.typeOption = {
      connect: { id: intelNucSpecsDataInput.typeOptionId },
    };
  }
  if (intelNucSpecsDataInput.graphicOptionId) {
    intelNucSpecsCreateData.graphicOption = {
      connect: { id: intelNucSpecsDataInput.graphicOptionId },
    };
  }
  if (intelNucSpecsDataInput.vgaOptionId) {
    intelNucSpecsCreateData.vgaOption = {
      connect: { id: intelNucSpecsDataInput.vgaOptionId },
    };
  }
  if (intelNucSpecsDataInput.licenseOptionId) {
    intelNucSpecsCreateData.licenseOption = {
      connect: { id: intelNucSpecsDataInput.licenseOptionId },
    };
  }

  const newAsset = await prisma.asset.create({
    data: {
      ...assetData,
      intelNucSpecs: {
        create: intelNucSpecsCreateData,
      },
    },
    include: {
      intelNucSpecs: true,
    },
  });
  return newAsset;
}

interface UpdateIntelNucSpecsDataInput {
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
}

export async function updateAssetAndIntelNucSpecs(
  id: number,
  assetData: Partial<CreateAssetData>,
  intelNucSpecsDataInput: UpdateIntelNucSpecsDataInput
): Promise<Asset> {
  const intelNucSpecsUpdateData: any = {};

  if (intelNucSpecsDataInput.macWlan !== undefined) {
    intelNucSpecsUpdateData.macWlan = intelNucSpecsDataInput.macWlan;
  }
  if (intelNucSpecsDataInput.macLan !== undefined) {
    intelNucSpecsUpdateData.macLan = intelNucSpecsDataInput.macLan;
  }
  // Note: license key is modeled as LicenseKeyOption relation in schema, not free text.

  if (intelNucSpecsDataInput.processorOptionId !== undefined) {
    intelNucSpecsUpdateData.processorOption = intelNucSpecsDataInput.processorOptionId === null ? { disconnect: true } : { connect: { id: intelNucSpecsDataInput.processorOptionId } };
  }
  if (intelNucSpecsDataInput.ramOptionId !== undefined) {
    intelNucSpecsUpdateData.ramOption = intelNucSpecsDataInput.ramOptionId === null ? { disconnect: true } : { connect: { id: intelNucSpecsDataInput.ramOptionId } };
  }
  if (intelNucSpecsDataInput.storageTypeOptionId !== undefined) {
    intelNucSpecsUpdateData.storageTypeOption = intelNucSpecsDataInput.storageTypeOptionId === null ? { disconnect: true } : { connect: { id: intelNucSpecsDataInput.storageTypeOptionId } };
  }
  if (intelNucSpecsDataInput.osOptionId !== undefined) {
    intelNucSpecsUpdateData.osOption = intelNucSpecsDataInput.osOptionId === null ? { disconnect: true } : { connect: { id: intelNucSpecsDataInput.osOptionId } };
  }
  if (intelNucSpecsDataInput.portOptionId !== undefined) {
    intelNucSpecsUpdateData.portOption = intelNucSpecsDataInput.portOptionId === null ? { disconnect: true } : { connect: { id: intelNucSpecsDataInput.portOptionId } };
  }
  if (intelNucSpecsDataInput.powerOptionId !== undefined) {
    intelNucSpecsUpdateData.powerOption = intelNucSpecsDataInput.powerOptionId === null ? { disconnect: true } : { connect: { id: intelNucSpecsDataInput.powerOptionId } };
  }
  if (intelNucSpecsDataInput.microsoftOfficeOptionId !== undefined) {
    intelNucSpecsUpdateData.microsoftOfficeOption = intelNucSpecsDataInput.microsoftOfficeOptionId === null ? { disconnect: true } : { connect: { id: intelNucSpecsDataInput.microsoftOfficeOptionId } };
  }
  if (intelNucSpecsDataInput.colorOptionId !== undefined) {
    intelNucSpecsUpdateData.colorOption = intelNucSpecsDataInput.colorOptionId === null ? { disconnect: true } : { connect: { id: intelNucSpecsDataInput.colorOptionId } };
  }
  if (intelNucSpecsDataInput.brandOptionId !== undefined) {
    intelNucSpecsUpdateData.brandOption = intelNucSpecsDataInput.brandOptionId === null ? { disconnect: true } : { connect: { id: intelNucSpecsDataInput.brandOptionId } };
  }
  if (intelNucSpecsDataInput.typeOptionId !== undefined) {
    intelNucSpecsUpdateData.typeOption = intelNucSpecsDataInput.typeOptionId === null ? { disconnect: true } : { connect: { id: intelNucSpecsDataInput.typeOptionId } };
  }
  if (intelNucSpecsDataInput.graphicOptionId !== undefined) {
    intelNucSpecsUpdateData.graphicOption = intelNucSpecsDataInput.graphicOptionId === null ? { disconnect: true } : { connect: { id: intelNucSpecsDataInput.graphicOptionId } };
  }
  if (intelNucSpecsDataInput.vgaOptionId !== undefined) {
    intelNucSpecsUpdateData.vgaOption = intelNucSpecsDataInput.vgaOptionId === null ? { disconnect: true } : { connect: { id: intelNucSpecsDataInput.vgaOptionId } };
  }
  if (intelNucSpecsDataInput.licenseOptionId !== undefined) {
    intelNucSpecsUpdateData.licenseOption = intelNucSpecsDataInput.licenseOptionId === null ? { disconnect: true } : { connect: { id: intelNucSpecsDataInput.licenseOptionId } };
  }

  const updatedAsset = await prisma.asset.update({
    where: { id },
    data: {
      ...assetData,
      intelNucSpecs: {
        update: intelNucSpecsUpdateData,
      },
    },
    include: {
      intelNucSpecs: true,
    },
  });
  return updatedAsset;
}

export async function getIntelNucAssetById(id: number): Promise<Asset | null> {
  const asset = await prisma.asset.findUnique({
    where: { id },
    include: {
      category: true,
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
    },
  });

  if (!asset) return null;

  return {
    ...asset,
  };
}

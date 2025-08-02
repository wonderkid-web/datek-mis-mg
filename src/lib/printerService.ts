"use server";

import { prisma } from "./prisma";
import { Asset, PrinterSpecs } from "@prisma/client";

export const createAssetAndPrinterSpecs = async (
  assetData: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'categoryId'> & { categoryId: number },
  printerSpecsData: Omit<PrinterSpecs, 'assetId'>
) => {
  return await prisma.$transaction(async (tx) => {
    const asset = await tx.asset.create({
      data: assetData,
    });

    const printerSpecs = await tx.printerSpecs.create({
      data: {
        ...printerSpecsData,
        assetId: asset.id,
      },
    });

    return { asset, printerSpecs };
  });
};

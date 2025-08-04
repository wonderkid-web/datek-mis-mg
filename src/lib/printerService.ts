"use server";

import { prisma } from "./prisma";
import { Asset, PrinterSpecs } from "./types";


export const createAssetAndPrinterSpecs = async (
  assetData: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'categoryId' | 'category' | 'laptopSpecs' | 'intelNucSpecs' | 'printerSpecs'> & { categoryId: number },
  printerSpecsData: Omit<PrinterSpecs, 'assetId'>
) => {
  return await prisma.$transaction(async (tx) => {
    const asset = await tx.asset.create({

      data: assetData,
    });

    const printerSpecs = await tx.printerSpecs.create({
      // @ts-expect-error its okay to use spread here
      data: {
        ...printerSpecsData,
        assetId: asset.id,
      },
    });

    return { asset, printerSpecs };
  });
};

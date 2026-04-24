"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "./prisma";
import { Asset, PrinterSpecs } from "./types";
import { getOrCreateAssetCategoryId } from "@/lib/assetCategoryResolver";
import { getUserFacingAssetError } from "@/lib/errorMessage";


export const createAssetAndPrinterSpecs = async (
  assetData: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'categoryId' | 'category' | 'laptopSpecs' | 'intelNucSpecs' | 'printerSpecs'> & { categoryId: number },
  printerSpecsData: Omit<PrinterSpecs, 'assetId'>
) => {
  const categoryId = await getOrCreateAssetCategoryId("printer");

  try {
    return await prisma.$transaction(async (tx) => {
      const asset = await tx.asset.create({
        // @ts-expect-error its okay
        data: {
          ...assetData,
          categoryId,
        },
      });

      const printerSpecs = await tx.printerSpecs.create({
        // @ts-expect-error its okay to use spread here
        data: {
          ...printerSpecsData,
          assetId: asset.id,
        },
      });

      revalidatePath("/data-center/assets");
      revalidatePath("/data-center/assigned-assets");
      revalidateTag("asset-assignments_printer");

      return { asset, printerSpecs };
    });
  } catch (error) {
    console.error("Failed to create printer asset:", error);
    throw new Error(
      getUserFacingAssetError(error, "Gagal menambahkan asset printer.")
    );
  }
};

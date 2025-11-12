"use server";


import { prisma } from "./prisma";
import { Asset, CctvSpecs } from "./types";
import { revalidatePath } from "next/cache";

export const createAssetAndCctvSpecs = async (
  assetData: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'categoryId' | 'category' | 'laptopSpecs' | 'intelNucSpecs' | 'printerSpecs' | 'cctvSpecs'> & { categoryId: number },
  cctvSpecsData: Omit<CctvSpecs, 'id' | 'assetId' | 'nameSite' | 'brand' | 'model' | 'deviceType' | 'channelCamera'>
) => {
  const result = await prisma.$transaction(async (tx) => {

    const asset = await tx.asset.create({
      data: assetData,
    });

    const cctvSpecs = await tx.cctvSpecs.create({
      data: {
        ...cctvSpecsData,
        assetId: asset.id,
      },
    });

    return { asset, cctvSpecs };
  });

  revalidatePath("/items/cctv");
  return result;
};

export const getCctvSpecs = async () => {
  // const res = await fetch("/api/assets/cctv", { cache: "no-store" });
  // return res.json();
  return await prisma.asset.findMany({
    where: {
      category: {
        slug: "cctv",
      },
    },
    select: {
      id: true,
      namaAsset: true,
      statusAsset: true,
      cctvSpecs: {
        select: {
          ipAddress: true,
          brand: {
            select: {
              value: true,
            },
          },
          model: {
            select: {
              value: true,
            },
          },
          channelCamera: {
            select: {
              sbu: true,
              lokasi: true,
            },
          },
        },
      },
    },
  });
};

export const getCctvSpecById = async (id: number) => {
  return await prisma.asset.findUnique({
    where: { id },
    include: {
      cctvSpecs: {
        include: {
          brand: true,
          model: true,
          deviceType: true,
          channelCamera: true,
        },
      },
      category: true,
      assignments: {
        include: {
          user: true,
        },
      },
    },
  });
};

export const updateCctvSpec = async (id: number, data: Partial<CctvSpecs>) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { assetId, ...updateData } = data;
  const result = await prisma.cctvSpecs.update({
    where: { assetId: id },
    // @ts-expect-error its okay
    data: updateData,
  });
  // revalidatePath("/items/cctv");
  return result;
};

export const updateAssetAndCctvSpecs = async (
  id: number,
  assetData: Partial<Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>>,
  cctvSpecsData: Partial<Omit<CctvSpecs, 'id' | 'assetId' | 'nameSite'>>
) => {
  const result = await prisma.$transaction(async (tx) => {
    // 1. Update the Asset
    await tx.asset.update({
      where: { id },
      // @ts-expect-error its okay
      data: assetData,
    });

    // 2. Update the CctvSpecs
    if (Object.keys(cctvSpecsData).length > 0) {
      await tx.cctvSpecs.update({
        where: { assetId: id },
        // @ts-expect-error its okay
        data: cctvSpecsData,
      });
    }

    // 3. Return the fully updated asset
    return await tx.asset.findUnique({
      where: { id },
      include: {
        cctvSpecs: {
          include: {
            brand: true,
            model: true,
            deviceType: true,
            channelCamera: true,
          },
        },
        category: true,
        assignments: {
          include: {
            user: true,
          },
        },
      },
    });
  });

  // revalidatePath("/items/cctv");
  return result;
};


export const deleteCctvSpec = async (id: number) => {
  const result = await prisma.asset.delete({
    where: { id },
  });
  revalidatePath("/items/cctv");
  return result;
};

export const getCctvSpecByChannelCameraId = async (channelCameraId: number) => {
  return await prisma.cctvSpecs.findUnique({
    where: { channelCameraId },
    include: {
      asset: true,
      brand: true,
      model: true,
      deviceType: true,
    },
  });
};


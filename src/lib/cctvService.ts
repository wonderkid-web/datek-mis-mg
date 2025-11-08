"use server";

import { prisma } from "./prisma";
import { Asset, CctvSpecs } from "./types";

export const createAssetAndCctvSpecs = async (
  assetData: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'categoryId' | 'category' | 'laptopSpecs' | 'intelNucSpecs' | 'printerSpecs' | 'cctvSpecs'> & { categoryId: number },
  cctvSpecsData: Omit<CctvSpecs, 'id' | 'assetId' | 'brand' | 'model' | 'deviceType' | 'channelCamera'>
) => {
  return await prisma.$transaction(async (tx) => {
    const asset = await tx.asset.create({
      data: assetData,
    });

    const cctvSpecs = await tx.cctvSpecs.create({
      // @ts-expect-error its okay
      data: {
        ...cctvSpecsData,
        assetId: asset.id,
      },
    });

    return { asset, cctvSpecs };
  });
};

export const getCctvSpecs = async () => {
  return await prisma.asset.findMany({
    where: {
      category: {
        slug: "cctv",
      },
    },
    select: {
      id: true,
      namaAsset: true,
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
  return await prisma.cctvSpecs.update({
    where: { assetId: id },
    // @ts-expect-error its okay
    data: updateData,
  });
};

export const updateAssetAndCctvSpecs = async (
  id: number,
  assetData: Partial<Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>>,
  cctvSpecsData: Partial<Omit<CctvSpecs, 'id' | 'assetId'>>
) => {
  return await prisma.$transaction(async (tx) => {
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
};


export const deleteCctvSpec = async (id: number) => {
  return await prisma.asset.delete({
    where: { id },
  });
};

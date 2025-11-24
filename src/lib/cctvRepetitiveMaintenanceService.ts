"use server";

import { CCTVStatus } from "@prisma/client";
import { prisma } from "./prisma";

export const createCctvRepetitiveMaintenance = async (data: {
  periode: Date;
  perusahaan: string;
  channelCameraId: number;
  status: CCTVStatus;
  remarks?: string;
  assetId: number;
}) => {
  const { assetId, status, ...maintenanceData } = data;

  return await prisma.$transaction(async (tx) => {
    // 1. Create the maintenance record
    const maintenanceRecord = await tx.cctvRepetitiveMaintenance.create({
      data: {
        ...maintenanceData,
        status: status,
      },
    });

    // 2. Update the parent asset's status
    await tx.asset.update({
      where: { id: assetId },
      data: { statusAsset: status },
    });

    return maintenanceRecord;
  });
};

export const deleteCctvRepetitiveMaintenance = async (id: number) => {
  return await prisma.cctvRepetitiveMaintenance.delete({
    where: { id },
  });
};

export const updateCctvRepetitiveMaintenance = async (
  id: number,
  data: {
    periode?: Date;
    status?: CCTVStatus;
    remarks?: string;
    assetId?: number;
  }
) => {
  const { assetId, ...maintenanceData } = data;

  return await prisma.$transaction(async (tx) => {
    // 1. Update the maintenance record
    const updatedRecord = await tx.cctvRepetitiveMaintenance.update({
      where: { id },
      data: maintenanceData,
    });

    // 2. If status and assetId are provided, update the parent asset's status
    if (data.status && assetId) {
      await tx.asset.update({
        where: { id: assetId },
        data: { statusAsset: data.status },
      });
    }

    return updatedRecord;
  });
};

export const getCctvRepetitiveMaintenances = async () => {
  return await prisma.cctvRepetitiveMaintenance.findMany({
    include: {
      channelCamera: {
        include: {
          cctvSpecs: {
            include: {
              brand: true,
              model: true,
              deviceType: true,
              asset: true,
              channelCamera:{
                select:{
                  lokasi:true
                }
              }
            },
          },
        },
      },
    },
    orderBy: {
      periode: "desc",
    },
  });
};

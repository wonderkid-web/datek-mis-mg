"use server";
import { prisma } from './prisma';
import { CctvChannelCamera } from '@prisma/client';

export const getCctvChannelCameras = async (): Promise<CctvChannelCamera[]> => {
  return await prisma.cctvChannelCamera.findMany({
    orderBy: {
      lokasi: 'asc'
    }
  });
};

export const createCctvChannelCamera = async (data: { lokasi: string, sbu: string }): Promise<CctvChannelCamera> => {
  return await prisma.cctvChannelCamera.create({
    data,
  });
};

export const updateCctvChannelCamera = async (id: number, data: { lokasi: string, sbu: string }): Promise<CctvChannelCamera> => {
  return await prisma.cctvChannelCamera.update({
    where: { id },
    data,
  });
};

export const deleteCctvChannelCamera = async (id: number): Promise<void> => {
  await prisma.cctvChannelCamera.delete({
    where: { id },
  });
};
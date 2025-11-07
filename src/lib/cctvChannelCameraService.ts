"use server"

import { ALL_LOCATIONS } from './constants';
import { prisma } from './prisma';
import { Sbu } from '@prisma/client';

export const getCctvChannelCameras = async () => {
  return await prisma.cctvChannelCamera.findMany();
};

export const getCctvChannelCameraById = async (id: number) => {
  return await prisma.cctvChannelCamera.findUnique({
    where: { id },
  });
};

interface ChannelCameraData {
  lokasi: string;
  sbu: typeof ALL_LOCATIONS[number];
}

export const createCctvChannelCamera = async (data: ChannelCameraData) => {
  return await prisma.cctvChannelCamera.create({
    data,
  });
};

export const updateCctvChannelCamera = async (id: number, data: Partial<ChannelCameraData>) => {
  return await prisma.cctvChannelCamera.update({
    where: { id },
    data,
  });
};

export const deleteCctvChannelCamera = async (id: number) => {
  return await prisma.cctvChannelCamera.delete({
    where: { id },
  });
};

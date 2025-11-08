"use server";
import { prisma } from './prisma';
import { CctvDeviceType } from '@prisma/client';

export const getCctvDeviceTypes = async (): Promise<CctvDeviceType[]> => {
  return await prisma.cctvDeviceType.findMany({
    orderBy: {
      value: 'asc'
    }
  });
};

export const createCctvDeviceType = async (data: { value: string }): Promise<CctvDeviceType> => {
  return await prisma.cctvDeviceType.create({
    data: {
      value: data.value,
    },
  });
};

export const updateCctvDeviceType = async (id: number, data: { value: string }): Promise<CctvDeviceType> => {
  return await prisma.cctvDeviceType.update({
    where: { id },
    data: {
      value: data.value,
    },
  });
};

export const deleteCctvDeviceType = async (id: number): Promise<void> => {
  await prisma.cctvDeviceType.delete({
    where: { id },
  });
};
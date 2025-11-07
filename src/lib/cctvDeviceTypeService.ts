
"use server"
import { prisma } from './prisma';

export const getCctvDeviceTypes = async () => {
  return await prisma.cctvDeviceType.findMany();
};

export const getCctvDeviceTypeById = async (id: number) => {
  return await prisma.cctvDeviceType.findUnique({
    where: { id },
  });
};

export const createCctvDeviceType = async (data: { value: string }) => {
  return await prisma.cctvDeviceType.create({
    data,
  });
};

export const updateCctvDeviceType = async (id: number, data: { value: string }) => {
  return await prisma.cctvDeviceType.update({
    where: { id },
    data,
  });
};

export const deleteCctvDeviceType = async (id: number) => {
  return await prisma.cctvDeviceType.delete({
    where: { id },
  });
};

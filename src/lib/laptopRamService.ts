"use server";
import { prisma } from './prisma';
import { LaptopRamOption } from '@prisma/client';

export const getLaptopRamOptions = async (): Promise<LaptopRamOption[]> => {
  return await prisma.laptopRamOption.findMany({
    orderBy: {
      value: 'asc'
    }
  });
};

export const createLaptopRamOption = async (data: { value: string }): Promise<LaptopRamOption> => {
  return await prisma.laptopRamOption.create({
    data: {
      value: data.value,
    },
  });
};

export const updateLaptopRamOption = async (id: number, data: { value: string }): Promise<LaptopRamOption> => {
  return await prisma.laptopRamOption.update({
    where: { id },
    data: {
      value: data.value,
    },
  });
};

export const deleteLaptopRamOption = async (id: number): Promise<void> => {
  await prisma.laptopRamOption.delete({
    where: { id },
  });
};
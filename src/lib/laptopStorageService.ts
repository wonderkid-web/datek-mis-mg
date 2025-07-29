"use server";
import { prisma } from './prisma';
import { LaptopStorageTypeOption } from '@prisma/client';

export const getLaptopStorageOptions = async (): Promise<LaptopStorageTypeOption[]> => {
  return await prisma.laptopStorageTypeOption.findMany({
    orderBy: {
      value: 'asc'
    }
  });
};

export const createLaptopStorageOption = async (data: { value: string }): Promise<LaptopStorageTypeOption> => {
  return await prisma.laptopStorageTypeOption.create({
    data: {
      value: data.value,
    },
  });
};

export const updateLaptopStorageOption = async (id: number, data: { value: string }): Promise<LaptopStorageTypeOption> => {
  return await prisma.laptopStorageTypeOption.update({
    where: { id },
    data: {
      value: data.value,
    },
  });
};

export const deleteLaptopStorageOption = async (id: number): Promise<void> => {
  await prisma.laptopStorageTypeOption.delete({
    where: { id },
  });
};
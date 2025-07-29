"use server";
import { prisma } from './prisma';
import { LaptopOsOption } from '@prisma/client';

export const getLaptopOsOptions = async (): Promise<LaptopOsOption[]> => {
  return await prisma.laptopOsOption.findMany({
    orderBy: {
      value: 'asc'
    }
  });
};

export const createLaptopOsOption = async (data: { value: string }): Promise<LaptopOsOption> => {
  return await prisma.laptopOsOption.create({
    data: {
      value: data.value,
    },
  });
};

export const updateLaptopOsOption = async (id: number, data: { value: string }): Promise<LaptopOsOption> => {
  return await prisma.laptopOsOption.update({
    where: { id },
    data: {
      value: data.value,
    },
  });
};

export const deleteLaptopOsOption = async (id: number): Promise<void> => {
  await prisma.laptopOsOption.delete({
    where: { id },
  });
};
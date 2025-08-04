// @ts-nocheck
"use server";
import { prisma } from './prisma';
import { LaptopPortOption } from '@prisma/client';

export const getLaptopPortOptions = async (): Promise<LaptopPortOption[]> => {
  return await prisma.laptopPortOption.findMany({
    orderBy: {
      value: 'asc'
    }
  });
};

export const createLaptopPortOption = async (data: { value: string }): Promise<LaptopPortOption> => {
  return await prisma.laptopPortOption.create({
    data: {
      value: data.value,
    },
  });
};

export const updateLaptopPortOption = async (id: number, data: { value: string }): Promise<LaptopPortOption> => {
  return await prisma.laptopPortOption.update({
    where: { id },
    data: {
      value: data.value,
    },
  });
};

export const deleteLaptopPortOption = async (id: number): Promise<void> => {
  await prisma.laptopPortOption.delete({
    where: { id },
  });
};
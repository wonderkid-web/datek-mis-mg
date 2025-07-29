"use server";
import { prisma } from './prisma';
import { LaptopColorOption } from '@prisma/client';

export const getLaptopColors = async (): Promise<LaptopColorOption[]> => {
  return await prisma.laptopColorOption.findMany({
    orderBy: {
      value: 'asc'
    }
  });
};

export const createLaptopColor = async (data: { value: string }): Promise<LaptopColorOption> => {
  return await prisma.laptopColorOption.create({
    data: {
      value: data.value,
    },
  });
};

export const updateLaptopColor = async (id: number, data: { value: string }): Promise<LaptopColorOption> => {
  return await prisma.laptopColorOption.update({
    where: { id },
    data: {
      value: data.value,
    },
  });
};

export const deleteLaptopColor = async (id: number): Promise<void> => {
  await prisma.laptopColorOption.delete({
    where: { id },
  });
};

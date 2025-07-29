"use server";
import { prisma } from './prisma';
import { LaptopTypeOption } from '@prisma/client';

export const getLaptopTypeOptions = async (): Promise<LaptopTypeOption[]> => {
  return await prisma.laptopTypeOption.findMany({
    orderBy: {
      value: 'asc'
    }
  });
};

export const createLaptopTypeOption = async (data: { value: string }): Promise<LaptopTypeOption> => {
  return await prisma.laptopTypeOption.create({
    data: {
      value: data.value,
    },
  });
};

export const updateLaptopTypeOption = async (id: number, data: { value: string }): Promise<LaptopTypeOption> => {
  return await prisma.laptopTypeOption.update({
    where: { id },
    data: {
      value: data.value,
    },
  });
};

export const deleteLaptopTypeOption = async (id: number): Promise<void> => {
  await prisma.laptopTypeOption.delete({
    where: { id },
  });
};
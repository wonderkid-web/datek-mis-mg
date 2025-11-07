"use server";
import { prisma } from './prisma';
import { LaptopBrandOption } from '@prisma/client';

export const getLaptopBrandOptions = async (): Promise<LaptopBrandOption[]> => {
  
  return await prisma.laptopBrandOption.findMany({
    orderBy: {
      id: 'asc'
    }
  });
};

export const createLaptopBrandOption = async (data: { value: string }): Promise<LaptopBrandOption> => {
  return await prisma.laptopBrandOption.create({
    data: {
      value: data.value,
    },
  });
};

export const updateLaptopBrandOption = async (id: number, data: { value: string }): Promise<LaptopBrandOption> => {
  return await prisma.laptopBrandOption.update({
    where: { id },
    data: {
      value: data.value,
    },
  });
};

export const deleteLaptopBrandOption = async (id: number): Promise<void> => {
  await prisma.laptopBrandOption.delete({
    where: { id },
  });
};
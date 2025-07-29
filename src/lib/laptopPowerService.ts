"use server";
import { prisma } from './prisma';
import { LaptopPowerOption } from '@prisma/client';

export const getLaptopPowerOptions = async (): Promise<LaptopPowerOption[]> => {
  return await prisma.laptopPowerOption.findMany({
    orderBy: {
      value: 'asc'
    }
  });
};

export const createLaptopPowerOption = async (data: { value: string }): Promise<LaptopPowerOption> => {
  return await prisma.laptopPowerOption.create({
    data: {
      value: data.value,
    },
  });
};

export const updateLaptopPowerOption = async (id: number, data: { value: string }): Promise<LaptopPowerOption> => {
  return await prisma.laptopPowerOption.update({
    where: { id },
    data: {
      value: data.value,
    },
  });
};

export const deleteLaptopPowerOption = async (id: number): Promise<void> => {
  await prisma.laptopPowerOption.delete({
    where: { id },
  });
};
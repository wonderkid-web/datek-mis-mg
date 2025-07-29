"use server";
import { prisma } from './prisma';
import { LaptopProcessorOption } from '@prisma/client';

export const getLaptopProcessorOptions = async (): Promise<LaptopProcessorOption[]> => {
  return await prisma.laptopProcessorOption.findMany({
    orderBy: {
      value: 'asc'
    }
  });
};

export const createLaptopProcessorOption = async (data: { value: string }): Promise<LaptopProcessorOption> => {
  return await prisma.laptopProcessorOption.create({
    data: {
      value: data.value,
    },
  });
};

export const updateLaptopProcessorOption = async (id: number, data: { value: string }): Promise<LaptopProcessorOption> => {
  return await prisma.laptopProcessorOption.update({
    where: { id },
    data: {
      value: data.value,
    },
  });
};

export const deleteLaptopProcessorOption = async (id: number): Promise<void> => {
  await prisma.laptopProcessorOption.delete({
    where: { id },
  });
};
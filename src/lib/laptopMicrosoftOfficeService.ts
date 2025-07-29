"use server";
import { prisma } from './prisma';
import { LaptopMicrosoftOfficeOption } from '@prisma/client';

export const getLaptopMicrosoftOffices = async (): Promise<LaptopMicrosoftOfficeOption[]> => {
  return await prisma.laptopMicrosoftOfficeOption.findMany({
    orderBy: {
      value: 'asc'
    }
  });
};

export const createLaptopMicrosoftOffice = async (data: { value: string }): Promise<LaptopMicrosoftOfficeOption> => {
  return await prisma.laptopMicrosoftOfficeOption.create({
    data: {
      value: data.value,
    },
  });
};

export const updateLaptopMicrosoftOffice = async (id: number, data: { value: string }): Promise<LaptopMicrosoftOfficeOption> => {
  return await prisma.laptopMicrosoftOfficeOption.update({
    where: { id },
    data: {
      value: data.value,
    },
  });
};

export const deleteLaptopMicrosoftOffice = async (id: number): Promise<void> => {
  await prisma.laptopMicrosoftOfficeOption.delete({
    where: { id },
  });
};
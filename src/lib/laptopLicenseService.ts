// @ts-nocheck
"use server";
import { prisma } from './prisma';
import { LaptopLicenseOption } from '@prisma/client';

export const getLaptopLicenseOptions = async (): Promise<LaptopLicenseOption[]> => {
  return await prisma.laptopLicenseOption.findMany();
};

export const createLaptopLicenseOption = async (data: { value: string }): Promise<LaptopLicenseOption> => {
  return await prisma.laptopLicenseOption.create({
    data: { value: data.value },
  });
};

export const updateLaptopLicenseOption = async (id: string, data: { value: string }): Promise<LaptopLicenseOption> => {
  return await prisma.laptopLicenseOption.update({
    where: { id },
    data: { value: data.value },
  });
};

export const deleteLaptopLicenseOption = async (id: string): Promise<LaptopLicenseOption> => {
  return await prisma.laptopLicenseOption.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  });
};

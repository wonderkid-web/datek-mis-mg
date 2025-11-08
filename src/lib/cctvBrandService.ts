"use server";
import { prisma } from './prisma';
import { CctvBrand } from '@prisma/client';

export const getCctvBrands = async (): Promise<CctvBrand[]> => {
  return await prisma.cctvBrand.findMany({
    orderBy: {
      value: 'asc'
    }
  });
};

export const createCctvBrand = async (data: { value: string }): Promise<CctvBrand> => {
  return await prisma.cctvBrand.create({
    data: {
      value: data.value,
    },
  });
};

export const updateCctvBrand = async (id: number, data: { value: string }): Promise<CctvBrand> => {
  return await prisma.cctvBrand.update({
    where: { id },
    data: {
      value: data.value,
    },
  });
};

export const deleteCctvBrand = async (id: number): Promise<void> => {
  await prisma.cctvBrand.delete({
    where: { id },
  });
};
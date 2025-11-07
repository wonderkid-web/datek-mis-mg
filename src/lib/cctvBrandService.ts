"use server"
import { prisma } from './prisma';

export const getCctvBrands = async () => {
  return await prisma.cctvBrand.findMany({
    orderBy: {
      id: 'asc'
    }
  });
};

export const getCctvBrandById = async (id: number) => {
  return await prisma.cctvBrand.findUnique({
    where: { id },
  });
};

export const createCctvBrand = async (data: { value: string }) => {
  return await prisma.cctvBrand.create({
    data,
  });
};

export const updateCctvBrand = async (id: number, data: { value: string }) => {
  return await prisma.cctvBrand.update({
    where: { id },
    data,
  });
};

export const deleteCctvBrand = async (id: number) => {
  return await prisma.cctvBrand.delete({
    where: { id },
  });
};

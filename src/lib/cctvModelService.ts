"use server";
import { prisma } from './prisma';
import { CctvModel } from '@prisma/client';

export const getCctvModels = async (): Promise<CctvModel[]> => {
  return await prisma.cctvModel.findMany({
    orderBy: {
      value: 'asc'
    }
  });
};

export const createCctvModel = async (data: { value: string }): Promise<CctvModel> => {
  return await prisma.cctvModel.create({
    data: {
      value: data.value,
    },
  });
};

export const updateCctvModel = async (id: number, data: { value: string }): Promise<CctvModel> => {
  return await prisma.cctvModel.update({
    where: { id },
    data: {
      value: data.value,
    },
  });
};

export const deleteCctvModel = async (id: number): Promise<void> => {
  await prisma.cctvModel.delete({
    where: { id },
  });
};
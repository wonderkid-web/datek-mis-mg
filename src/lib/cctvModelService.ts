"use server"
import { prisma } from './prisma';

export const getCctvModels = async () => {
  return await prisma.cctvModel.findMany();
};

export const getCctvModelById = async (id: number) => {
  return await prisma.cctvModel.findUnique({
    where: { id },
  });
};

export const createCctvModel = async (data: { value: string }) => {
  return await prisma.cctvModel.create({
    data,
  });
};

export const updateCctvModel = async (id: number, data: { value: string }) => {
  return await prisma.cctvModel.update({
    where: { id },
    data,
  });
};

export const deleteCctvModel = async (id: number) => {
  return await prisma.cctvModel.delete({
    where: { id },
  });
};

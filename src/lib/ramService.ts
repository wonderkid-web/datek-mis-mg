import { prisma } from './prisma';
import { MasterDataItem } from './types';

// GET all RAM options
export const getRams = async (): Promise<MasterDataItem[]> => {
  const ramOptions = await prisma.laptopRamOption.findMany({
    orderBy: {
      value: 'asc'
    }
  });
  return ramOptions
};

// CREATE RAM option
export const createRam = async (data: { name: string }): Promise<MasterDataItem> => {
  const newRamOption = await prisma.laptopRamOption.create({
    data: {
      value: data.name,
    },
  });
  return newRamOption;
};

// UPDATE RAM option
export const updateRam = async (id: number, data: { name: string }): Promise<MasterDataItem> => {
  const updatedRamOption = await prisma.laptopRamOption.update({
    where: { id },
    data: {
      value: data.name,
    },
  });
  return updatedRamOption
};

// DELETE RAM option
export const deleteRam = async (id: number): Promise<void> => {
  await prisma.laptopRamOption.delete({
    where: { id },
  });
};

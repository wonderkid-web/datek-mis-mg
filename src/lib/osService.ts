import { prisma } from './prisma';
import { LaptopOsOption } from '@prisma/client';
import { MasterDataItem } from './types';

const mapToMasterDataItem = (osOption: LaptopOsOption): MasterDataItem => ({
  id: osOption.id,
  name: osOption.value,
  createdAt: osOption.createdAt,
  updatedAt: osOption.updatedAt,
});

export const getOs = async (): Promise<MasterDataItem[]> => {
  const osOptions = await prisma.laptopOsOption.findMany({
    orderBy: {
      value: 'asc'
    }
  });
  return osOptions.map(mapToMasterDataItem);
};

export const createOs = async (data: { name: string }): Promise<MasterDataItem> => {
  const newOsOption = await prisma.laptopOsOption.create({
    data: {
      value: data.name,
    },
  });
  return mapToMasterDataItem(newOsOption);
};

export const updateOs = async (id: number, data: { name: string }): Promise<MasterDataItem> => {
  const updatedOsOption = await prisma.laptopOsOption.update({
    where: { id },
    data: {
      value: data.name,
    },
  });
  return mapToMasterDataItem(updatedOsOption);
};

export const deleteOs = async (id: number): Promise<void> => {
  await prisma.laptopOsOption.delete({
    where: { id },
  });
};

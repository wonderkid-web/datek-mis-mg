import { prisma } from './prisma';
import { LaptopPortOption } from '@prisma/client';
import { MasterDataItem } from './types';

const mapToMasterDataItem = (portOption: LaptopPortOption): MasterDataItem => ({
  id: portOption.id,
  name: portOption.value,
  createdAt: portOption.createdAt,
  updatedAt: portOption.updatedAt,
});

export const getPorts = async (): Promise<MasterDataItem[]> => {
  const portOptions = await prisma.laptopPortOption.findMany({
    orderBy: {
      value: 'asc'
    }
  });
  return portOptions.map(mapToMasterDataItem);
};

export const createPort = async (data: { name: string }): Promise<MasterDataItem> => {
  const newPortOption = await prisma.laptopPortOption.create({
    data: {
      value: data.name,
    },
  });
  return mapToMasterDataItem(newPortOption);
};

export const updatePort = async (id: number, data: { name: string }): Promise<MasterDataItem> => {
  const updatedPortOption = await prisma.laptopPortOption.update({
    where: { id },
    data: {
      value: data.name,
    },
  });
  return mapToMasterDataItem(updatedPortOption);
};

export const deletePort = async (id: number): Promise<void> => {
  await prisma.laptopPortOption.delete({
    where: { id },
  });
};

import { prisma } from './prisma';
import { LaptopVgaOption } from '@prisma/client';
import { MasterDataItem } from './types';

const mapToMasterDataItem = (vgaOption: LaptopVgaOption): MasterDataItem => ({
  id: vgaOption.id.toString(),
  name: vgaOption.value,
  createdAt: vgaOption.createdAt,
  updatedAt: vgaOption.updatedAt,
});

export const getVgas = async (): Promise<MasterDataItem[]> => {
  const vgaOptions = await prisma.laptopVgaOption.findMany({
    orderBy: {
      value: 'asc'
    }
  });
  return vgaOptions.map(mapToMasterDataItem);
};

export const createVga = async (data: { name: string }): Promise<MasterDataItem> => {
  const newVgaOption = await prisma.laptopVgaOption.create({
    data: {
      value: data.name,
    },
  });
  return mapToMasterDataItem(newVgaOption);
};

export const updateVga = async (id: number, data: { name: string }): Promise<MasterDataItem> => {
  const updatedVgaOption = await prisma.laptopVgaOption.update({
    where: { id },
    data: {
      value: data.name,
    },
  });
  return mapToMasterDataItem(updatedVgaOption);
};

export const deleteVga = async (id: number): Promise<void> => {
  await prisma.laptopVgaOption.delete({
    where: { id },
  });
};

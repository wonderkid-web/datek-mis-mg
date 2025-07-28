import { prisma } from './prisma';
import { LaptopColorOption } from '@prisma/client';
import { MasterDataItem } from './types';

const mapToMasterDataItem = (colorOption: LaptopColorOption): MasterDataItem => ({
  id: colorOption.id.toString(),
  name: colorOption.value,
});

export const getColors = async (): Promise<MasterDataItem[]> => {
  const colorOptions = await prisma.laptopColorOption.findMany({
    orderBy: {
      value: 'asc'
    }
  });
  return colorOptions.map(mapToMasterDataItem);
};

export const createColor = async (data: { name: string }): Promise<MasterDataItem> => {
  const newColorOption = await prisma.laptopColorOption.create({
    data: {
      value: data.name,
    },
  });
  return mapToMasterDataItem(newColorOption);
};

export const updateColor = async (id: number, data: { name: string }): Promise<MasterDataItem> => {
  const updatedColorOption = await prisma.laptopColorOption.update({
    where: { id },
    data: {
      value: data.name,
    },
  });
  return mapToMasterDataItem(updatedColorOption);
};

export const deleteColor = async (id: number): Promise<void> => {
  await prisma.laptopColorOption.delete({
    where: { id },
  });
};

import { prisma } from './prisma';
import { LaptopScreenSizeOption } from '@prisma/client';
import { MasterDataItem } from './types';

const mapToMasterDataItem = (screenSizeOption: LaptopScreenSizeOption): MasterDataItem => ({
  id: screenSizeOption.id.toString(),
  name: screenSizeOption.value,
  createdAt: screenSizeOption.createdAt,
  updatedAt: screenSizeOption.updatedAt,
});

export const getScreenSizes = async (): Promise<MasterDataItem[]> => {
  const screenSizeOptions = await prisma.laptopScreenSizeOption.findMany({
    orderBy: {
      value: 'asc'
    }
  });
  return screenSizeOptions.map(mapToMasterDataItem);
};

export const createScreenSize = async (data: { name: string }): Promise<MasterDataItem> => {
  const newScreenSizeOption = await prisma.laptopScreenSizeOption.create({
    data: {
      value: data.name,
    },
  });
  return mapToMasterDataItem(newScreenSizeOption);
};

export const updateScreenSize = async (id: number, data: { name: string }): Promise<MasterDataItem> => {
  const updatedScreenSizeOption = await prisma.laptopScreenSizeOption.update({
    where: { id },
    data: {
      value: data.name,
    },
  });
  return mapToMasterDataItem(updatedScreenSizeOption);
};

export const deleteScreenSize = async (id: number): Promise<void> => {
  await prisma.laptopScreenSizeOption.delete({
    where: { id },
  });
};

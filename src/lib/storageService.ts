import { prisma } from './prisma';
import { LaptopStorageTypeOption } from '@prisma/client';
import { MasterDataItem } from './types';

const mapToMasterDataItem = (storageOption: LaptopStorageTypeOption): MasterDataItem => ({
  id: storageOption.id.toString(),
  name: storageOption.value,
});

export const getStorages = async (): Promise<MasterDataItem[]> => {
  const storageOptions = await prisma.laptopStorageTypeOption.findMany({
    orderBy: {
      value: 'asc'
    }
  });
  return storageOptions.map(mapToMasterDataItem);
};

export const createStorage = async (data: { name: string }): Promise<MasterDataItem> => {
  const newStorageOption = await prisma.laptopStorageTypeOption.create({
    data: {
      value: data.name,
    },
  });
  return mapToMasterDataItem(newStorageOption);
};

export const updateStorage = async (id: number, data: { name: string }): Promise<MasterDataItem> => {
  const updatedStorageOption = await prisma.laptopStorageTypeOption.update({
    where: { id },
    data: {
      value: data.name,
    },
  });
  return mapToMasterDataItem(updatedStorageOption);
};

export const deleteStorage = async (id: number): Promise<void> => {
  await prisma.laptopStorageTypeOption.delete({
    where: { id },
  });
};

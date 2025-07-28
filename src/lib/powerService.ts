import { prisma } from './prisma';
import { LaptopPowerOption } from '@prisma/client';
import { MasterDataItem } from './types';

const mapToMasterDataItem = (powerOption: LaptopPowerOption): MasterDataItem => ({
  id: powerOption.id,
  name: powerOption.value,
  createdAt: powerOption.createdAt,
  updatedAt: powerOption.updatedAt,
});

export const getPowers = async (): Promise<MasterDataItem[]> => {
  const powerOptions = await prisma.laptopPowerOption.findMany({
    orderBy: {
      value: 'asc'
    }
  });
  return powerOptions.map(mapToMasterDataItem);
};

export const createPower = async (data: { name: string }): Promise<MasterDataItem> => {
  const newPowerOption = await prisma.laptopPowerOption.create({
    data: {
      value: data.name,
    },
  });
  return mapToMasterDataItem(newPowerOption);
};

export const updatePower = async (id: number, data: { name: string }): Promise<MasterDataItem> => {
  const updatedPowerOption = await prisma.laptopPowerOption.update({
    where: { id },
    data: {
      value: data.name,
    },
  });
  return mapToMasterDataItem(updatedPowerOption);
};

export const deletePower = async (id: number): Promise<void> => {
  await prisma.laptopPowerOption.delete({
    where: { id },
  });
};

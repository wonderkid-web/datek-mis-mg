import { prisma } from './prisma';
import { LaptopMicrosoftOfficeOption } from '@prisma/client';
import { MasterDataItem } from './types';

const mapToMasterDataItem = (officeOption: LaptopMicrosoftOfficeOption): MasterDataItem => ({
  id: officeOption.id.toString(),
  name: officeOption.value,
  createdAt: officeOption.createdAt,
  updatedAt: officeOption.updatedAt,
});

export const getMicrosoftOffices = async (): Promise<MasterDataItem[]> => {
  const officeOptions = await prisma.laptopMicrosoftOfficeOption.findMany({
    orderBy: {
      value: 'asc'
    }
  });
  return officeOptions.map(mapToMasterDataItem);
};

export const createMicrosoftOffice = async (data: { name: string }): Promise<MasterDataItem> => {
  const newOfficeOption = await prisma.laptopMicrosoftOfficeOption.create({
    data: {
      value: data.name,
    },
  });
  return mapToMasterDataItem(newOfficeOption);
};

export const updateMicrosoftOffice = async (id: number, data: { name: string }): Promise<MasterDataItem> => {
  const updatedOfficeOption = await prisma.laptopMicrosoftOfficeOption.update({
    where: { id },
    data: {
      value: data.name,
    },
  });
  return mapToMasterDataItem(updatedOfficeOption);
};

export const deleteMicrosoftOffice = async (id: number): Promise<void> => {
  await prisma.laptopMicrosoftOfficeOption.delete({
    where: { id },
  });
};

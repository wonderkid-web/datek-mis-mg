import { prisma } from './prisma';
import { LaptopProcessorOption } from '@prisma/client';
import { MasterDataItem } from './types';

const mapToMasterDataItem = (processorOption: LaptopProcessorOption): MasterDataItem => ({
  id: processorOption.id.toString(),
  name: processorOption.value,
});

export const getProcessors = async (): Promise<MasterDataItem[]> => {
  const processorOptions = await prisma.laptopProcessorOption.findMany({
    orderBy: {
      value: 'asc'
    }
  });
  return processorOptions.map(mapToMasterDataItem);
};

export const createProcessor = async (data: { name: string }): Promise<MasterDataItem> => {
  const newProcessorOption = await prisma.laptopProcessorOption.create({
    data: {
      value: data.name,
    },
  });
  return mapToMasterDataItem(newProcessorOption);
};

export const updateProcessor = async (id: number, data: { name: string }): Promise<MasterDataItem> => {
  const updatedProcessorOption = await prisma.laptopProcessorOption.update({
    where: { id },
    data: {
      value: data.name,
    },
  });
  return mapToMasterDataItem(updatedProcessorOption);
};

export const deleteProcessor = async (id: number): Promise<void> => {
  await prisma.laptopProcessorOption.delete({
    where: { id },
  });
};

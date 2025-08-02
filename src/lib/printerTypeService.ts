"use server";
import { prisma } from './prisma';
import { PrinterTypeOption } from '@prisma/client';

export const getPrinterTypeOptions = async (): Promise<PrinterTypeOption[]> => {
  return await prisma.printerTypeOption.findMany({
    orderBy: {
      value: 'asc'
    }
  });
};

export const createPrinterTypeOption = async (data: { value: string }): Promise<PrinterTypeOption> => {
  return await prisma.printerTypeOption.create({
    data: {
      value: data.value,
    },
  });
};

export const updatePrinterTypeOption = async (id: number, data: { value: string }): Promise<PrinterTypeOption> => {
  return await prisma.printerTypeOption.update({
    where: { id },
    data: {
      value: data.value,
    },
  });
};

export const deletePrinterTypeOption = async (id: number): Promise<void> => {
  await prisma.printerTypeOption.delete({
    where: { id },
  });
};
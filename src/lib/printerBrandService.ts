"use server";
import { prisma } from './prisma';
import { PrinterBrandOption } from '@prisma/client';

export const getPrinterBrandOptions = async (): Promise<PrinterBrandOption[]> => {
  return await prisma.printerBrandOption.findMany({
    orderBy: {
      value: 'asc'
    }
  });
};

export const createPrinterBrandOption = async (data: { value: string }): Promise<PrinterBrandOption> => {
  return await prisma.printerBrandOption.create({
    data: {
      value: data.value,
    },
  });
};

export const updatePrinterBrandOption = async (id: number, data: { value: string }): Promise<PrinterBrandOption> => {
  return await prisma.printerBrandOption.update({
    where: { id },
    data: {
      value: data.value,
    },
  });
};

export const deletePrinterBrandOption = async (id: number): Promise<void> => {
  await prisma.printerBrandOption.delete({
    where: { id },
  });
};
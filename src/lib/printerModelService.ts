"use server";
import { prisma } from './prisma';
import { PrinterModelOption } from '@prisma/client';

export const getPrinterModelOptions = async (): Promise<PrinterModelOption[]> => {
  return await prisma.printerModelOption.findMany({
    orderBy: {
      value: 'asc'
    }
  });
};

export const createPrinterModelOption = async (data: { value: string }): Promise<PrinterModelOption> => {
  return await prisma.printerModelOption.create({
    data: {
      value: data.value,
    },
  });
};

export const updatePrinterModelOption = async (id: number, data: { value: string }): Promise<PrinterModelOption> => {
  return await prisma.printerModelOption.update({
    where: { id },
    data: {
      value: data.value,
    },
  });
};

export const deletePrinterModelOption = async (id: number): Promise<void> => {
  await prisma.printerModelOption.delete({
    where: { id },
  });
};
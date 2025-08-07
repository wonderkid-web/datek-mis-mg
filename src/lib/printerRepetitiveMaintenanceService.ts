"use server";
import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";
import { unstable_cache, revalidateTag } from "next/cache";

const REVALIDATE_TAG = "printer-repetitive-maintenance";

export const getPrinterRepetitiveMaintenances = unstable_cache(
  async (options: Prisma.PrinterRepetitiveMaintenanceFindManyArgs = {}) => {
    try {
      const records = await prisma.printerRepetitiveMaintenance.findMany({
        ...options,
        orderBy: {
          reportDate: "desc",
        },
      });
      return records;
    } catch (error) {
      console.error("Error fetching printer repetitive maintenance records:", error);
      throw new Error("Could not fetch printer repetitive maintenance records.");
    }
  },
  [REVALIDATE_TAG],
  {
    tags: [REVALIDATE_TAG],
  }
);

export async function createPrinterRepetitiveMaintenance(
  data: Prisma.PrinterRepetitiveMaintenanceCreateInput
) {
  try {
    const record = await prisma.printerRepetitiveMaintenance.create({
      data,
    });
    revalidateTag(REVALIDATE_TAG);
    return record;
  } catch (error) {
    console.error("Error creating printer repetitive maintenance record:", error);
    throw new Error("Could not create printer repetitive maintenance record.");
  }
}

export async function updatePrinterRepetitiveMaintenance(
  id: number,
  data: Prisma.PrinterRepetitiveMaintenanceUpdateInput
) {
  try {
    const record = await prisma.printerRepetitiveMaintenance.update({
      where: { id },
      data,
    });
    revalidateTag(REVALIDATE_TAG);
    return record;
  } catch (error) {
    console.error(`Error updating printer repetitive maintenance record with id ${id}:`, error);
    throw new Error("Could not update printer repetitive maintenance record.");
  }
}

export async function deletePrinterRepetitiveMaintenance(id: number) {
  try {
    const record = await prisma.printerRepetitiveMaintenance.delete({
      where: { id },
    });
    revalidateTag(REVALIDATE_TAG);
    return record;
  } catch (error) {
    console.error(`Error deleting printer repetitive maintenance record with id ${id}:`, error);
    throw new Error("Could not delete printer repetitive maintenance record.");
  }
}

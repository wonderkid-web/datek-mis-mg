"use server";

import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";
import { unstable_cache, revalidateTag } from "next/cache";

const REVALIDATE_TAG = "computer-maintenance";

const defaultInclude = {
  assetAssignment: {
    include: {
      asset: {
        include: {
          category: true,
        },
      },
      user: true,
    },
  },
};

export const getComputerMaintenances = unstable_cache(
  async (options: Prisma.ComputerMaintenanceFindManyArgs = {}) => {
    try {
      const { include, orderBy, ...rest } = options;
      const records = await prisma.computerMaintenance.findMany({
        ...rest,
        include: {
          ...defaultInclude,
          ...(include ?? {}),
        },
        orderBy: orderBy ?? {
          periode: "desc",
        },
      });

      return records;
    } catch (error) {
      console.error("Error fetching computer maintenance records:", error);
      throw new Error("Could not fetch computer maintenance records.");
    }
  },
  [REVALIDATE_TAG],
  {
    tags: [REVALIDATE_TAG],
  }
);

export async function createComputerMaintenance(
  data: Prisma.ComputerMaintenanceUncheckedCreateInput
) {
  try {
    const record = await prisma.computerMaintenance.create({
      data,
    });
    revalidateTag(REVALIDATE_TAG);
    return record;
  } catch (error) {
    console.error("Error creating computer maintenance record:", error);
    throw new Error("Could not create computer maintenance record.");
  }
}

export async function updateComputerMaintenance(
  id: number,
  data: Prisma.ComputerMaintenanceUncheckedUpdateInput
) {
  try {
    const record = await prisma.computerMaintenance.update({
      where: { id },
      data,
    });
    revalidateTag(REVALIDATE_TAG);
    return record;
  } catch (error) {
    console.error(`Error updating computer maintenance record with id ${id}:`, error);
    throw new Error("Could not update computer maintenance record.");
  }
}

export async function deleteComputerMaintenance(id: number) {
  try {
    const record = await prisma.computerMaintenance.delete({
      where: { id },
    });
    revalidateTag(REVALIDATE_TAG);
    return record;
  } catch (error) {
    console.error(`Error deleting computer maintenance record with id ${id}:`, error);
    throw new Error("Could not delete computer maintenance record.");
  }
}

"use server";
import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";
import { unstable_cache, revalidateTag } from "next/cache";

export const getServiceRecords = unstable_cache(
  async (options: Prisma.ServiceRecordFindManyArgs = {}) => {
    try {
      const serviceRecords = await prisma.serviceRecord.findMany({
        ...options,
        include: {
          assetAssignment: {
            include: {
              asset: true,
              user: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });
      return serviceRecords.map((record) => ({
        ...record,
        cost: record.cost.toString(), // Convert Decimal to string
      }));
    } catch (error) {
      console.error("Error fetching service records:", error);
      throw new Error("Could not fetch service records.");
    }
  },
  ["service-records"],
  {
    tags: ["service-records"],
  }
);

export async function createServiceRecord(
  data: Prisma.ServiceRecordCreateInput
) {
  try {
    const serviceRecord = await prisma.serviceRecord.create({
      data,
    });
    revalidateTag("service-records");
    return {
      ...serviceRecord,
      cost: serviceRecord.cost.toString(), // Convert Decimal to string
    };
  } catch (error) {
    console.error("Error creating service record:", error);
    throw new Error("Could not create service record.");
  }
}

export async function updateServiceRecord(
  id: number,
  data: Prisma.ServiceRecordUpdateInput
) {
  try {
    const serviceRecord = await prisma.serviceRecord.update({
      where: { id },
      data,
    });
    revalidateTag("service-records");
    return {
      ...serviceRecord,
      cost: serviceRecord.cost.toString(), // Convert Decimal to string
    };
  } catch (error) {
    console.error(`Error updating service record with id ${id}:`, error);
    throw new Error("Could not update service record.");
  }
}

export async function deleteServiceRecord(id: number) {
  try {
    const serviceRecord = await prisma.serviceRecord.delete({
      where: { id },
    });
    revalidateTag("service-records");
    return serviceRecord;
  } catch (error) {
    console.error(`Error deleting service record with id ${id}:`, error);
    throw new Error("Could not delete service record.");
  }
}

"use server";

import { PcUpsOption } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getPcUpsOptions(): Promise<PcUpsOption[]> {
  return prisma.pcUpsOption.findMany({
    orderBy: {
      value: "asc",
    },
  });
}

export async function createPcUpsOption(data: {
  value: string;
}): Promise<PcUpsOption> {
  return prisma.pcUpsOption.create({
    data: {
      value: data.value,
    },
  });
}

export async function updatePcUpsOption(
  id: number,
  data: { value: string }
): Promise<PcUpsOption> {
  return prisma.pcUpsOption.update({
    where: { id },
    data: {
      value: data.value,
    },
  });
}

export async function deletePcUpsOption(id: number): Promise<void> {
  await prisma.pcUpsOption.delete({
    where: { id },
  });
}

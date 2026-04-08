"use server";

import { PcMonitorOption } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getPcMonitorOptions(): Promise<PcMonitorOption[]> {
  return prisma.pcMonitorOption.findMany({
    orderBy: {
      value: "asc",
    },
  });
}

export async function createPcMonitorOption(data: {
  value: string;
}): Promise<PcMonitorOption> {
  return prisma.pcMonitorOption.create({
    data: {
      value: data.value,
    },
  });
}

export async function updatePcMonitorOption(
  id: number,
  data: { value: string }
): Promise<PcMonitorOption> {
  return prisma.pcMonitorOption.update({
    where: { id },
    data: {
      value: data.value,
    },
  });
}

export async function deletePcMonitorOption(id: number): Promise<void> {
  await prisma.pcMonitorOption.delete({
    where: { id },
  });
}

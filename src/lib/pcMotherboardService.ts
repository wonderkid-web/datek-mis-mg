"use server";

import { PcMotherboardOption } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getPcMotherboardOptions(): Promise<PcMotherboardOption[]> {
  return prisma.pcMotherboardOption.findMany({
    orderBy: {
      value: "asc",
    },
  });
}

export async function createPcMotherboardOption(data: {
  value: string;
}): Promise<PcMotherboardOption> {
  return prisma.pcMotherboardOption.create({
    data: {
      value: data.value,
    },
  });
}

export async function updatePcMotherboardOption(
  id: number,
  data: { value: string }
): Promise<PcMotherboardOption> {
  return prisma.pcMotherboardOption.update({
    where: { id },
    data: {
      value: data.value,
    },
  });
}

export async function deletePcMotherboardOption(id: number): Promise<void> {
  await prisma.pcMotherboardOption.delete({
    where: { id },
  });
}

"use server";

import { CoGroupOption } from "@prisma/client";
import { prisma } from "./prisma";

export const getCoGroupOptions = async (): Promise<CoGroupOption[]> => {
  return prisma.coGroupOption.findMany({
    orderBy: {
      value: "asc",
    },
  });
};

export const createCoGroupOption = async (
  data: { value: string }
): Promise<CoGroupOption> => {
  return prisma.coGroupOption.create({
    data: {
      value: data.value,
    },
  });
};

export const updateCoGroupOption = async (
  id: number,
  data: { value: string }
): Promise<CoGroupOption> => {
  return prisma.coGroupOption.update({
    where: { id },
    data: {
      value: data.value,
    },
  });
};

export const deleteCoGroupOption = async (id: number): Promise<void> => {
  await prisma.coGroupOption.delete({
    where: { id },
  });
};

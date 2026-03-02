"use server";

import { Trunk } from "@prisma/client";
import { prisma } from "./prisma";

export const getTrunks = async (): Promise<Trunk[]> => {
  return prisma.trunk.findMany({
    orderBy: {
      nomorLine: "asc",
    },
  });
};

export const createTrunk = async (
  data: { nomorLine: number; company: string; extension: number }
): Promise<Trunk> => {
  return prisma.trunk.create({
    data: {
      nomorLine: data.nomorLine,
      company: data.company,
      extension: data.extension,
    },
  });
};

export const updateTrunk = async (
  id: number,
  data: { nomorLine: number; company: string; extension: number }
): Promise<Trunk> => {
  return prisma.trunk.update({
    where: { id },
    data: {
      nomorLine: data.nomorLine,
      company: data.company,
      extension: data.extension,
    },
  });
};

export const deleteTrunk = async (id: number): Promise<void> => {
  await prisma.trunk.delete({
    where: { id },
  });
};

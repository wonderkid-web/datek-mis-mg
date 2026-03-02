"use server";

import { Pstn } from "@prisma/client";
import { prisma } from "./prisma";

export const getPstns = async (): Promise<Pstn[]> => {
  return prisma.pstn.findMany({
    orderBy: {
      pstnCode: "asc",
    },
  });
};

export const createPstn = async (
  data: { pstnCode: number; pstnName: string }
): Promise<Pstn> => {
  return prisma.pstn.create({
    data: {
      pstnCode: data.pstnCode,
      pstnName: data.pstnName,
    },
  });
};

export const updatePstn = async (
  id: number,
  data: { pstnCode: number; pstnName: string }
): Promise<Pstn> => {
  return prisma.pstn.update({
    where: { id },
    data: {
      pstnCode: data.pstnCode,
      pstnName: data.pstnName,
    },
  });
};

export const deletePstn = async (id: number): Promise<void> => {
  await prisma.pstn.delete({
    where: { id },
  });
};

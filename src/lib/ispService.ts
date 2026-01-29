"use server";

import { prisma } from "./prisma";
import { Isp } from "@prisma/client";

export const getIsps = async () => {
  const isps = await prisma.isp.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  return isps.map(isp => ({...isp}));
};

export const getIspById = async (id: number) => {
  const isp = await prisma.isp.findUnique({
    where: { id },
  });
  return isp ? {...isp} : null;
};

export const createIsp = async (data: Omit<Isp, "id" | "createdAt" | "updatedAt">) => {
  const newIsp = await prisma.isp.create({
    data: {
        ...data,
    }
  });
  return {...newIsp};
};

export const updateIsp = async (id: number, data: Partial<Omit<Isp, "id" | "createdAt" | "updatedAt">>) => {
  // @ts-ignore its okay
  const { id: dataId, createdAt, updatedAt, price, ...rest } = data;
  const updatedIsp = await prisma.isp.update({
    where: { id },
    data: {
        ...rest,
    },
  });
  return {...updatedIsp};
};

export const deleteIsp = async (id: number) => {
  return await prisma.isp.delete({
    where: { id },
  });
};

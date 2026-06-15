"use server";

import { IspSlaRecord } from "@prisma/client";

import { prisma } from "./prisma";

export type IspSlaRecordInput = Omit<
  IspSlaRecord,
  "id" | "contract" | "createdAt" | "updatedAt"
> & {
  remarks?: string | null;
};

export const getIspSlaRecords = async () => {
  return prisma.ispSlaRecord.findMany({
    include: {
      isp: true,
    },
    orderBy: [
      { year: "desc" },
      { month: "desc" },
      { createdAt: "desc" },
    ],
  });
};

export const getIspSlaRecordById = async (id: number) => {
  return prisma.ispSlaRecord.findUnique({
    where: { id },
    include: {
      isp: true,
    },
  });
};

export const createIspSlaRecord = async (data: IspSlaRecordInput) => {
  const isp = await prisma.isp.findUnique({
    where: { id: data.ispId },
    select: { sla: true },
  });

  if (!isp) {
    throw new Error("ISP tidak ditemukan.");
  }

  return prisma.ispSlaRecord.create({
    data: {
      ...data,
      contract: isp.sla,
      remarks: data.remarks?.trim() ? data.remarks.trim() : null,
    },
  });
};

export const updateIspSlaRecord = async (
  id: number,
  data: Partial<IspSlaRecordInput>
) => {
  const currentRecord = await prisma.ispSlaRecord.findUnique({
    where: { id },
    select: { ispId: true },
  });

  if (!currentRecord) {
    throw new Error("Data SLA tidak ditemukan.");
  }

  const nextIspId = data.ispId ?? currentRecord.ispId;
  const isp = await prisma.isp.findUnique({
    where: { id: nextIspId },
    select: { sla: true },
  });

  if (!isp) {
    throw new Error("ISP tidak ditemukan.");
  }

  return prisma.ispSlaRecord.update({
    where: { id },
    data: {
      ...data,
      contract: isp.sla,
      ...(data.remarks !== undefined
        ? { remarks: data.remarks?.trim() ? data.remarks.trim() : null }
        : {}),
    },
  });
};

export const deleteIspSlaRecord = async (id: number) => {
  return prisma.ispSlaRecord.delete({
    where: { id },
  });
};

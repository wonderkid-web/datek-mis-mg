"use server";

import { CallOutgoingOption } from "@prisma/client";
import { prisma } from "./prisma";

export const getCallOutgoingOptions = async (): Promise<CallOutgoingOption[]> => {
  return prisma.callOutgoingOption.findMany({
    orderBy: {
      value: "asc",
    },
  });
};

export const createCallOutgoingOption = async (
  data: { value: number; line: number; company: string }
): Promise<CallOutgoingOption> => {
  return prisma.callOutgoingOption.create({
    data: {
      value: data.value,
      line: data.line,
      company: data.company,
    },
  });
};

export const updateCallOutgoingOption = async (
  id: number,
  data: { value: number; line: number; company: string }
): Promise<CallOutgoingOption> => {
  return prisma.callOutgoingOption.update({
    where: { id },
    data: {
      value: data.value,
      line: data.line,
      company: data.company,
    },
  });
};

export const deleteCallOutgoingOption = async (id: number): Promise<void> => {
  await prisma.callOutgoingOption.delete({
    where: { id },
  });
};

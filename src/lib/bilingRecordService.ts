"use server";

import { Prisma } from "@prisma/client";
import { revalidateTag, unstable_cache } from "next/cache";
import { prisma } from "./prisma";

const REVALIDATE_TAG = "biling-records";

const defaultInclude = {
  user: true,
};

const normalizeDateInput = (value: string | Date | null | undefined) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const sanitizeDuration = (value: string | null | undefined) => {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const coerceDateUpdate = (
  value: Prisma.DateTimeFieldUpdateOperationsInput | Date | string | null | undefined
) => {
  if (!value) return undefined;
  if (value instanceof Date || typeof value === "string") {
    return normalizeDateInput(value);
  }
  if (typeof value === "object" && "set" in value) {
    const setValue = (value as Prisma.DateTimeFieldUpdateOperationsInput).set;
    if (setValue instanceof Date || typeof setValue === "string") {
      const parsed = normalizeDateInput(setValue);
      return parsed ? { set: parsed } : undefined;
    }
  }
  return value;
};

export const getBilingRecords = unstable_cache(
  async (options: Prisma.BilingRecordFindManyArgs = {}) => {
    const { include, orderBy, ...rest } = options;
    return prisma.bilingRecord.findMany({
      ...rest,
      include: {
        ...defaultInclude,
        ...(include ?? {}),
      },
      orderBy: orderBy ?? { callDate: "desc" },
    });
  },
  [REVALIDATE_TAG],
  { tags: [REVALIDATE_TAG] }
);

export const createBilingRecord = async (
  data: Prisma.BilingRecordUncheckedCreateInput
) => {
  const callDate = normalizeDateInput(data.callDate);
  const duration = sanitizeDuration(
    typeof data.duration === "string" ? data.duration : null
  );

  if (!callDate || !duration) {
    throw new Error("Call date and duration are required.");
  }

  const record = await prisma.bilingRecord.create({
    data: {
      ...data,
      callDate,
      duration,
    },
    include: defaultInclude,
  });
  revalidateTag(REVALIDATE_TAG);
  return record;
};

export const updateBilingRecord = async (
  id: number,
  data: Prisma.BilingRecordUncheckedUpdateInput
) => {
  const updatePayload: Prisma.BilingRecordUncheckedUpdateInput = { ...data };
  const normalizedCallDate = coerceDateUpdate(data.callDate);
  if (normalizedCallDate !== undefined && normalizedCallDate !== null) {
    updatePayload.callDate = normalizedCallDate;
  }

  if (typeof data.duration === "string") {
    const duration = sanitizeDuration(data.duration);
    if (!duration) {
      throw new Error("Duration is required.");
    }
    updatePayload.duration = duration;
  }

  const record = await prisma.bilingRecord.update({
    where: { id },
    data: updatePayload,
    include: defaultInclude,
  });
  revalidateTag(REVALIDATE_TAG);
  return record;
};

export const deleteBilingRecord = async (id: number) => {
  const record = await prisma.bilingRecord.delete({
    where: { id },
  });
  revalidateTag(REVALIDATE_TAG);
  return record;
};

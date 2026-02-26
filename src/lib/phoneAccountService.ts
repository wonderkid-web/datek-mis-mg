"use server";

import { Prisma } from "@prisma/client";
import { revalidateTag, unstable_cache } from "next/cache";
import { prisma } from "./prisma";

const REVALIDATE_TAG = "phone-accounts";

const defaultInclude = {
  user: true,
  callOutgoingOption: true,
  coGroupOption: true,
};

export const getPhoneAccounts = unstable_cache(
  async (options: Prisma.PhoneAccountFindManyArgs = {}) => {
    const { include, orderBy, ...rest } = options;
    return prisma.phoneAccount.findMany({
      ...rest,
      include: {
        ...defaultInclude,
        ...(include ?? {}),
      },
      orderBy: orderBy ?? {
        createdAt: "desc",
      },
    });
  },
  [REVALIDATE_TAG],
  {
    tags: [REVALIDATE_TAG],
  }
);

export const createPhoneAccount = async (
  data: Prisma.PhoneAccountUncheckedCreateInput
) => {
  const record = await prisma.phoneAccount.create({
    data,
    include: defaultInclude,
  });
  revalidateTag(REVALIDATE_TAG);
  return record;
};

export const updatePhoneAccount = async (
  id: number,
  data: Prisma.PhoneAccountUncheckedUpdateInput
) => {
  const record = await prisma.phoneAccount.update({
    where: { id },
    data,
    include: defaultInclude,
  });
  revalidateTag(REVALIDATE_TAG);
  return record;
};

export const deletePhoneAccount = async (id: number) => {
  const record = await prisma.phoneAccount.delete({
    where: { id },
  });
  revalidateTag(REVALIDATE_TAG);
  return record;
};

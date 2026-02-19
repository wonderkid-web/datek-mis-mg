"use server";

import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";
import { unstable_cache, revalidateTag } from "next/cache";

const REVALIDATE_TAG = "problem-sequences";
const TICKET_PREFIX = "MG/MIS/";
const PAD_LENGTH = 4;

const defaultInclude = {
  isp: true,
};

const normalizeDateInput = (value: string | Date | null | undefined) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const sanitizeTicket = (value: string | null | undefined) => {
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

const incrementTicketNumber = (ticket: string | null) => {
  const nextNumber = ticket
    ? parseInt(ticket.split("/").pop() ?? "0", 10) + 1
    : 1;
  const padded = String(nextNumber).padStart(PAD_LENGTH, "0");
  return `${TICKET_PREFIX}${padded}`;
};

const getNextTicketNumberFromClient = async (
  client: Prisma.TransactionClient | typeof prisma
) => {
  const latestRecord = await client.problemSequence.findFirst({
    orderBy: {
      ticketNumber: "desc",
    },
  });
  return incrementTicketNumber(latestRecord?.ticketNumber ?? null);
};

export const getNextProblemSequenceTicketNumber = async () => {
  return getNextTicketNumberFromClient(prisma);
};

export const getProblemSequences = unstable_cache(
  async (options: Prisma.ProblemSequenceFindManyArgs = {}) => {
    try {
      const { include, orderBy, ...rest } = options;
      const records = await prisma.problemSequence.findMany({
        ...rest,
        include: {
          ...defaultInclude,
          ...(include ?? {}),
        },
        orderBy: orderBy ?? { dateDown: "desc" },
      });
      return records;
    } catch (error) {
      console.error("Error fetching problem sequences:", error);
      throw new Error("Could not fetch problem sequences.");
    }
  },
  [REVALIDATE_TAG],
  { tags: [REVALIDATE_TAG] }
);

export async function createProblemSequence(
  data: Prisma.ProblemSequenceUncheckedCreateInput
) {
  try {
    const record = await prisma.$transaction(async (tx) => {
      const dateDown = normalizeDateInput(data.dateDown);
      const dateDoneUp = normalizeDateInput(data.dateDoneUp);
      if (!dateDown || !dateDoneUp) {
        throw new Error("Invalid Date Down/Done Up value.");
      }

      const providedTicket = sanitizeTicket(
        typeof data.ticketNumber === "string" ? data.ticketNumber : null
      );
      const ticketNumber =
        providedTicket ?? (await getNextTicketNumberFromClient(tx));
      return tx.problemSequence.create({
        data: {
          ...data,
          ticketNumber,
          dateDown,
          dateDoneUp,
        },
        include: defaultInclude,
      });
    });
    revalidateTag(REVALIDATE_TAG);
    return record;
  } catch (error) {
    console.error("Error creating problem sequence record:", error);
    throw new Error("Could not create problem sequence record.");
  }
}

export async function updateProblemSequence(
  id: number,
  data: Prisma.ProblemSequenceUncheckedUpdateInput
) {
  try {
    const updatePayload: Prisma.ProblemSequenceUncheckedUpdateInput = {
      ...data,
    };

    const normalizedDateDown = coerceDateUpdate(data.dateDown);
    if (normalizedDateDown !== undefined && normalizedDateDown !== null) {
      updatePayload.dateDown = normalizedDateDown;
    }

    const normalizedDateDoneUp = coerceDateUpdate(data.dateDoneUp);
    if (normalizedDateDoneUp !== undefined && normalizedDateDoneUp !== null) {
      updatePayload.dateDoneUp = normalizedDateDoneUp;
    }

    if (typeof data.ticketNumber === "string") {
      updatePayload.ticketNumber = sanitizeTicket(data.ticketNumber) ?? undefined;
    }

    const record = await prisma.problemSequence.update({
      where: { id },
      data: updatePayload,
      include: defaultInclude,
    });
    revalidateTag(REVALIDATE_TAG);
    return record;
  } catch (error) {
    console.error(`Error updating problem sequence record with id ${id}:`, error);
    throw new Error("Could not update problem sequence record.");
  }
}

export async function deleteProblemSequence(id: number) {
  try {
    const record = await prisma.problemSequence.delete({
      where: { id },
    });
    revalidateTag(REVALIDATE_TAG);
    return record;
  } catch (error) {
    console.error(`Error deleting problem sequence record with id ${id}:`, error);
    throw new Error("Could not delete problem sequence record.");
  }
}

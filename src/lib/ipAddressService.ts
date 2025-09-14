"use server";

import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";

// Types for UI projections
export type IpAddressWithRelations = Awaited<ReturnType<typeof getIpAddresses>>[number];

export async function getIpAddresses() {
  return prisma.ipAddress.findMany({
    include: {
      user: {
        select: { id: true, namaLengkap: true, lokasiKantor: true },
      },
      assetAssignment: {
        select: {
          id: true,
          nomorAsset: true,
          asset: {
            select: {
              id: true,
              namaAsset: true,
              nomorSeri: true,
              categoryId: true,
              laptopSpecs: { select: { brandOption: { select: { value: true } } } },
              intelNucSpecs: { select: { brandOption: { select: { value: true } } } },
              printerSpecs: { select: { brandOption: { select: { value: true } } } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createIpAddress(data: {
  userId: number;
  ip: string;
  connection: "WIFI" | "ETHERNET";
  status: "EMPLOYEE" | "GUEST_LAPTOP" | "GUEST_PHONE";
  role: "LIST" | "FULL_ACCESS";
  assetAssignmentId?: number | null;
}) {
  const user = await prisma.user.findUnique({
    where: { id: data.userId },
    select: { id: true, lokasiKantor: true },
  });
  if (!user) throw new Error("User not found");

  // Ensure asset assignment belongs to the same user (when provided)
  let assignmentConnect: Prisma.AssetAssignmentWhereUniqueInput | undefined;
  if (data.status === "EMPLOYEE" && data.assetAssignmentId) {
    const assignment = await prisma.assetAssignment.findUnique({
      where: { id: data.assetAssignmentId },
      select: { id: true, userId: true },
    });
    if (!assignment) throw new Error("Asset assignment not found");
    if (assignment.userId !== data.userId) {
      throw new Error("Asset assignment does not belong to the selected user");
    }
    assignmentConnect = { id: assignment.id };
  }

  // If not employee, ignore asset assignment
  const payload: Prisma.IpAddressCreateInput = {
    ip: data.ip,
    connection: data.connection as any,
    status: data.status as any,
    role: data.role as any,
    company: user.lokasiKantor ?? "",
    user: { connect: { id: data.userId } },
    assetAssignment: assignmentConnect ? { connect: assignmentConnect } : undefined,
  };

  return prisma.ipAddress.create({ data: payload });
}

export async function updateIpAddress(
  id: number,
  data: {
    userId?: number;
    ip?: string;
    connection?: "WIFI" | "ETHERNET";
    status?: "EMPLOYEE" | "GUEST_LAPTOP" | "GUEST_PHONE";
    role?: "LIST" | "FULL_ACCESS";
    assetAssignmentId?: number | null;
  }
) {
  const update: Prisma.IpAddressUpdateInput = {};

  if (data.userId !== undefined) {
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      select: { id: true, lokasiKantor: true },
    });
    if (!user) throw new Error("User not found");
    update.user = { connect: { id: user.id } };
    update.company = user.lokasiKantor ?? ""; // keep in sync
  }
  if (data.ip !== undefined) update.ip = data.ip;
  if (data.connection !== undefined) update.connection = data.connection as any;
  if (data.status !== undefined) update.status = data.status as any;
  if (data.role !== undefined) update.role = data.role as any;

  if (data.status && data.status !== "EMPLOYEE") {
    // Clear asset assignment if no longer employee
    update.assetAssignment = { disconnect: true };
  } else if (data.assetAssignmentId !== undefined) {
    if (data.assetAssignmentId === null) {
      update.assetAssignment = { disconnect: true };
    } else {
      const assignment = await prisma.assetAssignment.findUnique({
        where: { id: data.assetAssignmentId },
        select: { id: true, userId: true },
      });
      if (!assignment) throw new Error("Asset assignment not found");
      // If userId also being updated, ensure ownership matches new user; otherwise, keep current owner check simple
      if (data.userId !== undefined && assignment.userId !== data.userId) {
        throw new Error("Asset assignment does not belong to the selected user");
      }
      update.assetAssignment = { connect: { id: assignment.id } };
    }
  }

  return prisma.ipAddress.update({ where: { id }, data: update });
}

export async function deleteIpAddress(id: number) {
  await prisma.ipAddress.delete({ where: { id } });
}


"use server";

import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";
import { formatMacAddress, isValidMacAddress } from "@/lib/utils";

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
              laptopSpecs: { select: { brandOption: { select: { value: true } }, macWlan: true } },
              intelNucSpecs: { select: { brandOption: { select: { value: true } }, macWlan: true } },
              printerSpecs: { select: { brandOption: { select: { value: true } } } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getIpAddressTotal(): Promise<number> {
  return prisma.ipAddress.count();
}

export async function getIpAddressBreakdownByLocation() {
  // Follow the same ISA (Group) merging convention as assets
  const { ALL_LOCATIONS } = await import("@/lib/constants");
  const mergedIsaName = "PT Intan Sejati Andalan (Group)";
  const finalLocations = [
    ...ALL_LOCATIONS.filter((l) => !l.startsWith("PT Intan Sejati Andalan")),
    mergedIsaName,
  ];

  const counts: Record<string, number> = {};
  finalLocations.forEach((loc) => (counts[loc] = 0));

  const rows = await prisma.ipAddress.findMany({
    select: { company: true },
  });

  rows.forEach((r) => {
    let location = r.company || "Unassigned";
    if (location.startsWith("PT Intan Sejati Andalan")) {
      location = mergedIsaName;
    }
    if (counts[location] !== undefined) {
      counts[location] += 1;
    }
  });

  return Object.entries(counts).map(([location, total]) => ({ location, total }));
}

export async function getPaginatedIpAddresses({
  page = 1,
  pageSize = 10,
  q,
  company,
  connection,
  status,
  role,
}: {
  page?: number;
  pageSize?: number;
  q?: string;
  company?: string;
  connection?: "WIFI" | "ETHERNET";
  status?: "EMPLOYEE" | "GUEST_LAPTOP" | "GUEST_PHONE";
  role?: "LIST" | "FULL_ACCESS";
}) {
  const mergedIsaName = "PT Intan Sejati Andalan (Group)";

  const where: Prisma.IpAddressWhereInput = {};

  if (q && q.trim() !== "") {
    const keyword = q.trim();
    where.OR = [
      { ip: { contains: keyword } },
      { user: { is: { namaLengkap: { contains: keyword } } } },
      { company: { contains: keyword } },
      { assetAssignment: { is: { nomorAsset: { contains: keyword } } } },
      { assetAssignment: { is: { asset: { is: { namaAsset: { contains: keyword } } } } } },
      { assetAssignment: { is: { asset: { is: { nomorSeri: { contains: keyword } } } } } },
    ];
  }

  if (company) {
    if (company === mergedIsaName) {
      // Any of the ISA variants
      where.company = { startsWith: "PT Intan Sejati Andalan" } as any;
    } else {
      where.company = { equals: company } as any;
    }
  }

  if (connection) where.connection = connection as any;
  if (status) where.status = status as any;
  if (role) where.role = role as any;

  const total = await prisma.ipAddress.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  const data = await prisma.ipAddress.findMany({
    where,
    include: {
      user: { select: { id: true, namaLengkap: true, lokasiKantor: true } },
      assetAssignment: {
        select: {
          id: true,
          nomorAsset: true,
          asset: {
            select: {
              id: true,
              namaAsset: true,
              nomorSeri: true,
              laptopSpecs: { select: { brandOption: { select: { value: true } }, macWlan: true } },
              intelNucSpecs: { select: { brandOption: { select: { value: true } }, macWlan: true } },
              printerSpecs: { select: { brandOption: { select: { value: true } } } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return { data, page, pageSize, total, pageCount };
}

export async function createIpAddress(data: {
  userId: number;
  ip: string;
  connection: "WIFI" | "ETHERNET";
  status: "EMPLOYEE" | "GUEST_LAPTOP" | "GUEST_PHONE";
  role: "LIST" | "FULL_ACCESS";
  assetAssignmentId?: number | null;
  macWlan?: string | null;
}) {
  const user = await prisma.user.findUnique({
    where: { id: data.userId },
    select: { id: true, lokasiKantor: true },
  });
  if (!user) throw new Error("User not found");

  // Ensure asset assignment belongs to the same user (when provided)
  let assignmentConnect: Prisma.AssetAssignmentWhereUniqueInput | undefined;
  let macWlanValue: string | null = null;
  if (data.status === "EMPLOYEE" && data.assetAssignmentId) {
    const assignment = await prisma.assetAssignment.findUnique({
      where: { id: data.assetAssignmentId },
      select: {
        id: true,
        userId: true,
        asset: {
          select: {
            laptopSpecs: { select: { macWlan: true } },
            intelNucSpecs: { select: { macWlan: true } },
          },
        },
      },
    });
    if (!assignment) throw new Error("Asset assignment not found");
    if (assignment.userId !== data.userId) {
      throw new Error("Asset assignment does not belong to the selected user");
    }
    assignmentConnect = { id: assignment.id };
    macWlanValue =
      assignment.asset?.laptopSpecs?.macWlan ||
      assignment.asset?.intelNucSpecs?.macWlan ||
      null;
  } else if (data.status === "EMPLOYEE") {
    // Employee without asset assignment: allow but mac remains null
    assignmentConnect = undefined;
  } else {
    if (!data.macWlan) {
      throw new Error("MAC WLAN is required for the selected status");
    }
    const formattedMac = formatMacAddress(data.macWlan);
    if (!isValidMacAddress(formattedMac)) {
      throw new Error("Invalid MAC WLAN format");
    }
    macWlanValue = formattedMac;
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
    macWlan: macWlanValue,
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
    macWlan?: string | null;
  }
) {
  const current = await prisma.ipAddress.findUnique({
    where: { id },
    select: {
      status: true,
      assetAssignmentId: true,
      userId: true,
      macWlan: true,
    },
  });
  if (!current) throw new Error("IP address not found");

  const update: Prisma.IpAddressUpdateInput = {};

  const finalUserId = data.userId ?? current.userId;
  const finalStatus = data.status ?? current.status;

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

  let macWlanValue: string | null | undefined;

  if (finalStatus !== "EMPLOYEE") {
    update.assetAssignment = { disconnect: true };

    if (data.macWlan !== undefined) {
      if (data.macWlan === null || data.macWlan === "") {
        macWlanValue = null;
      } else {
        const formattedMac = formatMacAddress(data.macWlan);
        if (!isValidMacAddress(formattedMac)) {
          throw new Error("Invalid MAC WLAN format");
        }
        macWlanValue = formattedMac;
      }
    }
  } else {
    // Employee
    const targetAssignmentId =
      data.assetAssignmentId !== undefined
        ? data.assetAssignmentId
        : current.assetAssignmentId;

    if (targetAssignmentId !== undefined) {
      if (targetAssignmentId === null) {
        update.assetAssignment = { disconnect: true };
        macWlanValue = null;
      } else {
        const assignment = await prisma.assetAssignment.findUnique({
          where: { id: targetAssignmentId },
          select: {
            id: true,
            userId: true,
            asset: {
              select: {
                laptopSpecs: { select: { macWlan: true } },
                intelNucSpecs: { select: { macWlan: true } },
              },
            },
          },
        });
        if (!assignment) throw new Error("Asset assignment not found");
        if (assignment.userId !== finalUserId) {
          throw new Error("Asset assignment does not belong to the selected user");
        }
        update.assetAssignment = { connect: { id: assignment.id } };
        macWlanValue =
          assignment.asset?.laptopSpecs?.macWlan ||
          assignment.asset?.intelNucSpecs?.macWlan ||
          null;
      }
    } else if (current.assetAssignmentId) {
      // Keep existing assignment, but refresh mac from it when user changes
      const assignment = await prisma.assetAssignment.findUnique({
        where: { id: current.assetAssignmentId },
        select: {
          id: true,
          userId: true,
          asset: {
            select: {
              laptopSpecs: { select: { macWlan: true } },
              intelNucSpecs: { select: { macWlan: true } },
            },
          },
        },
      });
      if (assignment && assignment.userId === finalUserId) {
        macWlanValue =
          assignment.asset?.laptopSpecs?.macWlan ||
          assignment.asset?.intelNucSpecs?.macWlan ||
          null;
      }
    }
  }

  if (macWlanValue !== undefined) {
    update.macWlan = macWlanValue;
  }

  return prisma.ipAddress.update({ where: { id }, data: update });
}

export async function deleteIpAddress(id: number) {
  await prisma.ipAddress.delete({ where: { id } });
}

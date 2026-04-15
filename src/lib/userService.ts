"use server";
import { prisma } from "./prisma";
import { User as PrismaUser } from "@prisma/client";

export interface UserWithAssetStatus {
  id: number;
  namaLengkap: string;
  email: string | null;
  departemen: string | null;
  jabatan: string | null;
  lokasiKantor: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  password: string | null;
  role: string | null;
  assetAssignmentCount: number;
  hasAssignedAsset: boolean;
}

export const getUsers = async (): Promise<UserWithAssetStatus[]> => {
  const users = await prisma.user.findMany({
    orderBy: {
      namaLengkap: "asc",
    },
    include: {
      _count: {
        select: {
          assetAssignments: true,
        },
      },
    },
  });

  return users.map(({ _count, ...user }) => ({
    ...user,
    assetAssignmentCount: _count.assetAssignments,
    hasAssignedAsset: _count.assetAssignments > 0,
  }));
};

export const getUserById = async (id: number): Promise<PrismaUser | null> => {
  return await prisma.user.findUnique({ where: { id } });
};

export const createUser = async (
  data: PrismaUser
): Promise<PrismaUser> => {
  return await prisma.user.create({
    data: {
      ...data,
      isActive: data.isActive ?? true, // Default to true if not provided
    },
  });
};

export const updateUser = async (
  id: number,
  data: Partial<Omit<PrismaUser, "id" | "createdAt" | "updatedAt">>
): Promise<PrismaUser> => {
  return await prisma.user.update({
    where: { id },
    data,
  });
};

export const deleteUser = async (id: number): Promise<PrismaUser> => {
  return await prisma.user.delete({
    where: { id },
  });
};

export const changePassword = async (
  id: number,
  oldPassword: string,
  newPassword: string
): Promise<{ ok: true } | { ok: false; error: string }> => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { password: true },
  });
  if (!user) {
    return { ok: false, error: "User not found" };
  }
  if ((user.password ?? "") !== oldPassword) {
    return { ok: false, error: "Current password is incorrect" };
  }

  await prisma.user.update({ where: { id }, data: { password: newPassword } });
  return { ok: true };
};

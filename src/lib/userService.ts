"use server";
import { prisma } from "./prisma";
import { User } from "@prisma/client";

export const getUsers = async (): Promise<User[]> => {
  return await prisma.user.findMany({
    orderBy: {
      namaLengkap: "asc",
    },
  });
};

export const getUserById = async (id: number): Promise<User | null> => {
  return await prisma.user.findUnique({ where: { id } });
};

export const createUser = async (
  data: User
): Promise<User> => {
  return await prisma.user.create({
    data: {
      ...data,
      isActive: data.isActive ?? true, // Default to true if not provided
    },
  });
};

export const updateUser = async (
  id: number,
  data: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>
): Promise<User> => {
  return await prisma.user.update({
    where: { id },
    data,
  });
};

export const deleteUser = async (id: number): Promise<User> => {
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

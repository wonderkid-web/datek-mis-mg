"use server";
import { prisma } from './prisma';
import { User } from '@prisma/client';

export const getUsers = async (): Promise<User[]> => {
  return await prisma.user.findMany({
    orderBy: {
      namaLengkap: 'asc'
    }
  });
};

export const createUser = async (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
  return await prisma.user.create({
    data: {
      ...data,
      isActive: data.isActive ?? true, // Default to true if not provided
    },
  });
};

export const updateUser = async (id: number, data: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User> => {
  return await prisma.user.update({
    where: { id },
    data,
  });
};

export const deleteUser = async (id: number): Promise<void> => {
  await prisma.user.delete({
    where: { id },
  });
};

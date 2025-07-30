"use server";
import {prisma} from './prisma';
import { Prisma } from '@prisma/client';

export async function getLaptopVgaOptions() {
  try {
    const options = await prisma.laptopVgaOption.findMany();
    return options;
  } catch (error) {
    console.error('Error fetching laptop VGA options:', error);
    throw new Error('Could not fetch laptop VGA options.');
  }
}

export async function createLaptopVgaOption(data: Prisma.LaptopVgaOptionCreateInput) {
  try {
    const option = await prisma.laptopVgaOption.create({
      data,
    });
    return option;
  } catch (error) {
    console.error('Error creating laptop VGA option:', error);
    throw new Error('Could not create laptop VGA option.');
  }
}

export async function updateLaptopVgaOption(id: number, data: Prisma.LaptopVgaOptionUpdateInput) {
  try {
    const option = await prisma.laptopVgaOption.update({
      where: { id },
      data,
    });
    return option;
  } catch (error) {
    console.error(`Error updating laptop VGA option with id ${id}:`, error);
    throw new Error('Could not update laptop VGA option.');
  }
}

export async function deleteLaptopVgaOption(id: number) {
  try {
    const option = await prisma.laptopVgaOption.delete({
      where: { id },
    });
    return option;
  } catch (error) {
    console.error(`Error deleting laptop VGA option with id ${id}:`, error);
    throw new Error('Could not delete laptop VGA option.');
  }
}

"use server";
import {prisma} from './prisma';
import { Prisma } from '@prisma/client';

export async function getLaptopGraphicOptions() {
  try {
    const options = await prisma.laptopGraphicOption.findMany();
    return options;
  } catch (error) {
    console.error('Error fetching laptop graphic options:', error);
    throw new Error('Could not fetch laptop graphic options.');
  }
}

export async function createLaptopGraphicOption(data: Prisma.LaptopGraphicOptionCreateInput) {
  try {
    const option = await prisma.laptopGraphicOption.create({
      data,
    });
    return option;
  } catch (error) {
    console.error('Error creating laptop graphic option:', error);
    throw new Error('Could not create laptop graphic option.');
  }
}

export async function updateLaptopGraphicOption(id: number, data: Prisma.LaptopGraphicOptionUpdateInput) {
  try {
    const option = await prisma.laptopGraphicOption.update({
      where: { id },
      data,
    });
    return option;
  } catch (error) {
    console.error(`Error updating laptop graphic option with id ${id}:`, error);
    throw new Error('Could not update laptop graphic option.');
  }
}

export async function deleteLaptopGraphicOption(id: number) {
  try {
    const option = await prisma.laptopGraphicOption.delete({
      where: { id },
    });
    return option;
  } catch (error) {
    console.error(`Error deleting laptop graphic option with id ${id}:`, error);
    throw new Error('Could not delete laptop graphic option.');
  }
}

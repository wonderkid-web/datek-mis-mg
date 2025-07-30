"use server";
import {prisma} from './prisma';

export async function getAssetAssignments() {
  try {
    const assetAssignments = await prisma.assetAssignment.findMany({
      include: {
        asset: true, // Include related Asset
        user: true,  // Include related User
      },
      where: {
        // Optional: you might want to only show active assignments
        // tanggalPengembalian: null,
      }
    });
    return assetAssignments;
  } catch (error) {
    console.error('Error fetching asset assignments:', error);
    throw new Error('Could not fetch asset assignments.');
  }
}

import { NextResponse } from 'next/server';
import { getAssetAssignments } from '@/lib/assetAssignmentService';

export async function GET() {
  try {
    const assignments = await getAssetAssignments();
    return NextResponse.json(assignments);
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ message: (error as Error).message }),
      { status: 500 }
    );
  }
}


import { NextResponse } from 'next/server';
import {
  updateServiceRecord,
  deleteServiceRecord,
} from '@/lib/serviceRecordService';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    const data = await request.json();
    const updatedServiceRecord = await updateServiceRecord(id, data);
    return NextResponse.json(updatedServiceRecord);
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ message: (error as Error).message }),
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    await deleteServiceRecord(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ message: (error as Error).message }),
      { status: 500 }
    );
  }
}

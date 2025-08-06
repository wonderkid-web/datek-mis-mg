'use server';

import { NextResponse } from 'next/server';
import { updateServiceRecord, deleteServiceRecord } from '@/lib/serviceRecordService';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const body = await request.json();
    const updatedRecord = await updateServiceRecord(id, body);
    return NextResponse.json(updatedRecord);
  } catch (error) {
    console.error(`Error updating service record with id ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = Number(params.id);
        await deleteServiceRecord(id);
        return NextResponse.json({ message: 'Record deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error(`Error deleting service record with id ${params.id}:`, error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
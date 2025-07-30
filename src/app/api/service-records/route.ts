
import { NextResponse } from 'next/server';
import {
  getServiceRecords,
  createServiceRecord,
} from '@/lib/serviceRecordService';

export async function GET() {
  try {
    const serviceRecords = await getServiceRecords();
    return NextResponse.json(serviceRecords);
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ message: (error as Error).message }),
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newServiceRecord = await createServiceRecord(data);
    return NextResponse.json(newServiceRecord, { status: 201 });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ message: (error as Error).message }),
      { status: 400 }
    );
  }
}

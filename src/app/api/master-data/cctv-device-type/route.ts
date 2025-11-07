
import { createCctvDeviceType, getCctvDeviceTypes } from '@/lib/cctvDeviceTypeService';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const deviceTypes = await getCctvDeviceTypes();
    return NextResponse.json(deviceTypes);
  } catch (error) {
    console.error('Error fetching CCTV device types:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newDeviceType = await createCctvDeviceType(body);
    return NextResponse.json(newDeviceType, { status: 201 });
  } catch (error: any) {
    console.error('Error creating CCTV device type:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: `Device type with this value already exists.` }, { status: 409 });
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

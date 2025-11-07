
import { createCctvChannelCamera, getCctvChannelCameras } from '@/lib/cctvChannelCameraService';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const channelCameras = await getCctvChannelCameras();
    return NextResponse.json(channelCameras);
  } catch (error) {
    console.error('Error fetching CCTV channel cameras:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newChannelCamera = await createCctvChannelCamera(body);
    return NextResponse.json(newChannelCamera, { status: 201 });
  } catch (error: any) {
    console.error('Error creating CCTV channel camera:', error);
    // Note: P2002 for unique constraint might not apply here unless you add unique fields
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

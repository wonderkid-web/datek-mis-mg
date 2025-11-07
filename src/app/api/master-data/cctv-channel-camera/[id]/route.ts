
import { getCctvChannelCameraById, updateCctvChannelCamera, deleteCctvChannelCamera } from '@/lib/cctvChannelCameraService';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id ? Number(await params) : undefined;
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    const channelCamera = await getCctvChannelCameraById(id);
    if (!channelCamera) {
      return NextResponse.json({ error: 'Channel camera not found' }, { status: 404 });
    }
    return NextResponse.json(channelCamera);
  } catch (error) {
    console.error('Error fetching CCTV channel camera:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id ? Number(await params) : undefined;
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    const body = await request.json();
    const updatedChannelCamera = await updateCctvChannelCamera(id, body);
    return NextResponse.json(updatedChannelCamera);
  } catch (error: any) {
    console.error('Error updating CCTV channel camera:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Channel camera not found.' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id ? Number(await params) : undefined;
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    await deleteCctvChannelCamera(id);
    return NextResponse.json(
      { message: 'Channel camera deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting CCTV channel camera:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Channel camera not found.' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

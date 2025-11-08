
import { updateCctvDeviceType, deleteCctvDeviceType } from '@/lib/cctvDeviceTypeService';
import { NextResponse } from 'next/server';

// export async function GET(
//   request: Request,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const id = (await params).id ? Number(await params) : undefined;
//     if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
//     const deviceType = await getCctvDeviceTypeById(id);
//     if (!deviceType) {
//       return NextResponse.json({ error: 'Device type not found' }, { status: 404 });
//     }
//     return NextResponse.json(deviceType);
//   } catch (error) {
//     console.error('Error fetching CCTV device type:', error);
//     return NextResponse.json(
//       { error: 'Internal Server Error' },
//       { status: 500 }
//     );
//   }
// }

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id ? Number(await params) : undefined;
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    const body = await request.json();
    const updatedDeviceType = await updateCctvDeviceType(id, body);
    return NextResponse.json(updatedDeviceType);
  } catch (error: any) {
    console.error('Error updating CCTV device type:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Device type not found.' }, { status: 404 });
    }
    if (error.code === 'P2002') {
      return NextResponse.json({ error: `Device type with this value already exists.` }, { status: 409 });
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
    await deleteCctvDeviceType(id);
    return NextResponse.json(
      { message: 'Device type deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting CCTV device type:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Device type not found.' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

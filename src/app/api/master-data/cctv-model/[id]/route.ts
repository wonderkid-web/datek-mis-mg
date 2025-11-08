
import { updateCctvModel, deleteCctvModel } from '@/lib/cctvModelService';
import { NextResponse } from 'next/server';

// export async function GET(
//   request: Request,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const id = (await params).id ? Number(await params) : undefined;
//     if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
//     const model = await getCctvModelById(id);
//     if (!model) {
//       return NextResponse.json({ error: 'Model not found' }, { status: 404 });
//     }
//     return NextResponse.json(model);
//   } catch (error) {
//     console.error('Error fetching CCTV model:', error);
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
    const updatedModel = await updateCctvModel(id, body);
    return NextResponse.json(updatedModel);
  } catch (error: any) {
    console.error('Error updating CCTV model:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Model not found.' }, { status: 404 });
    }
    if (error.code === 'P2002') {
      return NextResponse.json({ error: `Model with this value already exists.` }, { status: 409 });
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
    await deleteCctvModel(id);
    return NextResponse.json(
      { message: 'Model deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting CCTV model:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Model not found.' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

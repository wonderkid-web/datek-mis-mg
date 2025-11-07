
import { getCctvBrandById, updateCctvBrand, deleteCctvBrand } from '@/lib/cctvBrandService';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id ? Number(await params) : undefined;
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    const brand = await getCctvBrandById(id);
    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }
    return NextResponse.json(brand);
  } catch (error) {
    console.error('Error fetching CCTV brand:', error);
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
    const updatedBrand = await updateCctvBrand(id, body);
    return NextResponse.json(updatedBrand);
  } catch (error: any) {
    console.error('Error updating CCTV brand:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Brand not found.' }, { status: 404 });
    }
    if (error.code === 'P2002') {
      return NextResponse.json({ error: `Brand with this value already exists.` }, { status: 409 });
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
    await deleteCctvBrand(id);
    return NextResponse.json(
      { message: 'Brand deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting CCTV brand:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Brand not found.' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

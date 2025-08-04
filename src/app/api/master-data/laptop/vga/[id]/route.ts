
import { NextResponse } from 'next/server';
import {
  updateLaptopVgaOption,
  deleteLaptopVgaOption,
} from '@/lib/laptopVgaService';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = Number((await params).id)
    const data = await request.json();
    const updatedOption = await updateLaptopVgaOption(id, data);
    return NextResponse.json(updatedOption);
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ message: (error as Error).message }),
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = Number((await params).id)
    await deleteLaptopVgaOption(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ message: (error as Error).message }),
      { status: 500 }
    );
  }
}

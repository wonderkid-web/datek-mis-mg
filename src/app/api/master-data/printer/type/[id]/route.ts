import { NextResponse } from 'next/server';
import { updatePrinterTypeOption, deletePrinterTypeOption } from '@/lib/printerTypeService';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updatedOption = await updatePrinterTypeOption(Number(id), body);
    return NextResponse.json(updatedOption);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update printer type option' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deletePrinterTypeOption(Number(id));
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete printer type option' }, { status: 500 });
  }
}


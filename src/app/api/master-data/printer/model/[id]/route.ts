import { NextResponse } from 'next/server';
import { updatePrinterModelOption, deletePrinterModelOption } from '@/lib/printerModelService';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updatedOption = await updatePrinterModelOption(Number(id), body);
    return NextResponse.json(updatedOption);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update printer model option' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deletePrinterModelOption(Number(id));
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete printer model option' }, { status: 500 });
  }
}

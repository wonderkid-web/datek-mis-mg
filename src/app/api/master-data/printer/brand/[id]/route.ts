import { NextResponse } from 'next/server';
import { updatePrinterBrandOption, deletePrinterBrandOption } from '@/lib/printerBrandService';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const updatedOption = await updatePrinterBrandOption(Number(params.id), body);
    return NextResponse.json(updatedOption);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update printer brand option' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await deletePrinterBrandOption(Number(params.id));
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete printer brand option' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getPrinterTypeOptions, createPrinterTypeOption } from '@/lib/printerTypeService';

export async function GET() {
  try {
    const options = await getPrinterTypeOptions();
    return NextResponse.json(options);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch printer type options' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newOption = await createPrinterTypeOption(body);
    return NextResponse.json(newOption, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create printer type option' }, { status: 500 });
  }
}

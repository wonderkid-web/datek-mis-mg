import { NextResponse } from 'next/server';
import { getPrinterBrandOptions, createPrinterBrandOption } from '@/lib/printerBrandService';

export async function GET() {
  try {
    const options = await getPrinterBrandOptions();
    return NextResponse.json(options);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch printer brand options' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newOption = await createPrinterBrandOption(body);
    return NextResponse.json(newOption, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create printer brand option' }, { status: 500 });
  }
}

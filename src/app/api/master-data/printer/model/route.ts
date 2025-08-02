import { NextResponse } from 'next/server';
import { getPrinterModelOptions, createPrinterModelOption } from '@/lib/printerModelService';

export async function GET() {
  try {
    const options = await getPrinterModelOptions();
    return NextResponse.json(options);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch printer model options' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newOption = await createPrinterModelOption(body);
    return NextResponse.json(newOption, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create printer model option' }, { status: 500 });
  }
}


import { NextResponse } from 'next/server';
import {
  getLaptopGraphicOptions,
  createLaptopGraphicOption,
} from '@/lib/laptopGraphicService';

export async function GET() {
  try {
    const options = await getLaptopGraphicOptions();
    return NextResponse.json(options);
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ message: (error as Error).message }),
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newOption = await createLaptopGraphicOption(data);
    return NextResponse.json(newOption, { status: 201 });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ message: (error as Error).message }),
      { status: 400 }
    );
  }
}

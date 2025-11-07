
import { createCctvBrand, getCctvBrands } from '@/lib/cctvBrandService';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const brands = await getCctvBrands();
    return NextResponse.json(brands);
  } catch (error) {
    console.error('Error fetching CCTV brands:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newBrand = await createCctvBrand(body);
    return NextResponse.json(newBrand, { status: 201 });
  } catch (error: any) {
    console.error('Error creating CCTV brand:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: `Brand with this value already exists.` }, { status: 409 });
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

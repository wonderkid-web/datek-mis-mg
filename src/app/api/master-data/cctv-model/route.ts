
import { createCctvModel, getCctvModels } from '@/lib/cctvModelService';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const models = await getCctvModels();
    return NextResponse.json(models);
  } catch (error) {
    console.error('Error fetching CCTV models:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newModel = await createCctvModel(body);
    return NextResponse.json(newModel, { status: 201 });
  } catch (error: any) {
    console.error('Error creating CCTV model:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: `Model with this value already exists.` }, { status: 409 });
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

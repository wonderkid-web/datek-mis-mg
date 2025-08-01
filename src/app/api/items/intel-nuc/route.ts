import { NextResponse } from 'next/server';
import { createAssetAndIntelNucSpecs } from '@/lib/intelNucService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { assetData, intelNucSpecsData } = body;

    if (!assetData || !intelNucSpecsData) {
      return new NextResponse(
        JSON.stringify({ message: 'Missing assetData or intelNucSpecsData' }),
        { status: 400 }
      );
    }

    const newAsset = await createAssetAndIntelNucSpecs(assetData, intelNucSpecsData);
    return NextResponse.json(newAsset, { status: 201 });
  } catch (error) {
    console.error('Error creating asset and Intel NUC specs:', error);
    return new NextResponse(
      JSON.stringify({ message: (error as Error).message }),
      { status: 500 }
    );
  }
}

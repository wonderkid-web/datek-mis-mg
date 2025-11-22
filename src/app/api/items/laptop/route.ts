import { NextResponse } from 'next/server';
import { createAssetAndLaptopSpecs } from '@/lib/assetService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { assetData, laptopSpecsData, officeAccountData } = body;

    if (!assetData || !laptopSpecsData) {
      return new NextResponse(
        JSON.stringify({ message: 'Missing assetData or laptopSpecsData' }),
        { status: 400 }
      );
    }

    const newAsset = await createAssetAndLaptopSpecs(assetData, laptopSpecsData, officeAccountData);
    return NextResponse.json(newAsset, { status: 201 });
  } catch (error) {
    console.error('Error creating asset:', error);
    return new NextResponse(
      JSON.stringify({ message: (error as Error).message }),
      { status: 500 }
    );
  }
}
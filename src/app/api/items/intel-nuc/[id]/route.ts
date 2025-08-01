import { NextResponse } from 'next/server';
import { getIntelNucAssetById, updateAssetAndIntelNucSpecs } from '@/lib/intelNucService';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const asset = await getIntelNucAssetById(id);

    if (!asset) {
      return new NextResponse(JSON.stringify({ message: 'Asset not found' }), { status: 404 });
    }

    return NextResponse.json(asset);
  } catch (error) {
    console.error('Error fetching Intel NUC asset:', error);
    return new NextResponse(
      JSON.stringify({ message: (error as Error).message }),
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { assetData, intelNucSpecsData } = body;

    if (!assetData || !intelNucSpecsData) {
      return new NextResponse(
        JSON.stringify({ message: 'Missing assetData or intelNucSpecsData' }),
        { status: 400 }
      );
    }

    const updatedAsset = await updateAssetAndIntelNucSpecs(id, assetData, intelNucSpecsData);
    return NextResponse.json(updatedAsset);
  } catch (error) {
    console.error('Error updating Intel NUC asset:', error);
    return new NextResponse(
      JSON.stringify({ message: (error as Error).message }),
      { status: 500 }
    );
  }
}

import { updateAssetType, deleteAssetType } from "@/lib/assetTypeService";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const updatedAssetType = await updateAssetType(id, { name });

    return NextResponse.json(updatedAssetType);
  } catch (error: any) {
    console.error("Error updating asset type:", error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Asset type not found." }, { status: 404 });
    } else if (error.code === 'P2002') {
      return NextResponse.json({ error: `Asset type '${error.meta?.target}' already exists.` }, { status: 409 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    await deleteAssetType(id);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("Error deleting asset type:", error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Asset type not found." }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

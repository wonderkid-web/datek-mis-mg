import { createAssetCategory, getAssetCategories } from "@/lib/assetCategoryService";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const assetCategories = await getAssetCategories();
    return NextResponse.json(assetCategories);
  } catch (error) {
    console.error("Error fetching asset categories:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nama } = body;

    if (!nama) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const newAssetCategory = await createAssetCategory({ nama });

    return NextResponse.json(newAssetCategory, { status: 201 });
  } catch (error: any) {
    console.error("Error creating asset category:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: `Asset category with this name already exists.` }, { status: 409 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { createAssetAndPrinterSpecs } from "@/lib/printerService";

export async function POST(request: Request) {
  try {
    const { assetData, printerSpecsData } = await request.json();
    const result = await createAssetAndPrinterSpecs(assetData, printerSpecsData);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating asset and printer specs:", error);
    return NextResponse.json(
      { error: "Failed to create asset and printer specs" },
      { status: 500 }
    );
  }
}

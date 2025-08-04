import { NextResponse } from "next/server";
import {
  updatePrinterBrandOption,
  deletePrinterBrandOption,
} from "@/lib/printerBrandService";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;
    const updatedOption = await updatePrinterBrandOption(Number(id), body);
    return NextResponse.json(updatedOption);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update printer brand option" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deletePrinterBrandOption(Number(id));
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete printer brand option" },
      { status: 500 }
    );
  }
}

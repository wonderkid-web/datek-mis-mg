import { NextResponse } from "next/server";
import {
  updateLaptopOsOption,
  deleteLaptopOsOption,
} from "@/lib/laptopOsService";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updatedOption = await updateLaptopOsOption(Number(id), body);
    return NextResponse.json(updatedOption);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update laptop OS option" },
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
    await deleteLaptopOsOption(Number(id));
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete laptop OS option" },
      { status: 500 }
    );
  }
}

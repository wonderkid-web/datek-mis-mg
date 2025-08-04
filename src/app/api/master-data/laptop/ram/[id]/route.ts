import { updateLaptopRamOption, deleteLaptopRamOption } from "@/lib/laptopRamService";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = Number((await params).id)
    const body = await request.json();
    const { value } = body;

    if (!value) {
      return NextResponse.json({ error: "Value is required" }, { status: 400 });
    }

    const updatedLaptopRamOption = await updateLaptopRamOption(id, { value });

    return NextResponse.json(updatedLaptopRamOption);
  } catch (error: any) {
    console.error("Error updating laptop RAM option:", error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Laptop RAM option not found." }, { status: 404 });
    } else if (error.code === 'P2002') {
      return NextResponse.json({ error: `Laptop RAM option with this value already exists.` }, { status: 409 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = Number((await params).id)
    await deleteLaptopRamOption(id);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("Error deleting laptop RAM option:", error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Laptop RAM option not found." }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
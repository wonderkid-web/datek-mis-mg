import { updateLaptopPortOption, deleteLaptopPortOption } from "@/lib/laptopPortService";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    const body = await request.json();
    const { value } = body;

    if (!value) {
      return NextResponse.json({ error: "Value is required" }, { status: 400 });
    }

    const updatedLaptopPortOption = await updateLaptopPortOption(id, { value });

    return NextResponse.json(updatedLaptopPortOption);
  } catch (error: any) {
    console.error("Error updating laptop port option:", error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Laptop port option not found." }, { status: 404 });
    } else if (error.code === 'P2002') {
      return NextResponse.json({ error: `Laptop port option with this value already exists.` }, { status: 409 });
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
    await deleteLaptopPortOption(id);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("Error deleting laptop port option:", error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Laptop port option not found." }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
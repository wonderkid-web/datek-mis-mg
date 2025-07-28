import { updateRam, deleteRam } from "@/lib/ramService";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10); // Convert id to number for service function
    const body = await request.json();
    const { name } = body; // Use 'name' as per MasterDataItem

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const updatedRamOption = await updateRam(id, { name });

    return NextResponse.json(updatedRamOption);
  } catch (error: any) {
    console.error("Error updating RAM option:", error);
    if (error.code === 'P2025') { // Record to update not found
      return NextResponse.json({ error: "RAM option not found." }, { status: 404 });
    } else if (error.code === 'P2002') { // Unique constraint violation
      return NextResponse.json({ error: `RAM option with value '${name}' already exists.` }, { status: 409 });
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
    const id = parseInt(params.id, 10); // Convert id to number for service function
    await deleteRam(id);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("Error deleting RAM option:", error);
    if (error.code === 'P2025') { // Record to delete not found
        return NextResponse.json({ error: "RAM option not found." }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

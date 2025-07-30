import { NextResponse } from "next/server";
import {
  updateLaptopGraphicOption,
  deleteLaptopGraphicOption,
} from "@/lib/laptopGraphicService";

// PUT /api/laptop-graphics/[id]
export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const id = parseInt(context.params.id, 10);
    const data = await request.json();
    const updatedOption = await updateLaptopGraphicOption(id, data);

    return NextResponse.json(updatedOption, { status: 200 });
  } catch (error) {
    console.error("Update failed:", error);
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 400 }
    );
  }
}

// DELETE /api/laptop-graphics/[id]
export async function DELETE(
  _req: Request,
  context: { params: { id: string } }
) {
  try {
    const id = parseInt(context.params.id, 10);
    await deleteLaptopGraphicOption(id);

    // 204 biasanya tidak mengembalikan body
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Delete failed:", error);
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }
}

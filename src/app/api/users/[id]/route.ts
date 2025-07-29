import { updateUser, deleteUser } from "@/lib/userService";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    const body = await request.json();
    const updatedUser = await updateUser(id, body);
    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error("Error updating user:", error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    } else if (error.code === 'P2002') {
      return NextResponse.json({ error: `User with this NIK or email already exists.` }, { status: 409 });
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
    await deleteUser(id);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

import { updateUser, deleteUser } from "@/lib/userService";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const body = await request.json();

    // Hash password if it exists in the body
    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10);
    }

    const updatedUser = await updateUser(id, body);
    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error("Error updating user:", error);
    if (error.code === "P2025") {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    } else if (error.code === "P2002") {
      return NextResponse.json(
        { error: `User with this email already exists.` },
        { status: 409 }
      );
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
    const id = Number(params.id);
    await deleteUser(id);
    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting user:", error);
    if (error.code === "P2025") {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


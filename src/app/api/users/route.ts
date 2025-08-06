import { createUser, getUsers } from "@/lib/userService";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const users = await getUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Set default values for new users
    body.role = 'operator';
    body.password = await bcrypt.hash('changeme123', 10);

    const newUser = await createUser(body);
    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    console.error("Error creating user:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: `User with this email already exists.` }, { status: 409 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
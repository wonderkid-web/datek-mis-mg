import { getStorages, createStorage } from "@/lib/storageService";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const storages = await getStorages();
    return NextResponse.json(storages);
  } catch (error) {
    console.error("Error fetching storages:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const newStorage = await createStorage({ name });

    return NextResponse.json(newStorage, { status: 201 });
  } catch (error: any) {
    console.error("Error creating storage:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: `Storage '${error.meta?.target}' already exists.` }, { status: 409 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
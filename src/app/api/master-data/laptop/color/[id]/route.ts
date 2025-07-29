import { updateLaptopColor, deleteLaptopColor } from "@/lib/laptopColorService"
import { NextResponse } from "next/server"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idString } = await params
    const id = Number.parseInt(idString, 10)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid laptop color option ID." }, { status: 400 })
    }

    const body = await request.json()
    const { value } = body

    if (!value) {
      return NextResponse.json({ error: "Value is required" }, { status: 400 })
    }

    const updatedLaptopColor = await updateLaptopColor(id, { value })
    return NextResponse.json(updatedLaptopColor)
  } catch (error: any) {
    console.error("Error updating laptop color option:", error)

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Laptop color option not found." }, { status: 404 })
    } else if (error.code === "P2002") {
      return NextResponse.json({ error: "Laptop color option with this value already exists." }, { status: 409 })
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idString } = await params
    const id = Number.parseInt(idString, 10)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid laptop color option ID." }, { status: 400 })
    }

    await deleteLaptopColor(id)
    return new NextResponse(null, { status: 204 })
  } catch (error: any) {
    console.error("Error deleting laptop color option:", error)

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Laptop color option not found." }, { status: 404 })
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

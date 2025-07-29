import { updateLaptopMicrosoftOffice, deleteLaptopMicrosoftOffice } from "@/lib/laptopMicrosoftOfficeService"
import { NextResponse } from "next/server"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idString } = await params
    const id = Number.parseInt(idString, 10)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid laptop Microsoft Office option ID." }, { status: 400 })
    }

    const body = await request.json()
    const { value } = body

    if (!value) {
      return NextResponse.json({ error: "Value is required" }, { status: 400 })
    }

    const updatedLaptopMicrosoftOffice = await updateLaptopMicrosoftOffice(id, { value })
    return NextResponse.json(updatedLaptopMicrosoftOffice)
  } catch (error: any) {
    console.error("Error updating laptop Microsoft Office option:", error)

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Laptop Microsoft Office option not found." }, { status: 404 })
    } else if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Laptop Microsoft Office option with this value already exists." },
        { status: 409 },
      )
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idString } = await params
    const id = Number.parseInt(idString, 10)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid laptop Microsoft Office option ID." }, { status: 400 })
    }

    await deleteLaptopMicrosoftOffice(id)
    return new NextResponse(null, { status: 204 })
  } catch (error: any) {
    console.error("Error deleting laptop Microsoft Office option:", error)

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Laptop Microsoft Office option not found." }, { status: 404 })
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

import { updateAssignment, deleteAssignment, getAssignmentById } from "@/lib/assignmentService"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idString } = await params
    const id = Number.parseInt(idString, 10)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid assignment ID." }, { status: 400 })
    }

    const assignment = await getAssignmentById(id)

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found." }, { status: 404 })
    }

    return NextResponse.json(assignment)
  } catch (error: any) {
    console.error("Error fetching assignment:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idString } = await params
    const id = Number.parseInt(idString, 10)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid assignment ID." }, { status: 400 })
    }

    const body = await request.json()
    const updatedAssignment = await updateAssignment(id, body)

    return NextResponse.json(updatedAssignment)
  } catch (error: any) {
    console.error("Error updating assignment:", error)

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Assignment not found." }, { status: 404 })
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idString } = await params
    const id = Number.parseInt(idString, 10)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid assignment ID." }, { status: 400 })
    }

    await deleteAssignment(id)

    return new NextResponse(null, { status: 204 })
  } catch (error: any) {
    console.error("Error deleting assignment:", error)

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Assignment not found." }, { status: 404 })
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

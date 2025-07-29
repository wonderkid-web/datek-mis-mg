import { createAssignment, getAssignments } from "@/lib/assignmentService";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const assignments = await getAssignments();
    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newAssignment = await createAssignment(body);
    return NextResponse.json(newAssignment, { status: 201 });
  } catch (error: any) {
    console.error("Error creating assignment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
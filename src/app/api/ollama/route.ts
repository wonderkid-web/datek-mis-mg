import { NextRequest, NextResponse } from "next/server";
import ollama from "ollama"

export async function GET(req: NextRequest) {

    const chat = await ollama.chat({
        model: "deepseek-r1:1.5b",
        messages: [{ role: "user", content: "9 + 18" }]
    })

    return NextResponse.json({ message: "Cool", response: chat.message.content })
}
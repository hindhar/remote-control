import { NextRequest, NextResponse } from "next/server";
import { samsungTV } from "@/lib/samsung-client";

export async function POST(request: NextRequest) {
  try {
    const { key } = await request.json();

    if (!key) {
      return NextResponse.json({ error: "Key required" }, { status: 400 });
    }

    await samsungTV.sendKey(key);

    return NextResponse.json({ success: true, key });
  } catch (error) {
    console.error("TV Key Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send key" },
      { status: 500 }
    );
  }
}

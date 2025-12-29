import { NextResponse } from "next/server";
import { samsungTV } from "@/lib/samsung-client";
import { TV_CONFIG } from "@/lib/tv-config";

export async function POST() {
  try {
    const connected = await samsungTV.connect();

    return NextResponse.json({
      success: connected,
      connected: samsungTV.isConnected(),
      message: connected
        ? "Connected to TV - subsequent commands won't need re-authorization"
        : "Failed to connect - check TV is on and try again",
    });
  } catch (error) {
    console.error("Connect Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to connect" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    name: TV_CONFIG.name,
    ip: TV_CONFIG.ip,
    connected: samsungTV.isConnected(),
  });
}

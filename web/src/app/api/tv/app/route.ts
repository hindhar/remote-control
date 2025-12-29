import { NextRequest, NextResponse } from "next/server";
import { TV_CONFIG, SAMSUNG_APPS } from "@/lib/tv-config";

export async function POST(request: NextRequest) {
  try {
    const { app } = await request.json();

    if (!app) {
      return NextResponse.json({ error: "App name required" }, { status: 400 });
    }

    // Get app ID from mapping or use directly
    const appId = SAMSUNG_APPS[app.toLowerCase()] || app;

    // Use REST API to launch app (more reliable than WebSocket)
    const response = await fetch(
      `http://${TV_CONFIG.ip}:8001/api/v2/applications/${appId}`,
      { method: 'POST' }
    );

    const result = await response.text();

    if (result === 'true' || response.ok) {
      console.log(`[Samsung] Launched app via REST: ${app} (${appId})`);
      return NextResponse.json({ success: true, app, appId });
    } else {
      return NextResponse.json(
        { error: `Failed to launch app: ${result}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("TV App Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to launch app" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { TV_CONFIG } from "@/lib/tv-config";
import * as net from "net";

export async function GET() {
  try {
    const isOnline = await checkPort(TV_CONFIG.ip, TV_CONFIG.wsPort);

    return NextResponse.json({
      name: TV_CONFIG.name,
      ip: TV_CONFIG.ip,
      online: isOnline,
      status: isOnline ? "on" : "standby",
    });
  } catch (error) {
    return NextResponse.json({
      name: TV_CONFIG.name,
      ip: TV_CONFIG.ip,
      online: false,
      status: "offline",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

function checkPort(host: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();

    socket.setTimeout(2000);

    socket.on("connect", () => {
      socket.destroy();
      resolve(true);
    });

    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });

    socket.on("error", () => {
      socket.destroy();
      resolve(false);
    });

    socket.connect(port, host);
  });
}

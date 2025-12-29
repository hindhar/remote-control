import { NextResponse } from "next/server";
import { TV_CONFIG } from "@/lib/tv-config";
import * as dgram from "dgram";

export async function POST() {
  try {
    const results = await Promise.allSettled([
      // Method 1: Standard broadcast
      sendWakeOnLan(TV_CONFIG.mac, "255.255.255.255"),
      // Method 2: Subnet broadcast (192.168.0.255)
      sendWakeOnLan(TV_CONFIG.mac, getSubnetBroadcast(TV_CONFIG.ip)),
      // Method 3: Direct to TV IP (some TVs accept this)
      sendWakeOnLan(TV_CONFIG.mac, TV_CONFIG.ip),
      // Method 4: Samsung SecureWakeOnLan port 9
      sendWakeOnLan(TV_CONFIG.mac, "255.255.255.255", 9),
      // Method 5: Alternative port 7 (common WoL port)
      sendWakeOnLan(TV_CONFIG.mac, "255.255.255.255", 7),
    ]);

    const successes = results.filter((r) => r.status === "fulfilled").length;

    return NextResponse.json({
      success: successes > 0,
      message: `Wake-on-LAN sent (${successes}/5 methods succeeded)`,
      note: "TV must be in standby mode (not fully powered off) for WoL to work. Enable 'Quick Start' or 'Networked Standby' in TV settings.",
    });
  } catch (error) {
    console.error("Wake Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send WoL" },
      { status: 500 }
    );
  }
}

function getSubnetBroadcast(ip: string): string {
  const parts = ip.split(".");
  parts[3] = "255";
  return parts.join(".");
}

function sendWakeOnLan(mac: string, broadcast: string, port: number = 9): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      socket.close();
      reject(new Error("WoL timeout"));
    }, 3000);

    const macBytes = Buffer.from(mac.replace(/[:-]/g, ""), "hex");

    // Magic packet: 6 bytes of 0xFF followed by MAC repeated 16 times
    const magicPacket = Buffer.alloc(102);
    magicPacket.fill(0xff, 0, 6);
    for (let i = 0; i < 16; i++) {
      macBytes.copy(magicPacket, 6 + i * 6);
    }

    const socket = dgram.createSocket("udp4");

    socket.on("error", (err) => {
      clearTimeout(timeout);
      socket.close();
      reject(err);
    });

    socket.bind(() => {
      socket.setBroadcast(true);
      socket.send(magicPacket, 0, magicPacket.length, port, broadcast, (err) => {
        clearTimeout(timeout);
        socket.close();
        if (err) reject(err);
        else resolve();
      });
    });
  });
}

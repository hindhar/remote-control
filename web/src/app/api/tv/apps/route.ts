// ============================================================================
// TV Apps API - Get list of installed apps from Samsung TV
// ============================================================================

import { NextResponse } from 'next/server';
import { samsungTV } from '@/lib/samsung-client';

export async function GET() {
  try {
    // Ensure we're connected
    const connected = await samsungTV.connect();
    if (!connected) {
      return NextResponse.json(
        { error: 'Failed to connect to TV' },
        { status: 500 }
      );
    }

    // Request installed apps list
    const apps = await samsungTV.getInstalledAppsWithResponse();

    return NextResponse.json({
      success: true,
      apps,
    });
  } catch (error) {
    console.error('TV Apps Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get apps' },
      { status: 500 }
    );
  }
}

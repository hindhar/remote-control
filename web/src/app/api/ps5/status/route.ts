// ============================================================================
// PS5 Status API - Get PlayStation 5 status
// ============================================================================

import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { PS5_CONFIG } from '@/lib/tv-config';

const execAsync = promisify(exec);

export async function GET() {
  try {
    const pythonPath = '/opt/homebrew/Caskroom/miniconda/base/bin/python3';
    const { stdout, stderr } = await execAsync(`${pythonPath} -c "
import json
import asyncio
from pyremoteplay import RPDevice

async def get_status():
    device = RPDevice('${PS5_CONFIG.ip}')
    status = await device.async_get_status()

    if status:
        result = {
            'online': True,
            'status': status.get('status', 'Unknown'),
            'name': status.get('host-name', 'PlayStation 5'),
            'running_app': status.get('running-app-name'),
            'running_app_id': status.get('running-app-titleid'),
        }
    else:
        result = {
            'online': False,
            'status': 'Offline',
            'name': 'PlayStation 5',
        }

    print(json.dumps(result))

asyncio.run(get_status())
"`, { timeout: 10000 });

    const status = JSON.parse(stdout.trim());

    return NextResponse.json({
      success: true,
      ...status,
      ip: PS5_CONFIG.ip,
    });
  } catch (error) {
    console.error('PS5 status error:', error);
    return NextResponse.json({
      success: false,
      online: false,
      status: 'Error',
      name: 'PlayStation 5',
      ip: PS5_CONFIG.ip,
      error: error instanceof Error ? error.message : 'Failed to get status',
    });
  }
}

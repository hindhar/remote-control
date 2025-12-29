// ============================================================================
// PS5 Power API - Wake or standby PlayStation 5
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { PS5_CONFIG } from '@/lib/tv-config';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { action } = (body as { action?: string }) || {};

    if (action !== 'wake' && action !== 'standby') {
      return NextResponse.json(
        { error: 'Action must be "wake" or "standby"' },
        { status: 400 }
      );
    }

    const pythonPath = '/opt/homebrew/Caskroom/miniconda/base/bin/python3';

    if (action === 'wake') {
      // Wake PS5 from standby
      const { stdout, stderr } = await execAsync(`${pythonPath} -c "
import asyncio
from pyremoteplay import RPDevice

async def wake():
    device = RPDevice('${PS5_CONFIG.ip}')
    status = await device.async_get_status()

    if not status:
        print('ERROR:PS5 not found on network')
        return

    if status.get('status') != 'Standby':
        print('PS5 is already awake')
        return

    success = await device.async_wakeup()
    if success:
        print('PS5 waking up...')
    else:
        print('ERROR:Failed to wake PS5. Make sure it is registered.')

asyncio.run(wake())
"`, { timeout: 15000 });

      const output = stdout.trim();
      if (output.startsWith('ERROR:')) {
        return NextResponse.json(
          { success: false, error: output.replace('ERROR:', '') },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, message: output });
    } else {
      // Put PS5 to standby
      const { stdout } = await execAsync(`${pythonPath} -c "
import asyncio
from pyremoteplay import RPDevice

async def standby():
    device = RPDevice('${PS5_CONFIG.ip}')
    status = await device.async_get_status()

    if not status:
        print('ERROR:PS5 not found on network')
        return

    if status.get('status') == 'Standby':
        print('PS5 is already in standby')
        return

    try:
        await device.async_connect()
        await device.async_wait_for_session()
        await device.async_standby()
        print('PS5 entering standby...')
    except Exception as e:
        print(f'ERROR:{str(e)}')
    finally:
        await device.async_disconnect()

asyncio.run(standby())
"`, { timeout: 15000 });

      const output = stdout.trim();
      if (output.startsWith('ERROR:')) {
        return NextResponse.json(
          { success: false, error: output.replace('ERROR:', '') },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, message: output });
    }
  } catch (error) {
    console.error('PS5 power error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to control PS5 power' },
      { status: 500 }
    );
  }
}

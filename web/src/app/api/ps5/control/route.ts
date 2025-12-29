// ============================================================================
// PS5 Control API - Send button presses to PlayStation 5
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { PS5_CONFIG, PS5_BUTTONS } from '@/lib/tv-config';

const VALID_BUTTONS = Object.keys(PS5_BUTTONS);

function isValidButton(button: string): boolean {
  return VALID_BUTTONS.includes(button.toLowerCase());
}

async function sendPS5Button(
  ip: string,
  button: string
): Promise<{ success: boolean; message: string; error?: string }> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve({ success: false, message: '', error: 'Operation timed out' });
    }, 10000);

    const buttonCode = PS5_BUTTONS[button.toLowerCase()] || button.toUpperCase();

    // Python script using pyremoteplay
    const script = `
import sys
import asyncio
from pyremoteplay import RPDevice

async def send_button():
    ip = sys.argv[1]
    button = sys.argv[2]

    device = RPDevice(ip)

    # Check if device is available
    status = await device.async_get_status()
    if not status:
        print("ERROR:PS5 not found or not responding")
        return

    if status.get('status') == 'Standby':
        print("ERROR:PS5 is in standby mode. Wake it first.")
        return

    # Connect to the device
    try:
        await device.async_connect()
        await device.async_wait_for_session()

        # Send the button press
        await device.controller.async_button(button, action="tap")
        await asyncio.sleep(0.1)

        print(f"Sent: {button}")
    except Exception as e:
        print(f"ERROR:{str(e)}")
    finally:
        await device.async_disconnect()

asyncio.run(send_button())
`;

    const pythonPath = '/opt/homebrew/Caskroom/miniconda/base/bin/python3';
    const proc = spawn(pythonPath, ['-c', script, ip, buttonCode], {
      timeout: 10000,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      clearTimeout(timeout);
      const output = stdout.trim();

      if (output.startsWith('ERROR:')) {
        resolve({
          success: false,
          message: '',
          error: output.replace('ERROR:', ''),
        });
      } else if (code === 0 && output) {
        resolve({ success: true, message: output });
      } else {
        resolve({
          success: false,
          message: '',
          error: stderr || 'Failed to send button',
        });
      }
    });

    proc.on('error', (err) => {
      clearTimeout(timeout);
      resolve({ success: false, message: '', error: err.message });
    });
  });
}

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (typeof body !== 'object' || body === null) {
      return NextResponse.json(
        { error: 'Request body must be an object' },
        { status: 400 }
      );
    }

    const { button } = body as { button?: unknown };

    if (typeof button !== 'string') {
      return NextResponse.json(
        { error: 'Button must be a string' },
        { status: 400 }
      );
    }

    if (!isValidButton(button)) {
      return NextResponse.json(
        {
          error: `Invalid button: ${button}. Valid buttons: ${VALID_BUTTONS.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const result = await sendPS5Button(PS5_CONFIG.ip, button);

    if (result.success) {
      return NextResponse.json({
        success: true,
        button,
        message: result.message,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to control PS5' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('PS5 control error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to control PS5' },
      { status: 500 }
    );
  }
}

// ============================================================================
// Chromecast Control API - Secure Implementation
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { CHROMECAST_CONFIG, RATE_LIMITS } from '@/lib/tv-config';
import {
  isValidChromecastAction,
  isValidVolumeValue,
  type ChromecastAction,
} from '@/types';

// Rate limiting state
const requestCounts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const limit = RATE_LIMITS.chromecast;
  const state = requestCounts.get(clientId);

  if (!state || now > state.resetTime) {
    requestCounts.set(clientId, { count: 1, resetTime: now + limit.windowMs });
    return true;
  }

  if (state.count >= limit.maxRequests) {
    return false;
  }

  state.count++;
  return true;
}

// Secure Python script execution with argument passing
async function executePythonScript(
  action: ChromecastAction,
  ip: string,
  value?: number
): Promise<{ success: boolean; message: string; error?: string }> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve({ success: false, message: '', error: 'Operation timed out' });
    }, 15000);

    // Build Python code based on action - NO USER INPUT IN CODE
    const actionCode = getActionCode(action);
    if (!actionCode) {
      clearTimeout(timeout);
      resolve({ success: false, message: '', error: 'Invalid action' });
      return;
    }

    // Python script with placeholders for safe argument passing
    const script = `
import sys
import pychromecast

ip = sys.argv[1]
action = sys.argv[2]
value = float(sys.argv[3]) if len(sys.argv) > 3 else None

casts, browser = pychromecast.get_chromecasts(timeout=5)
cc = None
for c in casts:
    if str(c.cast_info.host) == ip:
        cc = c
        break

if not cc:
    print("ERROR:Chromecast not found at " + ip)
    pychromecast.discovery.stop_discovery(browser)
    sys.exit(1)

cc.wait(timeout=5)

try:
    if action == "volume" and value is not None:
        cc.set_volume(value / 100.0)
        print(f"Volume set to {int(value)}%")
    elif action == "mute":
        cc.set_volume_muted(True)
        print("Muted")
    elif action == "unmute":
        cc.set_volume_muted(False)
        print("Unmuted")
    elif action == "volup":
        new_vol = min(1.0, cc.status.volume_level + 0.1)
        cc.set_volume(new_vol)
        print(f"Volume: {int(new_vol * 100)}%")
    elif action == "voldown":
        new_vol = max(0.0, cc.status.volume_level - 0.1)
        cc.set_volume(new_vol)
        print(f"Volume: {int(new_vol * 100)}%")
    elif action == "play":
        cc.media_controller.play()
        print("Playing")
    elif action == "pause":
        cc.media_controller.pause()
        print("Paused")
    elif action == "stop":
        cc.media_controller.stop()
        print("Stopped")
    elif action == "rewind":
        mc = cc.media_controller
        if mc.status and mc.status.current_time:
            mc.seek(max(0, mc.status.current_time - 10))
        print("Rewound 10s")
    elif action == "forward":
        mc = cc.media_controller
        if mc.status and mc.status.current_time:
            mc.seek(mc.status.current_time + 10)
        print("Forward 10s")
    elif action == "seek" and value is not None:
        cc.media_controller.seek(value)
        print(f"Seeked to {value}s")
    else:
        print(f"ERROR:Unknown action: {action}")
except Exception as e:
    print(f"ERROR:{str(e)}")
finally:
    pychromecast.discovery.stop_discovery(browser)
`;

    // Use spawn with args array - NEVER shell interpolation
    const args = ['-c', script, ip, action];
    if (value !== undefined) {
      args.push(String(value));
    }

    const pythonPath = '/opt/homebrew/Caskroom/miniconda/base/bin/python3';
    const proc = spawn(pythonPath, args, {
      timeout: 15000,
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
      } else if (code === 0) {
        resolve({ success: true, message: output });
      } else {
        resolve({
          success: false,
          message: '',
          error: stderr || 'Command failed',
        });
      }
    });

    proc.on('error', (err) => {
      clearTimeout(timeout);
      resolve({ success: false, message: '', error: err.message });
    });
  });
}

function getActionCode(action: ChromecastAction): string | null {
  const validActions: ChromecastAction[] = [
    'play',
    'pause',
    'stop',
    'volume',
    'mute',
    'unmute',
    'seek',
    'volup',
    'voldown',
    'rewind',
    'forward',
  ];
  return validActions.includes(action) ? action : null;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    if (!checkRateLimit(clientId)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please slow down.' },
        { status: 429 }
      );
    }

    // Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    if (typeof body !== 'object' || body === null) {
      return NextResponse.json(
        { error: 'Request body must be an object' },
        { status: 400 }
      );
    }

    const { action, value } = body as { action?: unknown; value?: unknown };

    // Validate action
    if (typeof action !== 'string') {
      return NextResponse.json(
        { error: 'Action must be a string' },
        { status: 400 }
      );
    }

    if (!isValidChromecastAction(action)) {
      return NextResponse.json(
        {
          error: `Invalid action: ${action}. Valid actions are: play, pause, stop, volume, mute, unmute, seek, volup, voldown, rewind, forward`,
        },
        { status: 400 }
      );
    }

    // Validate value for volume/seek actions
    let validatedValue: number | undefined;
    if (action === 'volume') {
      if (!isValidVolumeValue(value)) {
        return NextResponse.json(
          { error: 'Volume must be a number between 0 and 100' },
          { status: 400 }
        );
      }
      validatedValue = value;
    } else if (action === 'seek') {
      if (typeof value !== 'number' || value < 0 || !Number.isFinite(value)) {
        return NextResponse.json(
          { error: 'Seek value must be a non-negative number (seconds)' },
          { status: 400 }
        );
      }
      validatedValue = value;
    }

    // Execute the action securely
    const ip = CHROMECAST_CONFIG.ip;
    const result = await executePythonScript(action, ip, validatedValue);

    if (result.success) {
      return NextResponse.json({
        success: true,
        action,
        message: result.message,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to control Chromecast',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Chromecast control error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to control Chromecast',
      },
      { status: 500 }
    );
  }
}

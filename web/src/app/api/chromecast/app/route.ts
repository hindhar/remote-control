// ============================================================================
// Chromecast App Launch API - Launch apps on Chromecast
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { CHROMECAST_CONFIG, CHROMECAST_APPS } from '@/lib/tv-config';

const VALID_APPS = Object.keys(CHROMECAST_APPS);

function isValidApp(app: string): boolean {
  return VALID_APPS.includes(app.toLowerCase());
}

async function launchChromecastApp(
  ip: string,
  appId: string,
  appName: string
): Promise<{ success: boolean; message: string; error?: string }> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve({ success: false, message: '', error: 'Operation timed out' });
    }, 20000);

    const script = `
import sys
import pychromecast

ip = sys.argv[1]
app_id = sys.argv[2]
app_name = sys.argv[3]

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
    # Launch the app
    cc.start_app(app_id)
    print(f"Launched {app_name}")
except Exception as e:
    print(f"ERROR:{str(e)}")
finally:
    pychromecast.discovery.stop_discovery(browser)
`;

    const pythonPath = '/opt/homebrew/Caskroom/miniconda/base/bin/python3';
    const proc = spawn(pythonPath, ['-c', script, ip, appId, appName], {
      timeout: 20000,
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
        resolve({ success: true, message: output || `Launched ${appName}` });
      } else {
        resolve({
          success: false,
          message: '',
          error: stderr || 'Failed to launch app',
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

    const { app } = body as { app?: unknown };

    if (typeof app !== 'string') {
      return NextResponse.json(
        { error: 'App must be a string' },
        { status: 400 }
      );
    }

    if (!isValidApp(app)) {
      return NextResponse.json(
        {
          error: `Invalid app: ${app}. Valid apps: ${VALID_APPS.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const appConfig = CHROMECAST_APPS[app.toLowerCase()];
    const result = await launchChromecastApp(
      CHROMECAST_CONFIG.ip,
      appConfig.id,
      appConfig.name
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        app: appConfig.name,
        message: result.message,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to launch app' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Chromecast app error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to launch app' },
      { status: 500 }
    );
  }
}

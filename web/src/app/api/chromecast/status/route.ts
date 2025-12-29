import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function GET() {
  try {
    // Use Python script to get Chromecast status
    const pythonPath = '/opt/homebrew/Caskroom/miniconda/base/bin/python3';
    const { stdout } = await execAsync(`${pythonPath} -c "
import pychromecast
import json

casts, browser = pychromecast.get_chromecasts(timeout=5)
result = []

for cc in casts:
    cc.wait(timeout=5)
    info = cc.cast_info
    result.append({
        'name': cc.name,
        'ip': str(info.host),
        'port': info.port,
        'model': info.model_name,
        'app': cc.app_display_name,
        'standby': cc.status.is_stand_by if cc.status else None,
        'volume': int(cc.status.volume_level * 100) if cc.status else None,
        'muted': cc.status.volume_muted if cc.status else None,
    })

pychromecast.discovery.stop_discovery(browser)
print(json.dumps(result))
"`, { timeout: 15000 });

    const chromecasts = JSON.parse(stdout.trim());

    return NextResponse.json({
      success: true,
      devices: chromecasts,
    });
  } catch (error) {
    console.error("Chromecast status error:", error);
    return NextResponse.json({
      success: false,
      devices: [],
      error: error instanceof Error ? error.message : "Failed to get status",
    });
  }
}

// ============================================================================
// Chromecast Cast Media API - Cast images, videos, or audio to Chromecast
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { CHROMECAST_CONFIG, RATE_LIMITS } from '@/lib/tv-config';

// Rate limiting
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

// Valid media types
const VALID_MEDIA_TYPES = ['image', 'video', 'audio'] as const;
type MediaType = typeof VALID_MEDIA_TYPES[number];

function isValidMediaType(type: string): type is MediaType {
  return VALID_MEDIA_TYPES.includes(type as MediaType);
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// MIME type mapping
const MIME_TYPES: Record<MediaType, Record<string, string>> = {
  image: {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    bmp: 'image/bmp',
  },
  video: {
    mp4: 'video/mp4',
    webm: 'video/webm',
    mkv: 'video/x-matroska',
    avi: 'video/x-msvideo',
    mov: 'video/quicktime',
  },
  audio: {
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    flac: 'audio/flac',
    aac: 'audio/aac',
  },
};

function getMimeType(url: string, mediaType: MediaType): string {
  const ext = url.split('.').pop()?.toLowerCase().split('?')[0] || '';
  return MIME_TYPES[mediaType][ext] || `${mediaType}/*`;
}

async function castMedia(
  ip: string,
  url: string,
  mediaType: MediaType,
  title?: string
): Promise<{ success: boolean; message: string; error?: string }> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve({ success: false, message: '', error: 'Operation timed out' });
    }, 20000);

    const mimeType = getMimeType(url, mediaType);

    const script = `
import sys
import pychromecast
import time

ip = sys.argv[1]
url = sys.argv[2]
mime_type = sys.argv[3]
title = sys.argv[4] if len(sys.argv) > 4 else "Cast from Remote"

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
mc = cc.media_controller

try:
    # Cast the media
    mc.play_media(url, mime_type, title=title)
    mc.block_until_active(timeout=10)
    print(f"Casting: {title}")
except Exception as e:
    print(f"ERROR:{str(e)}")
finally:
    pychromecast.discovery.stop_discovery(browser)
`;

    const args = ['-c', script, ip, url, mimeType];
    if (title) {
      args.push(title);
    }

    const pythonPath = '/opt/homebrew/Caskroom/miniconda/base/bin/python3';
    const proc = spawn(pythonPath, args, {
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
        resolve({ success: true, message: output || 'Media casting started' });
      } else {
        resolve({
          success: false,
          message: '',
          error: stderr || 'Cast failed',
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

    // Parse request
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

    const { url, type, title } = body as {
      url?: unknown;
      type?: unknown;
      title?: unknown;
    };

    // Validate URL
    if (typeof url !== 'string' || !isValidUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid URL. Must be a valid http/https URL.' },
        { status: 400 }
      );
    }

    // Validate type
    const mediaType = typeof type === 'string' ? type : 'image';
    if (!isValidMediaType(mediaType)) {
      return NextResponse.json(
        { error: `Invalid type: ${type}. Valid types: image, video, audio` },
        { status: 400 }
      );
    }

    // Validate title (optional)
    const mediaTitle = typeof title === 'string' ? title : undefined;

    // Cast the media
    const ip = CHROMECAST_CONFIG.ip;
    const result = await castMedia(ip, url, mediaType, mediaTitle);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        url,
        type: mediaType,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to cast' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Cast error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to cast' },
      { status: 500 }
    );
  }
}

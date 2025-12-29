// ============================================================================
// Samsung TV WebSocket Client - Enhanced Implementation
// ============================================================================

import WebSocket from 'ws';
import fs from 'fs';
import path from 'path';
import { TV_CONFIG, SAMSUNG_KEYS, SAMSUNG_APPS, WS_CONFIG, RATE_LIMITS } from './tv-config';

// Token persistence file path
const TOKEN_FILE = path.join(process.cwd(), '.samsung-token');

// Rate limiting state
const keyPressTimestamps: number[] = [];

class SamsungTVClient {
  private ws: WebSocket | null = null;
  private token: string | null = null;
  private connecting: boolean = false;
  private connected: boolean = false;
  private messageQueue: Array<{
    resolve: (v: unknown) => void;
    reject: (e: Error) => void;
    payload: object;
  }> = [];
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectAttempts: number = 0;
  private lastPongTime: number = 0;

  constructor() {
    // Load persisted token on initialization
    this.loadToken();
  }

  private loadToken(): void {
    try {
      if (fs.existsSync(TOKEN_FILE)) {
        const data = fs.readFileSync(TOKEN_FILE, 'utf-8');
        const parsed = JSON.parse(data);
        if (parsed.token && parsed.ip === TV_CONFIG.ip) {
          this.token = parsed.token;
          console.log('[Samsung] Loaded persisted token');
        }
      }
    } catch (error) {
      console.log('[Samsung] No valid token file found');
    }
  }

  private saveToken(token: string): void {
    try {
      fs.writeFileSync(
        TOKEN_FILE,
        JSON.stringify({ token, ip: TV_CONFIG.ip, savedAt: new Date().toISOString() }),
        'utf-8'
      );
      console.log('[Samsung] Token persisted to file');
    } catch (error) {
      console.error('[Samsung] Failed to save token:', error);
    }
  }

  private getUrl(): string {
    const appName = Buffer.from(TV_CONFIG.name || 'WebRemote').toString('base64');
    let url = `wss://${TV_CONFIG.ip}:${TV_CONFIG.wsPort}/api/v2/channels/samsung.remote.control?name=${appName}`;
    if (this.token) {
      url += `&token=${this.token}`;
    }
    return url;
  }

  private getReconnectDelay(): number {
    const delay = Math.min(
      WS_CONFIG.reconnectDelay * Math.pow(WS_CONFIG.reconnectMultiplier, this.reconnectAttempts),
      WS_CONFIG.maxReconnectDelay
    );
    return delay + Math.random() * 1000; // Add jitter
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.lastPongTime = Date.now();

    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        // Check if we've received a pong recently
        const timeSinceLastPong = Date.now() - this.lastPongTime;
        if (timeSinceLastPong > WS_CONFIG.heartbeatInterval * 2) {
          console.log('[Samsung] Heartbeat timeout, reconnecting...');
          this.ws.close();
          return;
        }

        // Send ping
        try {
          this.ws.ping();
        } catch {
          console.log('[Samsung] Ping failed');
        }
      }
    }, WS_CONFIG.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  async connect(): Promise<boolean> {
    if (this.connected && this.ws?.readyState === WebSocket.OPEN) {
      return true;
    }

    if (this.connecting) {
      // Wait for existing connection attempt
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!this.connecting) {
            clearInterval(checkInterval);
            resolve(this.connected);
          }
        }, 100);

        // Timeout after 15 seconds
        setTimeout(() => {
          clearInterval(checkInterval);
          resolve(this.connected);
        }, 15000);
      });
    }

    this.connecting = true;

    return new Promise((resolve) => {
      const url = this.getUrl();
      console.log(`[Samsung] Connecting to ${TV_CONFIG.ip} (attempt ${this.reconnectAttempts + 1})...`);

      try {
        this.ws = new WebSocket(url, {
          rejectUnauthorized: false,
        });
      } catch (error) {
        console.error('[Samsung] WebSocket creation failed:', error);
        this.connecting = false;
        resolve(false);
        return;
      }

      const timeout = setTimeout(() => {
        console.log('[Samsung] Connection timeout');
        this.ws?.close();
        this.connecting = false;
        this.connected = false;
        resolve(false);
      }, WS_CONFIG.connectionTimeout);

      this.ws.on('open', () => {
        console.log('[Samsung] WebSocket opened, waiting for auth...');
      });

      this.ws.on('pong', () => {
        this.lastPongTime = Date.now();
      });

      this.ws.on('message', (data) => {
        try {
          const response = JSON.parse(data.toString());

          if (response.event === 'ms.channel.connect') {
            clearTimeout(timeout);

            // Save token for future connections (no permission prompt)
            if (response.data?.token) {
              const token = response.data.token;
              this.token = token;
              this.saveToken(token);
              console.log('[Samsung] Connected with token (persistent auth)');
            } else {
              console.log('[Samsung] Connected (check TV for permission prompt)');
            }

            this.connected = true;
            this.connecting = false;
            this.reconnectAttempts = 0;

            // Start heartbeat
            this.startHeartbeat();

            // Process any queued messages
            this.processQueue();

            resolve(true);
          } else if (response.event === 'ms.channel.unauthorized') {
            console.log('[Samsung] Connection unauthorized, clearing token');
            this.token = null;
            try {
              fs.unlinkSync(TOKEN_FILE);
            } catch {
              // Ignore
            }
          }
        } catch (e) {
          console.error('[Samsung] Parse error:', e);
        }
      });

      this.ws.on('close', (code, reason) => {
        console.log(`[Samsung] Connection closed (code: ${code}, reason: ${reason?.toString() || 'none'})`);
        this.connected = false;
        this.connecting = false;
        this.stopHeartbeat();
        clearTimeout(timeout);

        // Auto-reconnect with exponential backoff
        if (!this.reconnectTimer && this.reconnectAttempts < WS_CONFIG.maxReconnectAttempts) {
          const delay = this.getReconnectDelay();
          console.log(`[Samsung] Reconnecting in ${Math.round(delay / 1000)}s...`);

          this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.reconnectAttempts++;
            this.connect().catch(console.error);
          }, delay);
        } else if (this.reconnectAttempts >= WS_CONFIG.maxReconnectAttempts) {
          console.log('[Samsung] Max reconnect attempts reached');
        }
      });

      this.ws.on('error', (error) => {
        console.error('[Samsung] WebSocket error:', error.message);
        clearTimeout(timeout);
        this.connecting = false;
        this.connected = false;
        resolve(false);
      });
    });
  }

  private processQueue() {
    while (this.messageQueue.length > 0) {
      const item = this.messageQueue.shift();
      if (item) {
        this.sendRaw(item.payload).then(item.resolve).catch(item.reject);
      }
    }
  }

  private async sendRaw(payload: object): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected');
    }
    this.ws.send(JSON.stringify(payload));
  }

  private checkRateLimit(): boolean {
    const now = Date.now();
    const windowStart = now - RATE_LIMITS.keyPress.windowMs;

    // Remove old timestamps
    while (keyPressTimestamps.length > 0 && keyPressTimestamps[0] < windowStart) {
      keyPressTimestamps.shift();
    }

    if (keyPressTimestamps.length >= RATE_LIMITS.keyPress.maxRequests) {
      return false;
    }

    keyPressTimestamps.push(now);
    return true;
  }

  async send(payload: object): Promise<void> {
    if (!this.connected) {
      const success = await this.connect();
      if (!success) {
        throw new Error('Failed to connect to TV');
      }
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      return this.sendRaw(payload);
    } else {
      // Queue the message
      return new Promise((resolve, reject) => {
        this.messageQueue.push({
          resolve: resolve as (v: unknown) => void,
          reject,
          payload,
        });
        this.connect().catch(reject);
      });
    }
  }

  async sendKey(key: string, options?: { hold?: boolean; repeat?: number }): Promise<void> {
    // Rate limiting
    if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded. Please slow down.');
    }

    const keyCode = SAMSUNG_KEYS[key.toLowerCase()] || `KEY_${key.toUpperCase()}`;
    const cmd = options?.hold ? 'Press' : 'Click';

    await this.send({
      method: 'ms.remote.control',
      params: {
        Cmd: cmd,
        DataOfCmd: keyCode,
        Option: 'false',
        TypeOfRemote: 'SendRemoteKey',
      },
    });

    // If hold, send release after a delay
    if (options?.hold) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      await this.send({
        method: 'ms.remote.control',
        params: {
          Cmd: 'Release',
          DataOfCmd: keyCode,
          Option: 'false',
          TypeOfRemote: 'SendRemoteKey',
        },
      });
    }

    // Handle repeat
    if (options?.repeat && options.repeat > 1) {
      for (let i = 1; i < options.repeat; i++) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        await this.sendKey(key);
      }
    }

    console.log(`[Samsung] Sent key: ${keyCode}`);
  }

  async launchApp(app: string): Promise<void> {
    const appId = SAMSUNG_APPS[app.toLowerCase()] || app;

    // Try NATIVE_LAUNCH first (works for most apps)
    await this.send({
      method: 'ms.channel.emit',
      params: {
        event: 'ed.apps.launch',
        to: 'host',
        data: {
          appId: appId,
          action_type: 'NATIVE_LAUNCH',
        },
      },
    });

    console.log(`[Samsung] Launched app: ${app} (${appId})`);
  }

  async closeApp(app: string): Promise<void> {
    const appId = SAMSUNG_APPS[app.toLowerCase()] || app;

    await this.send({
      method: 'ms.channel.emit',
      params: {
        event: 'ed.apps.close',
        to: 'host',
        data: {
          appId: appId,
        },
      },
    });

    console.log(`[Samsung] Closed app: ${app} (${appId})`);
  }

  async getInstalledApps(): Promise<unknown> {
    await this.send({
      method: 'ms.channel.emit',
      params: {
        event: 'ed.installedApp.get',
        to: 'host',
      },
    });

    // Note: Response comes via message event
    return null;
  }

  async getInstalledAppsWithResponse(): Promise<unknown[]> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout waiting for apps list'));
      }, 10000);

      const messageHandler = (data: Buffer) => {
        try {
          const response = JSON.parse(data.toString());
          if (response.event === 'ed.installedApp.get') {
            clearTimeout(timeout);
            this.ws?.off('message', messageHandler);
            resolve(response.data?.data || []);
          }
        } catch {
          // Ignore parse errors
        }
      };

      this.ws?.on('message', messageHandler);

      this.send({
        method: 'ms.channel.emit',
        params: {
          event: 'ed.installedApp.get',
          to: 'host',
        },
      }).catch((err) => {
        clearTimeout(timeout);
        this.ws?.off('message', messageHandler);
        reject(err);
      });
    });
  }

  async sendText(text: string): Promise<void> {
    const base64Text = Buffer.from(text).toString('base64');

    await this.send({
      method: 'ms.remote.control',
      params: {
        Cmd: base64Text,
        DataOfCmd: 'base64',
        Option: 'false',
        TypeOfRemote: 'SendInputString',
      },
    });

    console.log(`[Samsung] Sent text input`);
  }

  isConnected(): boolean {
    return this.connected && this.ws?.readyState === WebSocket.OPEN;
  }

  getConnectionStatus(): {
    connected: boolean;
    reconnectAttempts: number;
    hasToken: boolean;
  } {
    return {
      connected: this.isConnected(),
      reconnectAttempts: this.reconnectAttempts,
      hasToken: !!this.token,
    };
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
    this.reconnectAttempts = 0;
  }

  resetReconnectAttempts() {
    this.reconnectAttempts = 0;
  }
}

// Singleton instance - maintains persistent connection
export const samsungTV = new SamsungTVClient();

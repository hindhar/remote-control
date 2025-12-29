// ============================================================================
// TV Remote Control - Comprehensive Type Definitions
// ============================================================================

// Device Types
export interface SamsungDevice {
  id: string;
  name: string;
  ip: string;
  mac: string;
  model?: string;
  location?: string;
  wsPort: number;
  isDefault: boolean;
  lastSeen?: Date;
  capabilities?: string[];
}

export interface ChromecastDevice {
  id: string;
  name: string;
  ip: string;
  model?: string;
  location?: string;
  lastSeen?: Date;
}

export interface DeviceGroup {
  id: string;
  name: string;
  icon: string;
  devices: Array<{ type: 'samsung' | 'chromecast'; deviceId: string }>;
  syncVolume: boolean;
  syncPower: boolean;
}

// Connection Status
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface DeviceStatus {
  deviceId: string;
  connectionStatus: ConnectionStatus;
  lastError?: string;
  volume?: number;
  muted?: boolean;
  currentApp?: string;
  powerState?: 'on' | 'off' | 'standby';
}

// Media State
export interface MediaState {
  source: 'samsung' | 'chromecast' | null;
  status: 'playing' | 'paused' | 'stopped' | 'buffering' | 'idle';
  title?: string;
  subtitle?: string;
  artwork?: string;
  duration?: number;
  position?: number;
  volume: number;
  muted: boolean;
}

// App Definitions
export interface AppDefinition {
  id: string;
  name: string;
  icon: string;
  color: string;
  platform: 'samsung' | 'chromecast' | 'both';
  category: 'streaming' | 'music' | 'gaming' | 'utility' | 'social' | 'browser';
  deepLinks?: DeepLinkConfig[];
}

export interface DeepLinkConfig {
  action: string;
  paramName: string;
  examples: Array<{ label: string; value: string }>;
}

// Key Categories
export interface KeyCategory {
  id: string;
  name: string;
  icon: string;
  keys: string[];
  description?: string;
}

// Macros and Automation
export interface Macro {
  id: string;
  name: string;
  icon: string;
  color: string;
  steps: MacroStep[];
  createdAt: Date;
  lastRun?: Date;
  runCount: number;
}

export type MacroStep =
  | { type: 'key'; key: string; delay?: number }
  | { type: 'app'; appId: string; delay?: number }
  | { type: 'wait'; duration: number }
  | { type: 'volume'; level: number; device?: string }
  | { type: 'input'; source: string }
  | { type: 'chromecast'; action: string; params?: Record<string, unknown> };

export interface ScheduledAction {
  id: string;
  name: string;
  macroId: string;
  schedule: {
    type: 'once' | 'daily' | 'weekly' | 'custom';
    time: string;
    days?: number[];
    cron?: string;
    timezone: string;
  };
  enabled: boolean;
  nextRun?: Date;
}

// Settings
export interface PictureSettings {
  mode: 'dynamic' | 'standard' | 'natural' | 'movie' | 'filmmaker' | 'game';
  backlight: number;
  brightness: number;
  contrast: number;
  sharpness: number;
  color: number;
  tint: number;
  colorTone: 'cool' | 'standard' | 'warm1' | 'warm2';
  gameMode: boolean;
}

export interface AudioSettings {
  mode: 'standard' | 'amplify' | 'optimized' | 'game' | 'adaptive';
  balance: number;
  surroundSound: boolean;
  dialogueEnhancer: boolean;
  output: 'tv_speakers' | 'soundbar' | 'receiver' | 'bluetooth';
}

export interface AccessibilitySettings {
  largeButtons: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  screenReaderAnnouncements: boolean;
  hapticFeedback: boolean;
  voiceControl: boolean;
  focusIndicator: 'outline' | 'background' | 'both';
  fontSize: 'normal' | 'large' | 'xlarge';
  buttonSpacing: 'normal' | 'wide';
}

export interface UserSettings {
  theme: 'dark' | 'light' | 'system';
  defaultDevice: string;
  showAdvancedControls: boolean;
  compactMode: boolean;
  accessibility: AccessibilitySettings;
  favorites: FavoriteItem[];
  recentApps: string[];
}

export interface FavoriteItem {
  id: string;
  type: 'key' | 'app' | 'macro' | 'setting';
  config: Record<string, unknown>;
  position: number;
}

// API Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface KeyPressRequest {
  key: string;
  deviceId?: string;
  hold?: boolean;
  repeatCount?: number;
}

export interface AppLaunchRequest {
  appId: string;
  deviceId?: string;
  deepLink?: string;
}

export interface ChromecastControlRequest {
  action: 'play' | 'pause' | 'stop' | 'volume' | 'mute' | 'unmute' | 'seek' | 'volup' | 'voldown' | 'rewind' | 'forward';
  deviceId?: string;
  value?: number;
}

// Validation Schemas
export const VALID_CHROMECAST_ACTIONS = [
  'play', 'pause', 'stop', 'volume', 'mute', 'unmute',
  'seek', 'volup', 'voldown', 'rewind', 'forward'
] as const;

export type ChromecastAction = typeof VALID_CHROMECAST_ACTIONS[number];

export function isValidChromecastAction(action: string): action is ChromecastAction {
  return VALID_CHROMECAST_ACTIONS.includes(action as ChromecastAction);
}

export function isValidVolumeValue(value: unknown): value is number {
  return typeof value === 'number' && value >= 0 && value <= 100 && Number.isFinite(value);
}

export function isValidSeekValue(value: unknown): value is number {
  return typeof value === 'number' && value >= 0 && Number.isFinite(value);
}

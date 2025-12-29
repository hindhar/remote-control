// ============================================================================
// TV Remote Control - Comprehensive Configuration
// ============================================================================

import type { SamsungDevice, ChromecastDevice, AppDefinition, KeyCategory } from '@/types';

// Default Device Configuration
export const TV_CONFIG: SamsungDevice = {
  id: 'samsung-main',
  name: 'Absolutely Massive TV',
  ip: process.env.SAMSUNG_TV_IP || '192.168.0.135',
  mac: process.env.SAMSUNG_TV_MAC || '6c:70:cb:a4:66:b4',
  wsPort: 8002,
  isDefault: true,
  location: 'Living Room',
};

export const CHROMECAST_CONFIG: ChromecastDevice = {
  id: 'chromecast-main',
  name: 'Chromecast',
  ip: process.env.CHROMECAST_IP || '192.168.0.80',
  location: 'Living Room',
};

// PS5 Configuration
export interface PS5Device {
  id: string;
  name: string;
  ip: string;
  location?: string;
  registered: boolean;
}

export const PS5_CONFIG: PS5Device = {
  id: 'ps5-main',
  name: 'PlayStation 5',
  ip: process.env.PS5_IP || '192.168.0.242', // Update with your PS5 IP
  location: 'Living Room',
  registered: false, // Set to true after running registration
};

// PS5 Button Mappings
export const PS5_BUTTONS: Record<string, string> = {
  // Face buttons
  cross: 'CROSS',
  circle: 'CIRCLE',
  square: 'SQUARE',
  triangle: 'TRIANGLE',
  // D-pad
  up: 'UP',
  down: 'DOWN',
  left: 'LEFT',
  right: 'RIGHT',
  // Shoulder buttons
  l1: 'L1',
  r1: 'R1',
  l2: 'L2',
  r2: 'R2',
  l3: 'L3',
  r3: 'R3',
  // System buttons
  options: 'OPTIONS',
  share: 'SHARE',
  ps: 'PS',
  touchpad: 'TOUCHPAD',
};

// Chromecast App IDs (for casting)
export const CHROMECAST_APPS: Record<string, { id: string; name: string; icon: string; color: string }> = {
  youtube: {
    id: '233637DE',
    name: 'YouTube',
    icon: 'Youtube',
    color: '#FF0000',
  },
  netflix: {
    id: 'CA5E8412',
    name: 'Netflix',
    icon: 'Film',
    color: '#E50914',
  },
  spotify: {
    id: 'CC32E753',
    name: 'Spotify',
    icon: 'Music',
    color: '#1DB954',
  },
  primevideo: {
    id: '6B58A0FA',
    name: 'Prime Video',
    icon: 'Play',
    color: '#00A8E1',
  },
  disneyplus: {
    id: '585F504C',
    name: 'Disney+',
    icon: 'Sparkles',
    color: '#113CCF',
  },
  plex: {
    id: '9AC194DC',
    name: 'Plex',
    icon: 'MonitorPlay',
    color: '#E5A00D',
  },
};

// ============================================================================
// Complete Samsung Key Codes (100+ keys)
// ============================================================================

export const SAMSUNG_KEYS: Record<string, string> = {
  // Power Controls
  power: 'KEY_POWER',
  poweroff: 'KEY_POWEROFF',
  poweron: 'KEY_POWERON',

  // Navigation - Basic
  up: 'KEY_UP',
  down: 'KEY_DOWN',
  left: 'KEY_LEFT',
  right: 'KEY_RIGHT',
  enter: 'KEY_ENTER',
  return: 'KEY_RETURN',
  exit: 'KEY_EXIT',
  back: 'KEY_RETURN',

  // Navigation - Extended
  home: 'KEY_HOME',
  menu: 'KEY_MENU',
  source: 'KEY_SOURCE',
  apps: 'KEY_APPS',
  guide: 'KEY_GUIDE',
  info: 'KEY_INFO',
  tools: 'KEY_TOOLS',
  contents: 'KEY_CONTENTS',
  topmenu: 'KEY_TOPMENU',
  emanual: 'KEY_E_MANUAL',
  chlist: 'KEY_CH_LIST',

  // Volume Controls
  volup: 'KEY_VOLUP',
  voldown: 'KEY_VOLDOWN',
  mute: 'KEY_MUTE',

  // Channel Controls
  chup: 'KEY_CHUP',
  chdown: 'KEY_CHDOWN',
  prech: 'KEY_PRECH',
  favch: 'KEY_FAVCH',

  // Number Pad
  '0': 'KEY_0',
  '1': 'KEY_1',
  '2': 'KEY_2',
  '3': 'KEY_3',
  '4': 'KEY_4',
  '5': 'KEY_5',
  '6': 'KEY_6',
  '7': 'KEY_7',
  '8': 'KEY_8',
  '9': 'KEY_9',
  dash: 'KEY_MINUS',
  minus: 'KEY_MINUS',
  ttxmix: 'KEY_TTX_MIX',

  // Media Playback
  play: 'KEY_PLAY',
  pause: 'KEY_PAUSE',
  stop: 'KEY_STOP',
  rewind: 'KEY_REWIND',
  ff: 'KEY_FF',
  fastforward: 'KEY_FF',
  record: 'KEY_REC',
  rec: 'KEY_REC',
  previous: 'KEY_PREVIOUS',
  next: 'KEY_NEXT',

  // Color Buttons
  red: 'KEY_RED',
  green: 'KEY_GREEN',
  yellow: 'KEY_YELLOW',
  blue: 'KEY_BLUE',
  cyan: 'KEY_CYAN',

  // Picture Controls
  pmode: 'KEY_PMODE',
  picturemode: 'KEY_PMODE',
  picturesize: 'KEY_PICTURE_SIZE',
  aspect: 'KEY_ASPECT',
  zoomin: 'KEY_ZOOM_IN',
  zoomout: 'KEY_ZOOM_OUT',
  zoommove: 'KEY_ZOOM_MOVE',
  zoom1: 'KEY_ZOOM1',
  zoom2: 'KEY_ZOOM2',

  // Sound Controls
  smode: 'KEY_SMODE',
  soundmode: 'KEY_SMODE',
  mts: 'KEY_MTS',
  ad: 'KEY_AD',

  // PIP Controls
  pip: 'KEY_PIP_ONOFF',
  piponoff: 'KEY_PIP_ONOFF',
  pipswap: 'KEY_PIP_SWAP',
  pipsize: 'KEY_PIP_SIZE',
  pipchup: 'KEY_PIP_CHUP',
  pipchdown: 'KEY_PIP_CHDOWN',
  pipscan: 'KEY_PIP_SCAN',

  // Teletext
  ttx: 'KEY_TTX_MIX',
  teletext: 'KEY_TTX_MIX',
  ttxsubface: 'KEY_TTX_SUBFACE',

  // Caption/Subtitle
  caption: 'KEY_CAPTION',
  subtitle: 'KEY_SUB_TITLE',
  cc: 'KEY_CAPTION',

  // Sleep/Timer
  sleep: 'KEY_SLEEP',
  autoprogram: 'KEY_AUTO_PROGRAM',

  // 3D Controls
  '3d': 'KEY_PANNEL_CHDOWN',

  // Smart Hub
  smarthub: 'KEY_SMART_HUB',
  samsung: 'KEY_SMART_HUB',

  // Voice/Search
  voice: 'KEY_VOICE',
  search: 'KEY_SEARCH',

  // Settings
  settings: 'KEY_MENU',
  setup: 'KEY_SETUP',

  // DVR Controls
  live: 'KEY_LIVE',
  instant_replay: 'KEY_INSTANT_REPLAY',
  link: 'KEY_LINK',

  // Input Sources
  hdmi: 'KEY_HDMI',
  hdmi1: 'KEY_HDMI1',
  hdmi2: 'KEY_HDMI2',
  hdmi3: 'KEY_HDMI3',
  hdmi4: 'KEY_HDMI4',
  component1: 'KEY_COMPONENT1',
  component2: 'KEY_COMPONENT2',
  av1: 'KEY_AV1',
  av2: 'KEY_AV2',
  av3: 'KEY_AV3',
  svideo1: 'KEY_SVIDEO1',
  svideo2: 'KEY_SVIDEO2',
  svideo3: 'KEY_SVIDEO3',
  dvi: 'KEY_DVI',
  tv: 'KEY_TV',
  dtv: 'KEY_DTV',
  antena: 'KEY_ANTENA',
  antenna: 'KEY_ANTENA',
  usb: 'KEY_USB',
  pc: 'KEY_PC',

  // Extra Controls
  esaving: 'KEY_ESAVING',
  ambient: 'KEY_AMBIENT',
  ambientmode: 'KEY_AMBIENT',
  help: 'KEY_HELP',
  factory: 'KEY_FACTORY',
  clock: 'KEY_CLOCK_DISPLAY',
  network: 'KEY_NETWORK',
  convergence: 'KEY_CONVERGENCE',
  magic_channel: 'KEY_MAGIC_CHANNEL',
  extend: 'KEY_EXT1',
  ext1: 'KEY_EXT1',
  ext2: 'KEY_EXT2',
  ext3: 'KEY_EXT3',
  ext4: 'KEY_EXT4',
  ext5: 'KEY_EXT5',
  ext6: 'KEY_EXT6',
  ext7: 'KEY_EXT7',
  ext8: 'KEY_EXT8',
  ext9: 'KEY_EXT9',
  ext10: 'KEY_EXT10',
  ext11: 'KEY_EXT11',
  ext12: 'KEY_EXT12',
  ext13: 'KEY_EXT13',
  ext14: 'KEY_EXT14',
  ext15: 'KEY_EXT15',
  ext16: 'KEY_EXT16',
  ext17: 'KEY_EXT17',
  ext18: 'KEY_EXT18',
  ext19: 'KEY_EXT19',
  ext20: 'KEY_EXT20',

  // Multi View
  multiview: 'KEY_MULTI_VIEW',

  // Game Mode
  gamemode: 'KEY_GAME_MODE',
  gamebar: 'KEY_GAME_BAR',
};

// ============================================================================
// Key Categories for UI Organization
// ============================================================================

export const KEY_CATEGORIES: KeyCategory[] = [
  {
    id: 'power',
    name: 'Power',
    icon: 'Power',
    keys: ['power', 'poweroff'],
    description: 'Power on/off controls',
  },
  {
    id: 'navigation',
    name: 'Navigation',
    icon: 'Navigation',
    keys: ['up', 'down', 'left', 'right', 'enter', 'return', 'exit', 'home', 'back'],
    description: 'Navigate TV menus',
  },
  {
    id: 'volume',
    name: 'Volume',
    icon: 'Volume2',
    keys: ['volup', 'voldown', 'mute'],
    description: 'Volume controls',
  },
  {
    id: 'channel',
    name: 'Channel',
    icon: 'Tv',
    keys: ['chup', 'chdown', 'prech', 'favch', 'chlist', 'guide'],
    description: 'Channel navigation',
  },
  {
    id: 'media',
    name: 'Media',
    icon: 'Play',
    keys: ['play', 'pause', 'stop', 'rewind', 'ff', 'record', 'previous', 'next'],
    description: 'Media playback controls',
  },
  {
    id: 'numbers',
    name: 'Number Pad',
    icon: 'Hash',
    keys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'dash'],
    description: 'Direct channel entry',
  },
  {
    id: 'colors',
    name: 'Color Buttons',
    icon: 'Palette',
    keys: ['red', 'green', 'yellow', 'blue'],
    description: 'Color function buttons',
  },
  {
    id: 'smart',
    name: 'Smart Features',
    icon: 'Smartphone',
    keys: ['smarthub', 'apps', 'voice', 'search', 'ambient'],
    description: 'Smart TV features',
  },
  {
    id: 'sources',
    name: 'Input Sources',
    icon: 'MonitorPlay',
    keys: ['source', 'hdmi', 'hdmi1', 'hdmi2', 'hdmi3', 'hdmi4', 'tv', 'usb', 'pc'],
    description: 'Input source selection',
  },
  {
    id: 'picture',
    name: 'Picture',
    icon: 'Image',
    keys: ['pmode', 'picturesize', 'aspect', 'zoomin', 'zoomout'],
    description: 'Picture adjustments',
  },
  {
    id: 'sound',
    name: 'Sound',
    icon: 'Music',
    keys: ['smode', 'mts', 'ad'],
    description: 'Sound adjustments',
  },
  {
    id: 'pip',
    name: 'Picture-in-Picture',
    icon: 'PictureInPicture2',
    keys: ['pip', 'pipswap', 'pipsize', 'pipchup', 'pipchdown'],
    description: 'PIP controls',
  },
  {
    id: 'accessibility',
    name: 'Accessibility',
    icon: 'Accessibility',
    keys: ['caption', 'subtitle', 'ad', 'help'],
    description: 'Accessibility features',
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: 'Settings',
    keys: ['menu', 'settings', 'setup', 'info', 'tools', 'emanual'],
    description: 'TV settings and info',
  },
  {
    id: 'advanced',
    name: 'Advanced',
    icon: 'Wrench',
    keys: ['multiview', 'gamemode', 'gamebar', 'sleep', 'factory', 'network'],
    description: 'Advanced features',
  },
];

// ============================================================================
// Comprehensive App Database (50+ apps)
// ============================================================================

export const SAMSUNG_APPS: Record<string, string> = {
  // Streaming - Major (UK)
  netflix: '3201907018807',
  youtube: '111299001912',
  prime: '3201910019365',
  primevideo: '3201910019365',
  disney: '3201901017640',
  disneyplus: '3201901017640',
  appletv: '3201807016597',
  appletvplus: '3201807016597',

  // UK Catch-up TV
  iplayer: '3201602007865',
  bbciplayer: '3201602007865',
  bbc: '3201602007865',
  itvx: '3201908019041',
  itv: '3201908019041',
  itvhub: '3201908019041',
  all4: '3201601007670',
  channel4: '3201601007670',
  four: '3201601007670',
  my5: '3201804016498',
  channel5: '3201804016498',
  five: '3201804016498',
  now: '3201811017686',
  nowtv: '3201811017686',
  sky: '3201811017686',
  uktvplay: '3201806016432',
  uktv: '3201806016432',

  // UK/International Streaming
  britbox: '3201906019064',
  paramount: '3201909019487',
  paramountplus: '3201909019487',
  hayu: '3201707012808',
  dazn: '3201806016381',
  discovery: '3202103023243',
  discoveryplus: '3202103023243',

  // Music
  spotify: '3201606009684',
  applemusic: '3201810017671',
  amazonmusic: '3201908019033',
  tidal: '3201703012065',
  deezer: '3201504001696',

  // Media Players
  plex: '3201512006963',
  jellyfin: '3202010022093',
  vlc: '3201504001623',

  // Gaming
  geforce: '3201912019463',
  geforcenow: '3201912019463',
  xbox: '3202103023107',
  xboxgamepass: '3202103023107',

  // Social
  twitch: '3201903018877',
  tiktok: '3202008020525',

  // International/Niche
  mubi: '3201909019482',
  curiositystream: '3201807016609',
  crunchyroll: '3201909019316',
  acorn: '3201803016294',

  // Utility
  browser: 'org.tizen.browser',
  gallery: 'com.samsung.tv.gallery',
  smartthings: '3201910019378',
  screenmirroring: 'com.samsung.tv.miracast',

  // Kids
  youtube_kids: '3201611011127',
};

// ============================================================================
// App Definitions with Metadata
// ============================================================================

export const APP_DEFINITIONS: AppDefinition[] = [
  // ✅ VERIFIED WORKING on your TV
  { id: '3201907018807', name: 'Netflix', icon: '/icons/netflix.svg', color: '#E50914', platform: 'samsung', category: 'streaming' },
  { id: '111299001912', name: 'YouTube', icon: '/icons/youtube.svg', color: '#FF0000', platform: 'samsung', category: 'streaming' },
  { id: '3201910019365', name: 'Prime Video', icon: '/icons/prime.svg', color: '#00A8E1', platform: 'samsung', category: 'streaming' },
  { id: '3201901017640', name: 'Disney+', icon: '/icons/disney.svg', color: '#113CCF', platform: 'samsung', category: 'streaming' },
  { id: '3201602007865', name: 'BBC iPlayer', icon: '/icons/iplayer.svg', color: '#FF4D8D', platform: 'samsung', category: 'streaming' },
  { id: '3201908019041', name: 'ITVX', icon: '/icons/itvx.svg', color: '#00A6DE', platform: 'samsung', category: 'streaming' },
  { id: '3201601007670', name: 'All 4', icon: '/icons/all4.svg', color: '#FF1493', platform: 'samsung', category: 'streaming' },
  { id: '3201606009684', name: 'Spotify', icon: '/icons/spotify.svg', color: '#1DB954', platform: 'samsung', category: 'music' },

  // Other apps (may or may not be installed)
  { id: '3201807016597', name: 'Apple TV', icon: '/icons/appletv.svg', color: '#000000', platform: 'samsung', category: 'streaming' },
  { id: '3201906019064', name: 'BritBox', icon: '/icons/britbox.svg', color: '#E10A0A', platform: 'samsung', category: 'streaming' },
  { id: '3201909019487', name: 'Paramount+', icon: '/icons/paramount.svg', color: '#0068FF', platform: 'samsung', category: 'streaming' },
  { id: '3201512006963', name: 'Plex', icon: '/icons/plex.svg', color: '#E5A00D', platform: 'both', category: 'streaming' },
  { id: '3201810017671', name: 'Apple Music', icon: '/icons/applemusic.svg', color: '#FA233B', platform: 'samsung', category: 'music' },
  { id: '3201908019033', name: 'Amazon Music', icon: '/icons/amazonmusic.svg', color: '#25D1DA', platform: 'samsung', category: 'music' },
  { id: '3201903018877', name: 'Twitch', icon: '/icons/twitch.svg', color: '#9146FF', platform: 'samsung', category: 'social' },
  { id: '3202008020525', name: 'TikTok', icon: '/icons/tiktok.svg', color: '#000000', platform: 'samsung', category: 'social' },
  { id: '3201909019316', name: 'Crunchyroll', icon: '/icons/crunchyroll.svg', color: '#F47521', platform: 'samsung', category: 'streaming' },
];

// ============================================================================
// Preset Macros/Scenes
// ============================================================================

export const PRESET_MACROS = [
  {
    id: 'movie-night',
    name: 'Movie Night',
    icon: 'Film',
    color: '#7C3AED',
    steps: [
      { type: 'key' as const, key: 'power' },
      { type: 'wait' as const, duration: 3000 },
      { type: 'key' as const, key: 'source' },
      { type: 'wait' as const, duration: 500 },
      { type: 'key' as const, key: 'enter' },
    ],
  },
  {
    id: 'gaming',
    name: 'Gaming Mode',
    icon: 'Gamepad2',
    color: '#10B981',
    steps: [
      { type: 'key' as const, key: 'hdmi1' },
      { type: 'wait' as const, duration: 1000 },
      { type: 'key' as const, key: 'gamemode' },
    ],
  },
  {
    id: 'netflix-chill',
    name: 'Netflix & Chill',
    icon: 'Popcorn',
    color: '#E50914',
    steps: [
      { type: 'app' as const, appId: 'netflix' },
    ],
  },
  {
    id: 'goodnight',
    name: 'Good Night',
    icon: 'Moon',
    color: '#6366F1',
    steps: [
      { type: 'key' as const, key: 'poweroff' },
    ],
  },
  {
    id: 'wake-up',
    name: 'Wake Up',
    icon: 'Sun',
    color: '#F59E0B',
    steps: [
      { type: 'key' as const, key: 'power' },
      { type: 'wait' as const, duration: 5000 },
      { type: 'app' as const, appId: 'youtube' },
    ],
  },
];

// ============================================================================
// Rate Limiting Configuration
// ============================================================================

export const RATE_LIMITS = {
  keyPress: {
    maxRequests: 10,
    windowMs: 1000, // 10 requests per second
  },
  appLaunch: {
    maxRequests: 2,
    windowMs: 5000, // 2 app launches per 5 seconds
  },
  chromecast: {
    maxRequests: 5,
    windowMs: 1000, // 5 requests per second
  },
};

// ============================================================================
// WebSocket Configuration
// ============================================================================

export const WS_CONFIG = {
  reconnectDelay: 1000,
  maxReconnectDelay: 30000,
  reconnectMultiplier: 2,
  maxReconnectAttempts: 10,
  heartbeatInterval: 30000,
  connectionTimeout: 10000,
};

// ============================================================================
// Chromecast Quick Cast Presets
// ============================================================================

export interface CastPreset {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'audio';
  icon: string;
  color: string;
}

export const CAST_PRESETS: CastPreset[] = [
  {
    id: 'rickroll',
    name: 'Rick Roll',
    url: 'https://i.giphy.com/media/Vuw9m5wXviFIQ/giphy.webp',
    type: 'image',
    icon: 'Music',
    color: '#DC2626',
  },
  {
    id: 'surprised-pikachu',
    name: 'Surprised Pikachu',
    url: 'https://i.kym-cdn.com/entries/icons/original/000/027/475/Screen_Shot_2018-10-25_at_11.02.15_AM.png',
    type: 'image',
    icon: 'Zap',
    color: '#FBBF24',
  },
  {
    id: 'this-is-fine',
    name: 'This Is Fine',
    url: 'https://i.giphy.com/media/QMHoU66sBXqqLqYvGO/giphy.webp',
    type: 'image',
    icon: 'Flame',
    color: '#F97316',
  },
  {
    id: 'nyan-cat',
    name: 'Nyan Cat',
    url: 'https://i.giphy.com/media/sIIhZliB2McAo/giphy.webp',
    type: 'image',
    icon: 'Cat',
    color: '#EC4899',
  },
  {
    id: 'deal-with-it',
    name: 'Deal With It',
    url: 'https://i.giphy.com/media/3o7TKsQ8MjMp9I5R8k/giphy.webp',
    type: 'image',
    icon: 'Glasses',
    color: '#3B82F6',
  },
  {
    id: 'mind-blown',
    name: 'Mind Blown',
    url: 'https://i.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.webp',
    type: 'image',
    icon: 'Brain',
    color: '#8B5CF6',
  },
];

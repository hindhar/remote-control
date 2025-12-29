'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tv,
  Cast,
  Gamepad2,
  Grid3X3,
  Settings,
  Power,
  Home as HomeIcon,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  Menu,
  Play,
  Pause,
  Square,
  FastForward,
  Rewind,
  Wifi,
  WifiOff,
  Loader2,
  MonitorPlay,
  SkipBack,
  SkipForward,
  Youtube,
  Film,
  Music,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { DPad, type Direction } from '@/components/organisms/DPad';
import { cn } from '@/lib/utils';
import { TV_CONFIG, APP_DEFINITIONS, CHROMECAST_APPS } from '@/lib/tv-config';

// Types
type TabId = 'tv' | 'chromecast' | 'ps5' | 'apps' | 'settings';

interface ChromecastDevice {
  name: string;
  ip: string;
  port: number;
  model: string;
  app: string | null;
  standby: boolean | null;
  volume: number | null;
  muted: boolean | null;
}

// Animation configs - Apple-style springs
const spring = {
  default: { type: 'spring' as const, stiffness: 400, damping: 30 },
  gentle: { type: 'spring' as const, stiffness: 200, damping: 25 },
  snappy: { type: 'spring' as const, stiffness: 500, damping: 30 },
};

// Toast notification
function Toast({ message, type = 'info' }: { message: string; type?: 'success' | 'error' | 'info' }) {
  const colors = {
    success: 'bg-[hsl(142,71%,45%)]',
    error: 'bg-[hsl(0,72%,51%)]',
    info: 'bg-[hsl(211,100%,50%)]',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={spring.snappy}
      className={cn(
        'fixed top-12 left-1/2 -translate-x-1/2 z-50',
        'px-5 py-2.5 rounded-full',
        'text-white text-sm font-medium',
        'shadow-lg',
        colors[type]
      )}
    >
      {message}
    </motion.div>
  );
}

// Connection badge
function ConnectionBadge({ connected, loading }: { connected: boolean; loading?: boolean }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium',
        connected
          ? 'bg-[hsla(142,71%,45%,0.12)] text-[hsl(142,60%,35%)]'
          : 'bg-[hsla(0,72%,51%,0.12)] text-[hsl(0,60%,45%)]'
      )}
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : connected ? (
        <Wifi className="w-3 h-3" />
      ) : (
        <WifiOff className="w-3 h-3" />
      )}
      <span>{loading ? 'Connecting...' : connected ? 'Connected' : 'Offline'}</span>
    </div>
  );
}

// Premium Glass Card - Light theme
function GlassCard({
  children,
  className,
  padding = 'md',
}: {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}) {
  const paddingMap = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-6' };

  return (
    <div
      className={cn('rounded-2xl', paddingMap[padding], className)}
      style={{
        background: 'hsla(0,0%,100%,0.8)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        border: '1px solid hsla(0,0%,0%,0.06)',
        boxShadow: '0 2px 12px hsla(0,0%,0%,0.08), 0 0 0 1px hsla(0,0%,0%,0.04)',
      }}
    >
      {children}
    </div>
  );
}

// Premium Button - Light theme
function PremiumButton({
  children,
  onClick,
  variant = 'glass',
  size = 'md',
  icon,
  loading,
  disabled,
  className,
}: {
  children?: React.ReactNode;
  onClick?: () => void;
  variant?: 'glass' | 'primary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const baseStyles = cn(
    'relative flex items-center justify-center gap-2',
    'font-medium rounded-xl',
    'transition-all duration-150',
    'active:scale-[0.97]',
    'disabled:opacity-40 disabled:pointer-events-none',
    'focus-visible:ring-2 focus-visible:ring-[hsl(211,100%,50%)] focus-visible:ring-offset-2'
  );

  const sizeStyles = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-11 px-4 text-sm',
    lg: 'h-14 px-5 text-base',
    icon: 'h-12 w-12',
  };

  const variantStyles = {
    glass: {
      background: 'hsla(0,0%,0%,0.05)',
      border: '1px solid hsla(0,0%,0%,0.08)',
      color: 'hsl(0,0%,20%)',
    },
    primary: {
      background: 'linear-gradient(180deg, hsl(211,100%,50%) 0%, hsl(211,100%,42%) 100%)',
      border: 'none',
      color: 'white',
      boxShadow: '0 2px 8px hsla(211,100%,50%,0.3)',
    },
    danger: {
      background: 'linear-gradient(180deg, hsl(0,72%,50%) 0%, hsl(0,72%,42%) 100%)',
      border: 'none',
      color: 'white',
      boxShadow: '0 2px 8px hsla(0,72%,50%,0.3)',
    },
    ghost: {
      background: 'transparent',
      border: '1px solid transparent',
      color: 'hsl(0,0%,40%)',
    },
  };

  return (
    <motion.button
      className={cn(baseStyles, sizeStyles[size], className)}
      style={variantStyles[variant]}
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={{ scale: 0.97 }}
      whileHover={{ filter: variant === 'ghost' ? 'none' : 'brightness(1.05)' }}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </motion.button>
  );
}

// Section Label
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-semibold tracking-wider text-[hsl(0,0%,50%)] uppercase">
      {children}
    </span>
  );
}

// TV Remote Panel
function TVPanel({
  onSendKey,
  loading,
  connected,
}: {
  onSendKey: (key: string) => void;
  loading: string | null;
  connected: boolean;
}) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-semibold text-[hsl(0,0%,10%)] tracking-tight">Samsung TV</h1>
          <p className="text-sm text-[hsl(0,0%,50%)] mt-0.5">{TV_CONFIG.ip}</p>
        </div>
        <ConnectionBadge connected={connected} loading={loading === 'connect'} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <PremiumButton
          variant="danger"
          size="lg"
          icon={<Power className="w-5 h-5" />}
          onClick={() => onSendKey('power')}
          loading={loading === 'power'}
        >
          Power
        </PremiumButton>
        <PremiumButton
          variant="glass"
          size="lg"
          icon={<MonitorPlay className="w-5 h-5" />}
          onClick={() => onSendKey('source')}
          loading={loading === 'source'}
        >
          Source
        </PremiumButton>
        <PremiumButton
          variant="primary"
          size="lg"
          icon={<HomeIcon className="w-5 h-5" />}
          onClick={() => onSendKey('home')}
          loading={loading === 'home'}
        >
          Home
        </PremiumButton>
      </div>

      {/* D-Pad */}
      <div className="flex justify-center py-4">
        <DPad
          onDirection={(dir) => onSendKey(dir)}
          onSelect={() => onSendKey('enter')}
          onLongPress={(dir) => onSendKey(dir === 'select' ? 'enter' : dir)}
          loadingDirection={
            ['up', 'down', 'left', 'right'].includes(loading || '')
              ? (loading as Direction)
              : loading === 'enter'
                ? 'select'
                : null
          }
          size="lg"
          disabled={!connected}
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-center gap-4">
        <PremiumButton
          variant="glass"
          size="icon"
          icon={<ArrowLeft className="w-5 h-5" />}
          onClick={() => onSendKey('return')}
          loading={loading === 'return'}
        />
        <PremiumButton
          variant="glass"
          size="icon"
          icon={<Menu className="w-5 h-5" />}
          onClick={() => onSendKey('menu')}
          loading={loading === 'menu'}
        />
      </div>

      {/* Volume & Channel */}
      <div className="grid grid-cols-2 gap-4">
        <GlassCard padding="md">
          <div className="text-center mb-3">
            <SectionLabel>Volume</SectionLabel>
          </div>
          <div className="flex flex-col items-center gap-1">
            <PremiumButton
              variant="ghost"
              size="icon"
              icon={<ChevronUp className="w-6 h-6" />}
              onClick={() => onSendKey('volup')}
              loading={loading === 'volup'}
            />
            <PremiumButton
              variant="glass"
              size="icon"
              icon={<VolumeX className="w-5 h-5" />}
              onClick={() => onSendKey('mute')}
              loading={loading === 'mute'}
            />
            <PremiumButton
              variant="ghost"
              size="icon"
              icon={<ChevronDown className="w-6 h-6" />}
              onClick={() => onSendKey('voldown')}
              loading={loading === 'voldown'}
            />
          </div>
        </GlassCard>

        <GlassCard padding="md">
          <div className="text-center mb-3">
            <SectionLabel>Channel</SectionLabel>
          </div>
          <div className="flex flex-col items-center gap-1">
            <PremiumButton
              variant="ghost"
              size="icon"
              icon={<ChevronUp className="w-6 h-6" />}
              onClick={() => onSendKey('chup')}
              loading={loading === 'chup'}
            />
            <div className="h-12 w-12 flex items-center justify-center">
              <span className="text-sm font-medium text-[hsl(0,0%,50%)]">CH</span>
            </div>
            <PremiumButton
              variant="ghost"
              size="icon"
              icon={<ChevronDown className="w-6 h-6" />}
              onClick={() => onSendKey('chdown')}
              loading={loading === 'chdown'}
            />
          </div>
        </GlassCard>
      </div>

      {/* Media Controls */}
      <GlassCard padding="md">
        <div className="text-center mb-4">
          <SectionLabel>Media</SectionLabel>
        </div>
        <div className="flex justify-center gap-2">
          {[
            { key: 'rewind', icon: Rewind },
            { key: 'play', icon: Play },
            { key: 'pause', icon: Pause },
            { key: 'stop', icon: Square },
            { key: 'ff', icon: FastForward },
          ].map(({ key, icon: Icon }) => (
            <PremiumButton
              key={key}
              variant="ghost"
              size="icon"
              icon={<Icon className="w-5 h-5" />}
              onClick={() => onSendKey(key)}
              loading={loading === key}
            />
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

// Chromecast Panel - Full functionality
function ChromecastPanel({
  showToast,
}: {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}) {
  const [devices, setDevices] = useState<ChromecastDevice[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<ChromecastDevice | null>(null);

  // Fetch Chromecast devices
  const fetchDevices = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/chromecast/status');
      const data = await res.json();
      if (data.success && data.devices) {
        setDevices(data.devices);
        if (data.devices.length > 0 && !selectedDevice) {
          setSelectedDevice(data.devices[0]);
        }
      }
    } catch {
      showToast('Failed to find Chromecasts', 'error');
    } finally {
      setRefreshing(false);
    }
  }, [selectedDevice, showToast]);

  // Send control command
  const sendControl = useCallback(
    async (action: string, value?: number) => {
      setLoading(action);
      try {
        const res = await fetch('/api/chromecast/control', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, value }),
        });
        const data = await res.json();
        if (!data.success) {
          showToast(data.error || 'Failed', 'error');
        }
      } catch {
        showToast('Failed to send command', 'error');
      } finally {
        setLoading(null);
      }
    },
    [showToast]
  );

  // Launch app
  const launchApp = useCallback(
    async (appKey: string) => {
      setLoading(appKey);
      try {
        const res = await fetch('/api/chromecast/app', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ app: appKey }),
        });
        const data = await res.json();
        if (data.success) {
          showToast(`Launching ${data.app}`, 'success');
        } else {
          showToast(data.error || 'Failed to launch', 'error');
        }
      } catch {
        showToast('Failed to launch app', 'error');
      } finally {
        setLoading(null);
      }
    },
    [showToast]
  );

  // Load devices on mount
  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  // App icon mapping
  const getAppIcon = (iconName: string) => {
    const icons: Record<string, typeof Youtube> = {
      Youtube,
      Film,
      Music,
      Play,
      Sparkles,
      MonitorPlay,
    };
    return icons[iconName] || Cast;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-semibold text-[hsl(0,0%,10%)] tracking-tight">Chromecast</h1>
          <p className="text-sm text-[hsl(0,0%,50%)] mt-0.5">
            {devices.length > 0 ? `${devices.length} device${devices.length > 1 ? 's' : ''} found` : 'Searching...'}
          </p>
        </div>
        <PremiumButton
          variant="glass"
          size="icon"
          icon={<RefreshCw className={cn('w-5 h-5', refreshing && 'animate-spin')} />}
          onClick={fetchDevices}
          disabled={refreshing}
        />
      </div>

      {/* Device Selection */}
      {devices.length > 0 && (
        <GlassCard padding="md">
          <div className="mb-3">
            <SectionLabel>Device</SectionLabel>
          </div>
          <div className="space-y-2">
            {devices.map((device) => (
              <motion.button
                key={device.ip}
                className={cn(
                  'w-full flex items-center justify-between p-3 rounded-xl',
                  'transition-all duration-150',
                  selectedDevice?.ip === device.ip
                    ? 'bg-[hsl(211,100%,50%)] text-white'
                    : 'bg-[hsla(0,0%,0%,0.03)] text-[hsl(0,0%,20%)]'
                )}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedDevice(device)}
              >
                <div className="flex items-center gap-3">
                  <Cast className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">{device.name}</div>
                    <div className={cn('text-xs', selectedDevice?.ip === device.ip ? 'text-white/70' : 'text-[hsl(0,0%,50%)]')}>
                      {device.app || 'Idle'} • {device.volume !== null ? `${device.volume}%` : '--'}
                    </div>
                  </div>
                </div>
                {device.muted && <VolumeX className="w-4 h-4 opacity-60" />}
              </motion.button>
            ))}
          </div>
        </GlassCard>
      )}

      {/* No devices found */}
      {devices.length === 0 && !refreshing && (
        <GlassCard padding="lg" className="text-center">
          <Cast className="w-12 h-12 mx-auto mb-4 text-[hsl(0,0%,70%)]" />
          <p className="text-[hsl(0,0%,50%)] mb-4">No Chromecasts found</p>
          <PremiumButton variant="primary" onClick={fetchDevices} icon={<RefreshCw className="w-4 h-4" />}>
            Scan Again
          </PremiumButton>
        </GlassCard>
      )}

      {/* Controls */}
      {selectedDevice && (
        <>
          {/* Media Controls */}
          <GlassCard padding="md">
            <div className="text-center mb-4">
              <SectionLabel>Playback</SectionLabel>
            </div>
            <div className="flex justify-center gap-2">
              <PremiumButton
                variant="ghost"
                size="icon"
                icon={<SkipBack className="w-5 h-5" />}
                onClick={() => sendControl('rewind')}
                loading={loading === 'rewind'}
              />
              <PremiumButton
                variant="glass"
                size="icon"
                icon={<Play className="w-5 h-5" />}
                onClick={() => sendControl('play')}
                loading={loading === 'play'}
              />
              <PremiumButton
                variant="glass"
                size="icon"
                icon={<Pause className="w-5 h-5" />}
                onClick={() => sendControl('pause')}
                loading={loading === 'pause'}
              />
              <PremiumButton
                variant="glass"
                size="icon"
                icon={<Square className="w-5 h-5" />}
                onClick={() => sendControl('stop')}
                loading={loading === 'stop'}
              />
              <PremiumButton
                variant="ghost"
                size="icon"
                icon={<SkipForward className="w-5 h-5" />}
                onClick={() => sendControl('forward')}
                loading={loading === 'forward'}
              />
            </div>
          </GlassCard>

          {/* Volume */}
          <GlassCard padding="md">
            <div className="text-center mb-3">
              <SectionLabel>Volume</SectionLabel>
            </div>
            <div className="flex justify-center items-center gap-4">
              <PremiumButton
                variant="ghost"
                size="icon"
                icon={<ChevronDown className="w-6 h-6" />}
                onClick={() => sendControl('voldown')}
                loading={loading === 'voldown'}
              />
              <div className="w-16 text-center">
                <span className="text-2xl font-semibold text-[hsl(0,0%,20%)]">
                  {selectedDevice.volume ?? '--'}%
                </span>
              </div>
              <PremiumButton
                variant="ghost"
                size="icon"
                icon={<ChevronUp className="w-6 h-6" />}
                onClick={() => sendControl('volup')}
                loading={loading === 'volup'}
              />
              <PremiumButton
                variant={selectedDevice.muted ? 'danger' : 'glass'}
                size="icon"
                icon={<VolumeX className="w-5 h-5" />}
                onClick={() => sendControl(selectedDevice.muted ? 'unmute' : 'mute')}
                loading={loading === 'mute' || loading === 'unmute'}
              />
            </div>
          </GlassCard>

          {/* Apps */}
          <div>
            <div className="mb-3 px-1">
              <SectionLabel>Apps</SectionLabel>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(CHROMECAST_APPS).map(([key, app]) => {
                const Icon = getAppIcon(app.icon);
                return (
                  <motion.button
                    key={key}
                    className={cn(
                      'flex flex-col items-center justify-center gap-2 p-4',
                      'rounded-2xl',
                      'transition-all duration-150',
                      'active:scale-[0.97]'
                    )}
                    style={{
                      background: `linear-gradient(135deg, ${app.color}20 0%, ${app.color}10 100%)`,
                      border: `1px solid ${app.color}30`,
                    }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => launchApp(key)}
                    disabled={loading === key}
                  >
                    {loading === key ? (
                      <Loader2 className="w-8 h-8 animate-spin" style={{ color: app.color }} />
                    ) : (
                      <Icon className="w-8 h-8" style={{ color: app.color }} />
                    )}
                    <span className="text-xs font-medium text-[hsl(0,0%,30%)]">{app.name}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// PS5 Panel
function PS5Panel() {
  return (
    <div className="space-y-8">
      <div className="pt-2">
        <h1 className="text-2xl font-semibold text-[hsl(0,0%,10%)] tracking-tight">PlayStation 5</h1>
      </div>
      <GlassCard padding="lg" className="text-center">
        <Gamepad2 className="w-12 h-12 mx-auto mb-4 text-[hsl(0,0%,70%)]" />
        <p className="text-[hsl(0,0%,50%)]">Coming soon</p>
      </GlassCard>
    </div>
  );
}

// Apps Panel
function AppsPanel({
  onLaunchApp,
  loading,
}: {
  onLaunchApp: (appId: string) => void;
  loading: string | null;
}) {
  return (
    <div className="space-y-8">
      <div className="pt-2">
        <h1 className="text-2xl font-semibold text-[hsl(0,0%,10%)] tracking-tight">Apps</h1>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {APP_DEFINITIONS.map((app, index) => (
          <motion.button
            key={app.id}
            className={cn(
              'flex flex-col items-center justify-center gap-3 p-4',
              'rounded-2xl',
              'transition-all duration-150',
              'active:scale-[0.97]',
              'focus-visible:ring-2 focus-visible:ring-[hsl(211,100%,50%)]',
              'disabled:opacity-40'
            )}
            style={{
              background: 'hsla(0,0%,100%,0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid hsla(0,0%,0%,0.06)',
            }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring.gentle, delay: index * 0.03 }}
            onClick={() => onLaunchApp(app.id)}
            disabled={loading === app.id}
          >
            {loading === app.id ? (
              <Loader2 className="w-10 h-10 animate-spin text-[hsl(211,100%,50%)]" />
            ) : (
              <div
                className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${app.color}15 0%, ${app.color}08 100%)`,
                  border: `1px solid ${app.color}20`,
                }}
              >
                <img
                  src={app.icon}
                  alt={app.name}
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    // Fallback to first letter if icon fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = `<span style="color: ${app.color}; font-size: 20px; font-weight: 600">${app.name[0]}</span>`;
                  }}
                />
              </div>
            )}
            <span className="text-xs font-medium text-[hsl(0,0%,30%)]">{app.name}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// Settings Panel
function SettingsPanel() {
  return (
    <div className="space-y-8">
      <div className="pt-2">
        <h1 className="text-2xl font-semibold text-[hsl(0,0%,10%)] tracking-tight">Settings</h1>
      </div>

      <GlassCard padding="none">
        <div className="divide-y divide-[hsla(0,0%,0%,0.06)]">
          {[
            { label: 'TV IP Address', value: TV_CONFIG.ip },
            { label: 'App Name', value: 'Remote Control' },
            { label: 'Version', value: '2.0.0' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between p-4">
              <span className="text-[hsl(0,0%,20%)]">{label}</span>
              <span className="text-[hsl(0,0%,50%)]">{value}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard padding="md" className="text-center">
        <p className="text-sm text-[hsl(0,0%,50%)]">
          Built for seamless entertainment control
        </p>
      </GlassCard>
    </div>
  );
}

// Tab Bar - Light theme
function TabBar({
  activeTab,
  onTabChange,
}: {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}) {
  const tabs: { id: TabId; label: string; icon: typeof Tv }[] = [
    { id: 'tv', label: 'TV', icon: Tv },
    { id: 'chromecast', label: 'Cast', icon: Cast },
    { id: 'ps5', label: 'PS5', icon: Gamepad2 },
    { id: 'apps', label: 'Apps', icon: Grid3X3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav
      className="flex items-center justify-around px-2 py-2"
      style={{
        background: 'hsla(0,0%,98%,0.9)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        borderTop: '1px solid hsla(0,0%,0%,0.08)',
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        const Icon = tab.icon;

        return (
          <motion.button
            key={tab.id}
            className={cn(
              'relative flex flex-col items-center justify-center',
              'min-w-[64px] py-1.5 px-3 rounded-xl',
              'transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(211,100%,50%)]'
            )}
            style={{
              color: isActive ? 'hsl(211,100%,50%)' : 'hsl(0,0%,50%)',
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTabChange(tab.id)}
          >
            <Icon
              className="w-6 h-6 mb-0.5"
              style={{
                transform: isActive ? 'scale(1.1) translateY(-1px)' : 'scale(1)',
                transition: 'transform 150ms ease-out',
              }}
            />
            <span
              className="text-[10px] font-medium"
              style={{ opacity: isActive ? 1 : 0.7 }}
            >
              {tab.label}
            </span>
          </motion.button>
        );
      })}
    </nav>
  );
}

// Main App
export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('tv');
  const [loading, setLoading] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const checkConnection = useCallback(async () => {
    try {
      const res = await fetch('/api/tv/connect');
      const data = await res.json();
      setConnected(data.connected || false);
    } catch {
      setConnected(false);
    }
  }, []);

  const sendKey = useCallback(
    async (key: string) => {
      setLoading(key);
      try {
        const res = await fetch('/api/tv/key', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key }),
        });
        const data = await res.json();
        if (!data.success && data.error) {
          showToast(data.error, 'error');
        }
      } catch {
        showToast('Failed to send command', 'error');
      } finally {
        setLoading(null);
      }
    },
    [showToast]
  );

  const launchApp = useCallback(
    async (appId: string) => {
      setLoading(appId);
      try {
        const res = await fetch('/api/tv/app', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ app: appId }),
        });
        const data = await res.json();
        if (data.success) {
          showToast(`Launching ${appId}`, 'success');
        } else {
          showToast(data.error || 'Failed to launch app', 'error');
        }
      } catch {
        showToast('Failed to launch app', 'error');
      } finally {
        setLoading(null);
      }
    },
    [showToast]
  );

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, [checkConnection]);

  return (
    <main
      className="min-h-screen"
      style={{
        background: 'linear-gradient(180deg, hsl(0,0%,97%) 0%, hsl(0,0%,94%) 100%)',
      }}
    >
      {/* Toast */}
      <AnimatePresence>{toast && <Toast message={toast.message} type={toast.type} />}</AnimatePresence>

      {/* Content */}
      <div className="px-5 pt-6 pb-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={spring.default}
          >
            {activeTab === 'tv' && (
              <TVPanel onSendKey={sendKey} loading={loading} connected={connected} />
            )}
            {activeTab === 'chromecast' && <ChromecastPanel showToast={showToast} />}
            {activeTab === 'ps5' && <PS5Panel />}
            {activeTab === 'apps' && <AppsPanel onLaunchApp={launchApp} loading={loading} />}
            {activeTab === 'settings' && <SettingsPanel />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 pb-safe">
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </main>
  );
}

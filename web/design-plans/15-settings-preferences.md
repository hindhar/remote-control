# Plan 15: Settings & Preferences

**Focus**: Apple Settings app-inspired UI with grouped sections, intuitive controls, and persistent user preferences.

---

## Key Decisions

1. **iOS Settings Pattern**: Grouped sections with rounded containers, descriptive subtitles
2. **Instant Persistence**: Changes apply immediately with optimistic UI
3. **Hierarchical Navigation**: Drill-down pattern for complex settings
4. **Search Integration**: Quick settings search for discoverability
5. **Profile Sync**: Option to sync settings across devices (future)

---

## Implementation Steps

### Step 1: Settings Store

```typescript
// src/store/settings-store.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AppSettings {
  // Display
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  reduceTransparency: boolean;

  // Behavior
  hapticFeedback: boolean;
  hapticIntensity: 'light' | 'medium' | 'strong';
  soundEffects: boolean;
  soundVolume: number;

  // Remote Control
  buttonSize: 'compact' | 'regular' | 'large';
  showButtonLabels: boolean;
  confirmPowerOff: boolean;
  longPressDelay: number;

  // Devices
  defaultDevice: string;
  autoConnectOnOpen: boolean;
  showOfflineDevices: boolean;

  // Accessibility
  largeText: boolean;
  boldText: boolean;
  reduceMotion: boolean;
  increaseContrast: boolean;

  // Privacy
  analyticsEnabled: boolean;
  crashReportsEnabled: boolean;

  // Advanced
  developerMode: boolean;
  debugOverlay: boolean;
  wsReconnectDelay: number;
}

interface SettingsState extends AppSettings {
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  resetSettings: () => void;
}

const defaultSettings: AppSettings = {
  // Display
  theme: 'system',
  accentColor: '#0A84FF',
  reduceTransparency: false,

  // Behavior
  hapticFeedback: true,
  hapticIntensity: 'medium',
  soundEffects: false,
  soundVolume: 50,

  // Remote Control
  buttonSize: 'regular',
  showButtonLabels: true,
  confirmPowerOff: true,
  longPressDelay: 500,

  // Devices
  defaultDevice: '',
  autoConnectOnOpen: true,
  showOfflineDevices: false,

  // Accessibility
  largeText: false,
  boldText: false,
  reduceMotion: false,
  increaseContrast: false,

  // Privacy
  analyticsEnabled: false,
  crashReportsEnabled: true,

  // Advanced
  developerMode: false,
  debugOverlay: false,
  wsReconnectDelay: 1000,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      updateSetting: (key, value) =>
        set((state) => ({ ...state, [key]: value })),

      resetSettings: () => set(defaultSettings),
    }),
    {
      name: 'tv-remote-settings',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      migrate: (persistedState: any, version) => {
        if (version === 0) {
          // Migration from v0 to v1
          return { ...defaultSettings, ...persistedState };
        }
        return persistedState;
      },
    }
  )
);

// Selectors
export const selectTheme = (state: SettingsState) => state.theme;
export const selectHapticFeedback = (state: SettingsState) => state.hapticFeedback;
export const selectButtonSize = (state: SettingsState) => state.buttonSize;
```

### Step 2: Settings List Components

```typescript
// src/components/settings/SettingsList.tsx

'use client';

import React from 'react';
import { GlassSurface } from '../atoms/GlassSurface';
import { cn } from '@/lib/utils';

interface SettingsGroupProps {
  title?: string;
  footer?: string;
  children: React.ReactNode;
}

export function SettingsGroup({ title, footer, children }: SettingsGroupProps) {
  return (
    <div className="mb-8">
      {title && (
        <h3 className="mb-2 px-4 text-sm font-medium uppercase tracking-wide text-[var(--color-fg-secondary)]">
          {title}
        </h3>
      )}
      <GlassSurface
        material="thin"
        border="subtle"
        className="divide-y divide-[var(--color-separator)] rounded-xl"
      >
        {children}
      </GlassSurface>
      {footer && (
        <p className="mt-2 px-4 text-sm text-[var(--color-fg-tertiary)]">
          {footer}
        </p>
      )}
    </div>
  );
}

interface SettingsRowProps {
  icon?: React.ReactNode;
  iconColor?: string;
  label: string;
  subtitle?: string;
  value?: React.ReactNode;
  accessory?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export function SettingsRow({
  icon,
  iconColor = 'var(--color-blue)',
  label,
  subtitle,
  value,
  accessory,
  onClick,
  disabled = false,
}: SettingsRowProps) {
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex w-full items-center gap-3 px-4 py-3',
        onClick && 'hover:bg-[var(--color-fill-quaternary)] transition-colors',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {/* Icon */}
      {icon && (
        <div
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: iconColor }}
        >
          <span className="text-white">{icon}</span>
        </div>
      )}

      {/* Label & Subtitle */}
      <div className="flex-1 text-left">
        <div className="text-[var(--color-fg-primary)]">{label}</div>
        {subtitle && (
          <div className="text-sm text-[var(--color-fg-secondary)]">
            {subtitle}
          </div>
        )}
      </div>

      {/* Value */}
      {value && (
        <div className="text-[var(--color-fg-secondary)]">{value}</div>
      )}

      {/* Accessory */}
      {accessory}

      {/* Disclosure indicator for navigation */}
      {onClick && !accessory && (
        <svg
          className="h-4 w-4 text-[var(--color-fg-quaternary)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      )}
    </Component>
  );
}
```

### Step 3: Settings Controls

```typescript
// src/components/settings/SettingsControls.tsx

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHaptics } from '@/hooks/useHaptics';

// Toggle Switch
interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  size = 'md',
}: ToggleSwitchProps) {
  const { trigger } = useHaptics();

  const handleChange = () => {
    if (disabled) return;
    trigger('selection');
    onChange(!checked);
  };

  const sizes = {
    sm: { track: 'h-6 w-10', thumb: 'h-5 w-5', translate: 16 },
    md: { track: 'h-8 w-14', thumb: 'h-6 w-6', translate: 24 },
  };

  const s = sizes[size];

  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={handleChange}
      disabled={disabled}
      className={cn(
        'relative flex-shrink-0 rounded-full p-1 transition-colors',
        checked ? 'bg-[var(--color-green)]' : 'bg-[var(--color-fill-secondary)]',
        disabled && 'opacity-50 cursor-not-allowed',
        s.track
      )}
    >
      <motion.div
        className={cn('rounded-full bg-white shadow-sm', s.thumb)}
        animate={{ x: checked ? s.translate : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

// Slider
interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  showValue?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Slider({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  disabled = false,
  showValue = false,
  leftIcon,
  rightIcon,
}: SliderProps) {
  const { trigger } = useHaptics();
  const percentage = ((value - min) / (max - min)) * 100;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    onChange(newValue);

    // Haptic at ends and middle
    if (newValue === min || newValue === max || newValue === (max - min) / 2 + min) {
      trigger('selection');
    }
  };

  return (
    <div className="flex items-center gap-3">
      {leftIcon && (
        <span className="text-[var(--color-fg-secondary)]">{leftIcon}</span>
      )}

      <div className="relative flex-1">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center">
          <div
            className="h-1.5 rounded-full bg-[var(--color-blue)]"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={cn(
            'w-full appearance-none bg-transparent',
            'h-1.5 rounded-full bg-[var(--color-fill-secondary)]',
            '[&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6',
            '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white',
            '[&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />
      </div>

      {rightIcon && (
        <span className="text-[var(--color-fg-secondary)]">{rightIcon}</span>
      )}

      {showValue && (
        <span className="w-12 text-right text-[var(--color-fg-secondary)]">
          {value}
        </span>
      )}
    </div>
  );
}

// Segmented Control
interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  disabled = false,
}: SegmentedControlProps<T>) {
  const { trigger } = useHaptics();

  return (
    <div
      className={cn(
        'flex rounded-lg bg-[var(--color-fill-tertiary)] p-1',
        disabled && 'opacity-50'
      )}
      role="radiogroup"
    >
      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <button
            key={option.value}
            role="radio"
            aria-checked={isSelected}
            onClick={() => {
              if (!disabled && option.value !== value) {
                trigger('selection');
                onChange(option.value);
              }
            }}
            disabled={disabled}
            className={cn(
              'relative flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors',
              isSelected
                ? 'text-[var(--color-fg-primary)]'
                : 'text-[var(--color-fg-secondary)]'
            )}
          >
            {isSelected && (
              <motion.div
                layoutId="segment-indicator"
                className="absolute inset-0 rounded-md bg-[var(--color-bg-elevated)] shadow-sm"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// Picker Row (for selection lists)
interface PickerRowProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

export function PickerRow({ label, selected, onClick }: PickerRowProps) {
  const { trigger } = useHaptics();

  return (
    <button
      onClick={() => {
        trigger('selection');
        onClick();
      }}
      className="flex w-full items-center justify-between px-4 py-3 hover:bg-[var(--color-fill-quaternary)]"
    >
      <span className="text-[var(--color-fg-primary)]">{label}</span>
      {selected && (
        <Check className="h-5 w-5 text-[var(--color-blue)]" />
      )}
    </button>
  );
}

// Color Picker
interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  colors?: string[];
}

const defaultColors = [
  '#0A84FF', // Blue
  '#32D74B', // Green
  '#FF9F0A', // Orange
  '#FF453A', // Red
  '#BF5AF2', // Purple
  '#FF375F', // Pink
  '#64D2FF', // Teal
  '#FFD60A', // Yellow
];

export function ColorPicker({
  value,
  onChange,
  colors = defaultColors,
}: ColorPickerProps) {
  const { trigger } = useHaptics();

  return (
    <div className="flex flex-wrap gap-3">
      {colors.map((color) => {
        const isSelected = color === value;

        return (
          <button
            key={color}
            onClick={() => {
              trigger('selection');
              onChange(color);
            }}
            className={cn(
              'h-10 w-10 rounded-full transition-transform',
              isSelected && 'ring-2 ring-white ring-offset-2 ring-offset-[var(--color-bg-primary)]'
            )}
            style={{ backgroundColor: color }}
            aria-label={`Select color ${color}`}
            aria-pressed={isSelected}
          >
            {isSelected && (
              <Check className="h-5 w-5 text-white mx-auto" />
            )}
          </button>
        );
      })}
    </div>
  );
}
```

### Step 4: Settings Page Component

```typescript
// src/components/pages/SettingsPage.tsx

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette,
  Bell,
  Vibrate,
  Tv,
  Wifi,
  Eye,
  Shield,
  Wrench,
  ChevronLeft,
  Sun,
  Moon,
  Monitor,
  Volume2,
  VolumeX,
  LayoutGrid,
  Type,
} from 'lucide-react';
import { useSettingsStore } from '@/store/settings-store';
import { SettingsGroup, SettingsRow } from '../settings/SettingsList';
import {
  ToggleSwitch,
  Slider,
  SegmentedControl,
  ColorPicker,
} from '../settings/SettingsControls';
import { GlassSurface } from '../atoms/GlassSurface';
import { cn } from '@/lib/utils';

type SettingsSection = 'main' | 'display' | 'behavior' | 'remote' | 'devices' | 'accessibility' | 'privacy' | 'advanced';

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('main');
  const settings = useSettingsStore();

  const navigate = (section: SettingsSection) => {
    setActiveSection(section);
  };

  const goBack = () => {
    setActiveSection('main');
  };

  return (
    <div className="mx-auto max-w-xl pb-safe">
      <AnimatePresence mode="wait">
        {activeSection === 'main' ? (
          <motion.div
            key="main"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <MainSettings onNavigate={navigate} />
          </motion.div>
        ) : (
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <SubSettings section={activeSection} onBack={goBack} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MainSettings({ onNavigate }: { onNavigate: (section: SettingsSection) => void }) {
  const settings = useSettingsStore();

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold text-[var(--color-fg-primary)]">
        Settings
      </h1>

      <SettingsGroup>
        <SettingsRow
          icon={<Palette className="h-4 w-4" />}
          iconColor="#0A84FF"
          label="Display"
          value={settings.theme === 'system' ? 'Auto' : settings.theme}
          onClick={() => onNavigate('display')}
        />
        <SettingsRow
          icon={<Vibrate className="h-4 w-4" />}
          iconColor="#FF9F0A"
          label="Haptics & Sound"
          value={settings.hapticFeedback ? 'On' : 'Off'}
          onClick={() => onNavigate('behavior')}
        />
        <SettingsRow
          icon={<Tv className="h-4 w-4" />}
          iconColor="#32D74B"
          label="Remote Control"
          onClick={() => onNavigate('remote')}
        />
      </SettingsGroup>

      <SettingsGroup>
        <SettingsRow
          icon={<Wifi className="h-4 w-4" />}
          iconColor="#5AC8FA"
          label="Devices"
          onClick={() => onNavigate('devices')}
        />
      </SettingsGroup>

      <SettingsGroup>
        <SettingsRow
          icon={<Eye className="h-4 w-4" />}
          iconColor="#BF5AF2"
          label="Accessibility"
          onClick={() => onNavigate('accessibility')}
        />
        <SettingsRow
          icon={<Shield className="h-4 w-4" />}
          iconColor="#FF375F"
          label="Privacy"
          onClick={() => onNavigate('privacy')}
        />
      </SettingsGroup>

      <SettingsGroup>
        <SettingsRow
          icon={<Wrench className="h-4 w-4" />}
          iconColor="#8E8E93"
          label="Advanced"
          onClick={() => onNavigate('advanced')}
        />
      </SettingsGroup>

      <div className="pt-4 text-center text-sm text-[var(--color-fg-tertiary)]">
        <p>TV Remote Control v1.0.0</p>
        <p className="mt-1">Made with care</p>
      </div>
    </div>
  );
}

function SubSettings({
  section,
  onBack,
}: {
  section: SettingsSection;
  onBack: () => void;
}) {
  const settings = useSettingsStore();

  const titles: Record<SettingsSection, string> = {
    main: 'Settings',
    display: 'Display',
    behavior: 'Haptics & Sound',
    remote: 'Remote Control',
    devices: 'Devices',
    accessibility: 'Accessibility',
    privacy: 'Privacy',
    advanced: 'Advanced',
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-[var(--color-blue)]"
        >
          <ChevronLeft className="h-5 w-5" />
          <span>Back</span>
        </button>
        <h1 className="text-xl font-semibold text-[var(--color-fg-primary)]">
          {titles[section]}
        </h1>
      </div>

      {/* Content based on section */}
      {section === 'display' && <DisplaySettings />}
      {section === 'behavior' && <BehaviorSettings />}
      {section === 'remote' && <RemoteSettings />}
      {section === 'devices' && <DevicesSettings />}
      {section === 'accessibility' && <AccessibilitySettings />}
      {section === 'privacy' && <PrivacySettings />}
      {section === 'advanced' && <AdvancedSettings />}
    </div>
  );
}

function DisplaySettings() {
  const { theme, accentColor, reduceTransparency, updateSetting } = useSettingsStore();

  return (
    <div className="space-y-6">
      <SettingsGroup title="Appearance">
        <div className="px-4 py-4">
          <SegmentedControl
            options={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'system', label: 'Auto' },
            ]}
            value={theme}
            onChange={(value) => updateSetting('theme', value)}
          />
        </div>
      </SettingsGroup>

      <SettingsGroup title="Accent Color">
        <div className="px-4 py-4">
          <ColorPicker
            value={accentColor}
            onChange={(color) => updateSetting('accentColor', color)}
          />
        </div>
      </SettingsGroup>

      <SettingsGroup
        title="Transparency"
        footer="Reduces blur effects on glass surfaces for better performance."
      >
        <SettingsRow
          label="Reduce Transparency"
          accessory={
            <ToggleSwitch
              checked={reduceTransparency}
              onChange={(checked) => updateSetting('reduceTransparency', checked)}
            />
          }
        />
      </SettingsGroup>
    </div>
  );
}

function BehaviorSettings() {
  const {
    hapticFeedback,
    hapticIntensity,
    soundEffects,
    soundVolume,
    updateSetting,
  } = useSettingsStore();

  return (
    <div className="space-y-6">
      <SettingsGroup title="Haptic Feedback">
        <SettingsRow
          label="Haptic Feedback"
          accessory={
            <ToggleSwitch
              checked={hapticFeedback}
              onChange={(checked) => updateSetting('hapticFeedback', checked)}
            />
          }
        />
        <div className="px-4 py-4">
          <p className="mb-3 text-sm text-[var(--color-fg-secondary)]">
            Intensity
          </p>
          <SegmentedControl
            options={[
              { value: 'light', label: 'Light' },
              { value: 'medium', label: 'Medium' },
              { value: 'strong', label: 'Strong' },
            ]}
            value={hapticIntensity}
            onChange={(value) => updateSetting('hapticIntensity', value)}
            disabled={!hapticFeedback}
          />
        </div>
      </SettingsGroup>

      <SettingsGroup title="Sound Effects">
        <SettingsRow
          label="Sound Effects"
          accessory={
            <ToggleSwitch
              checked={soundEffects}
              onChange={(checked) => updateSetting('soundEffects', checked)}
            />
          }
        />
        <div className="px-4 py-4">
          <Slider
            value={soundVolume}
            onChange={(value) => updateSetting('soundVolume', value)}
            disabled={!soundEffects}
            leftIcon={<VolumeX className="h-4 w-4" />}
            rightIcon={<Volume2 className="h-4 w-4" />}
          />
        </div>
      </SettingsGroup>
    </div>
  );
}

function RemoteSettings() {
  const {
    buttonSize,
    showButtonLabels,
    confirmPowerOff,
    longPressDelay,
    updateSetting,
  } = useSettingsStore();

  return (
    <div className="space-y-6">
      <SettingsGroup title="Button Size">
        <div className="px-4 py-4">
          <SegmentedControl
            options={[
              { value: 'compact', label: 'Compact' },
              { value: 'regular', label: 'Regular' },
              { value: 'large', label: 'Large' },
            ]}
            value={buttonSize}
            onChange={(value) => updateSetting('buttonSize', value)}
          />
        </div>
      </SettingsGroup>

      <SettingsGroup>
        <SettingsRow
          label="Show Button Labels"
          accessory={
            <ToggleSwitch
              checked={showButtonLabels}
              onChange={(checked) => updateSetting('showButtonLabels', checked)}
            />
          }
        />
        <SettingsRow
          label="Confirm Power Off"
          subtitle="Show confirmation before turning off TV"
          accessory={
            <ToggleSwitch
              checked={confirmPowerOff}
              onChange={(checked) => updateSetting('confirmPowerOff', checked)}
            />
          }
        />
      </SettingsGroup>

      <SettingsGroup
        title="Long Press Delay"
        footer="How long to hold before triggering long press actions."
      >
        <div className="px-4 py-4">
          <Slider
            value={longPressDelay}
            min={200}
            max={1000}
            step={50}
            onChange={(value) => updateSetting('longPressDelay', value)}
            showValue
          />
          <p className="mt-2 text-sm text-[var(--color-fg-tertiary)]">
            {longPressDelay}ms
          </p>
        </div>
      </SettingsGroup>
    </div>
  );
}

function DevicesSettings() {
  const {
    defaultDevice,
    autoConnectOnOpen,
    showOfflineDevices,
    updateSetting,
  } = useSettingsStore();

  return (
    <div className="space-y-6">
      <SettingsGroup>
        <SettingsRow
          label="Auto-Connect on Open"
          subtitle="Automatically connect to last used device"
          accessory={
            <ToggleSwitch
              checked={autoConnectOnOpen}
              onChange={(checked) => updateSetting('autoConnectOnOpen', checked)}
            />
          }
        />
        <SettingsRow
          label="Show Offline Devices"
          accessory={
            <ToggleSwitch
              checked={showOfflineDevices}
              onChange={(checked) => updateSetting('showOfflineDevices', checked)}
            />
          }
        />
      </SettingsGroup>

      <SettingsGroup title="Connected Devices">
        <SettingsRow
          icon={<Tv className="h-4 w-4" />}
          iconColor="#32D74B"
          label="Living Room TV"
          subtitle="Samsung QN65Q80T"
          value="Connected"
        />
      </SettingsGroup>
    </div>
  );
}

function AccessibilitySettings() {
  const {
    largeText,
    boldText,
    reduceMotion,
    increaseContrast,
    updateSetting,
  } = useSettingsStore();

  return (
    <div className="space-y-6">
      <SettingsGroup title="Vision">
        <SettingsRow
          label="Large Text"
          accessory={
            <ToggleSwitch
              checked={largeText}
              onChange={(checked) => updateSetting('largeText', checked)}
            />
          }
        />
        <SettingsRow
          label="Bold Text"
          accessory={
            <ToggleSwitch
              checked={boldText}
              onChange={(checked) => updateSetting('boldText', checked)}
            />
          }
        />
        <SettingsRow
          label="Increase Contrast"
          accessory={
            <ToggleSwitch
              checked={increaseContrast}
              onChange={(checked) => updateSetting('increaseContrast', checked)}
            />
          }
        />
      </SettingsGroup>

      <SettingsGroup title="Motion">
        <SettingsRow
          label="Reduce Motion"
          subtitle="Minimizes animations and auto-play effects"
          accessory={
            <ToggleSwitch
              checked={reduceMotion}
              onChange={(checked) => updateSetting('reduceMotion', checked)}
            />
          }
        />
      </SettingsGroup>
    </div>
  );
}

function PrivacySettings() {
  const { analyticsEnabled, crashReportsEnabled, updateSetting } = useSettingsStore();

  return (
    <div className="space-y-6">
      <SettingsGroup
        title="Analytics & Diagnostics"
        footer="Analytics data helps improve the app but is completely optional."
      >
        <SettingsRow
          label="Share Analytics"
          accessory={
            <ToggleSwitch
              checked={analyticsEnabled}
              onChange={(checked) => updateSetting('analyticsEnabled', checked)}
            />
          }
        />
        <SettingsRow
          label="Share Crash Reports"
          accessory={
            <ToggleSwitch
              checked={crashReportsEnabled}
              onChange={(checked) => updateSetting('crashReportsEnabled', checked)}
            />
          }
        />
      </SettingsGroup>
    </div>
  );
}

function AdvancedSettings() {
  const {
    developerMode,
    debugOverlay,
    wsReconnectDelay,
    updateSetting,
    resetSettings,
  } = useSettingsStore();

  return (
    <div className="space-y-6">
      <SettingsGroup>
        <SettingsRow
          label="Developer Mode"
          accessory={
            <ToggleSwitch
              checked={developerMode}
              onChange={(checked) => updateSetting('developerMode', checked)}
            />
          }
        />
        {developerMode && (
          <>
            <SettingsRow
              label="Debug Overlay"
              accessory={
                <ToggleSwitch
                  checked={debugOverlay}
                  onChange={(checked) => updateSetting('debugOverlay', checked)}
                />
              }
            />
            <div className="px-4 py-4">
              <p className="mb-2 text-sm text-[var(--color-fg-secondary)]">
                WebSocket Reconnect Delay
              </p>
              <Slider
                value={wsReconnectDelay}
                min={500}
                max={5000}
                step={100}
                onChange={(value) => updateSetting('wsReconnectDelay', value)}
                showValue
              />
            </div>
          </>
        )}
      </SettingsGroup>

      <SettingsGroup>
        <button
          onClick={resetSettings}
          className="w-full px-4 py-3 text-center text-[var(--color-red)]"
        >
          Reset All Settings
        </button>
      </SettingsGroup>
    </div>
  );
}
```

---

## Integration Points

### Files to Create
- `src/store/settings-store.ts` - Zustand settings store with persistence
- `src/components/settings/SettingsList.tsx` - List UI components
- `src/components/settings/SettingsControls.tsx` - Control components
- `src/components/pages/SettingsPage.tsx` - Main settings page

### Files to Modify
- `src/app/page.tsx` - Add SettingsPage to Settings tab
- `package.json` - Ensure zustand is installed

---

## Technical Specifications

### Data Persistence
- Settings stored in `localStorage` under `tv-remote-settings`
- JSON format with version number for migrations
- Automatic migration on version upgrade

### Setting Categories
| Category | Settings Count | Complexity |
|----------|---------------|------------|
| Display | 3 | Low |
| Behavior | 4 | Medium |
| Remote | 4 | Low |
| Devices | 3 | Medium |
| Accessibility | 4 | Low |
| Privacy | 2 | Low |
| Advanced | 3 | Medium |

---

## Dependencies

### Required
- `zustand` - State management with persistence

### Already Present
- `framer-motion` - Animations
- `lucide-react` - Icons

---

## Success Criteria

1. **Persistence**: Settings survive page reload and app restart
2. **Immediate Effect**: Changes apply without save button
3. **Navigation**: Smooth transitions between sections
4. **Accessibility**: All controls keyboard accessible
5. **Responsiveness**: Works on all screen sizes
6. **Reset Capability**: Can restore default settings

---

## Estimated Effort

- **Settings Store**: 2 hours
- **List Components**: 2 hours
- **Control Components**: 4 hours
- **Settings Page**: 4 hours
- **Testing & Polish**: 2 hours
- **Total**: 14 hours (2 days)

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| LocalStorage quota exceeded | Low | Compress data, use IndexedDB for large data |
| Migration breaking old settings | Medium | Version-based migration with fallbacks |
| Too many settings overwhelm users | Medium | Group logically, hide advanced by default |
| Sync conflicts across tabs | Low | Use storage event listener for cross-tab sync |
| Settings not applying globally | High | Use Zustand selectors in all components |

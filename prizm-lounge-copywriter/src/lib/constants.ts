// Event Configuration
export const EVENT_CONFIG = {
  name: 'PANINI PRIZM LOUNGE',
  subtitle: 'Super Bowl LX - San Francisco',
  location: 'San Francisco, CA',
  dates: 'February 6-8, 2026',
  totalDays: 3,
};

// Day styles for color coding
export const DAY_STYLES = {
  Thursday: {
    day: 1,
    borderColor: 'border-blue-500/30',
    borderColorHover: 'hover:border-blue-500/50',
    borderColorActive: 'border-blue-500',
    badgeBg: 'bg-blue-500/20',
    badgeText: 'text-blue-400',
    label: 'Day 1',
    emoji: '1️⃣',
  },
  Friday: {
    day: 2,
    borderColor: 'border-violet-500/30',
    borderColorHover: 'hover:border-violet-500/50',
    borderColorActive: 'border-violet-500',
    badgeBg: 'bg-violet-500/20',
    badgeText: 'text-violet-400',
    label: 'Day 2',
    emoji: '2️⃣',
  },
  Saturday: {
    day: 3,
    borderColor: 'border-amber-500/30',
    borderColorHover: 'hover:border-amber-500/50',
    borderColorActive: 'border-amber-500',
    badgeBg: 'bg-amber-500/20',
    badgeText: 'text-amber-400',
    label: 'Day 3',
    emoji: '3️⃣',
  },
} as const;

// Station configuration
export const STATIONS = [
  {
    id: 'led-wall',
    name: 'LED Wall',
    shortName: 'LED',
    icon: '📺',
    color: '#22c55e',
    description: 'Photo shoot with LED wall backdrop',
    hasInterview: false,
  },
  {
    id: 'signing',
    name: 'Signing Station',
    shortName: 'Signing',
    icon: '✍️',
    color: '#eab308',
    description: 'Autograph session with interview questions',
    hasInterview: true,
  },
  {
    id: 'pr-interview',
    name: 'PR Interview',
    shortName: 'PR',
    icon: '🎤',
    color: '#3b82f6',
    description: 'Media interview and press session',
    hasInterview: true,
  },
  {
    id: 'pack-rips',
    name: 'Pack Rips',
    shortName: 'Rips',
    icon: '📦',
    color: '#ef4444',
    description: 'Card pack opening with interview questions',
    hasInterview: true,
  },
  {
    id: 'free',
    name: 'Free Time',
    shortName: 'Free',
    icon: '☕',
    color: '#6b7280',
    description: 'Break / available for additional content',
    hasInterview: false,
  },
] as const;

// View modes for the main page
export type ViewMode = 'now' | 'schedule' | 'station' | 'players';

export const VIEW_MODES = [
  { id: 'now' as ViewMode, label: 'Live Now', icon: '⚡', shortLabel: 'Now' },
  { id: 'schedule' as ViewMode, label: 'Schedule', icon: '📅', shortLabel: 'Schedule' },
  { id: 'station' as ViewMode, label: 'Station Tool', icon: '📻', shortLabel: 'Stations' },
  { id: 'players' as ViewMode, label: 'Players', icon: '👤', shortLabel: 'Players' },
] as const;

// Category badge styles
export const CATEGORY_STYLES = {
  Current: {
    bg: 'bg-green-500/20',
    text: 'text-green-400',
    border: 'border-green-500/30',
  },
  Legend: {
    bg: 'bg-yellow-500/20',
    text: 'text-yellow-400',
    border: 'border-yellow-500/30',
  },
  Prospect: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
  },
} as const;

// Player Types
export type PlayerCategory = 'Current' | 'Legend' | 'Prospect';

export type ContentMode =
  | 'Player Spotlight'
  | 'Pack Reveal / Hit'
  | 'Signing Session'
  | 'Legend Tribute'
  | 'Current Star Hype'
  | 'Event Promo'
  | 'Behind the Scenes'
  | 'Day Recap';

export type Platform = 'Instagram' | 'X' | 'TikTok' | 'Facebook';

export type CardType =
  | 'Base'
  | 'Prizm Silver'
  | 'Prizm Gold (/10)'
  | 'Prizm Black (/1)'
  | 'Select'
  | 'Auto'
  | 'Patch Auto'
  | 'Numbered Parallel'
  | '1/1'
  | 'Super Bowl Commemorative'
  | 'Legacy Insert';

export type Product =
  | 'Prizm'
  | 'Select'
  | 'Obsidian'
  | 'Spectra'
  | 'Immaculate'
  | 'National Treasures'
  | 'Flawless'
  | 'Optic'
  | 'Mosaic'
  | 'Donruss'
  | 'Contenders'
  | 'Plates & Patches';

export type ScheduleStatus = 'live' | 'upcoming' | 'completed' | 'scheduled';

export interface AppearanceSchedule {
  day: 'Thursday' | 'Friday' | 'Saturday';
  date: string; // "Feb 6", "Feb 7", "Feb 8"
  startTime: string; // "14:00"
  endTime: string; // "15:00"
}

export interface Player {
  id: string;
  name: string;
  category: PlayerCategory;
  team: string;
  position: string;
  keyStats: string[];
  definingMoments: string[];
  cardHistory: string[];
  personalDetails: string[];
  schedule: AppearanceSchedule | null;
  imageUrl?: string;
}

export interface PlayerNote {
  id: string;
  playerId: string;
  content: string;
  isQuote: boolean;
  timestamp: number;
}

export interface ContentTracking {
  playerId: string;
  mode: ContentMode;
  platform: Platform;
  usedAt: number;
}

export interface GeneratedContent {
  id: string;
  playerId: string;
  playerName: string;
  mode: ContentMode;
  platform: Platform;
  cardType?: CardType;
  serialNumber?: string;
  product?: Product;
  context?: string;
  variations: ContentVariation[];
  createdAt: number;
}

export interface ContentVariation {
  id: string;
  label: 'A' | 'B' | 'C';
  content: string;
  characterCount: number;
  used: boolean;
  savedAsTemplate: boolean;
}

export interface SavedTemplate {
  id: string;
  mode: ContentMode;
  platform: Platform;
  content: string;
  playerName: string;
  createdAt: number;
}

export interface DayRecapInput {
  highlights: string;
  totalAutosSigned?: number;
  bestPull?: string;
  crowdNotes?: string;
  day: 'Thursday' | 'Friday' | 'Saturday';
}

// Platform character limits
export const PLATFORM_LIMITS: Record<Platform, number> = {
  'Instagram': 2200,
  'X': 280,
  'TikTok': 150,
  'Facebook': 63206
};

// Helper to get schedule status
export function getScheduleStatus(schedule: AppearanceSchedule | null): ScheduleStatus {
  if (!schedule) return 'scheduled';

  const now = new Date();
  const eventDates: Record<string, string> = {
    'Thursday': '2026-02-06',
    'Friday': '2026-02-07',
    'Saturday': '2026-02-08'
  };

  const dateStr = eventDates[schedule.day];
  if (!dateStr) return 'scheduled';

  const startDateTime = new Date(`${dateStr}T${schedule.startTime}:00-06:00`); // CST
  const endDateTime = new Date(`${dateStr}T${schedule.endTime}:00-06:00`);

  if (now >= startDateTime && now <= endDateTime) return 'live';
  if (now < startDateTime) {
    const diffMs = startDateTime.getTime() - now.getTime();
    const diffMins = diffMs / (1000 * 60);
    if (diffMins <= 30) return 'upcoming';
    return 'scheduled';
  }
  return 'completed';
}

// Get time until appearance
export function getTimeUntil(schedule: AppearanceSchedule | null): string {
  if (!schedule) return '';

  const eventDates: Record<string, string> = {
    'Thursday': '2026-02-06',
    'Friday': '2026-02-07',
    'Saturday': '2026-02-08'
  };

  const dateStr = eventDates[schedule.day];
  if (!dateStr) return '';

  const startDateTime = new Date(`${dateStr}T${schedule.startTime}:00-06:00`);
  const now = new Date();

  if (now >= startDateTime) return '';

  const diffMs = startDateTime.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const remainingMins = diffMins % 60;

  if (diffHours > 24) {
    const days = Math.floor(diffHours / 24);
    return `${days}d ${diffHours % 24}h`;
  }
  if (diffHours > 0) {
    return `${diffHours}h ${remainingMins}m`;
  }
  return `${diffMins}m`;
}

// Format time for display
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

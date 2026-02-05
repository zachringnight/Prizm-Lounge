// Player Types
export type PlayerCategory = 'Current' | 'Legend' | 'Prospect';

// Station Types - Physical locations in the Prizm Lounge
export type Station =
  | 'LED Wall'         // LED Wall content capture (capacity: 1)
  | 'Signing'          // Autograph station (unlimited capacity)
  | 'PR Interview'     // PR/Media interview area (capacity: 1)
  | 'Pack Rips'        // Pack rip content station (capacity: 1)
  | 'Kid Reporter'     // Kid reporter interview station (capacity: 1)
  | 'Custom Gifting'   // Custom gifting station (capacity: 1)
  | 'Free';            // Buffer/break time (no station)

export const STATIONS: Station[] = [
  'LED Wall',
  'Signing',
  'PR Interview',
  'Pack Rips',
  'Kid Reporter',
  'Custom Gifting',
  'Free'
];

// Commitment Types - What the player is doing
export type CommitmentType =
  | 'LED Wall'             // LED Wall content capture
  | 'Signing'              // Autograph session
  | 'PR Hold'              // PR interview placeholder (may convert to Free)
  | 'Pack Rips'            // Pack rip content
  | 'Kid Reporter'         // Kid reporter interview
  | 'Custom Gifting'       // Custom gifting
  | 'Free';                // Buffer/break time

export const COMMITMENT_TYPES: CommitmentType[] = [
  'LED Wall',
  'Signing',
  'PR Hold',
  'Pack Rips',
  'Kid Reporter',
  'Custom Gifting',
  'Free'
];

export type ContentMode =
  | 'Player Spotlight'
  | 'Pack Reveal / Hit'
  | 'Signing Session'
  | 'Legend Tribute'
  | 'Current Star Hype'
  | 'Event Promo'
  | 'Behind the Scenes'
  | 'Day Recap'
  | 'Media Moment'      // New: for media interviews
  | 'Product Drop'      // New: for product signing announcements
  | 'Card Break Hype';  // New: for card break content

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

// PANINI PRODUCTS ONLY - No competitors
export type Product =
  // Flagship/Premium
  | 'Prizm'
  | 'Select'
  | 'Optic'
  | 'Mosaic'
  // Ultra Premium
  | 'National Treasures'
  | 'Flawless'
  | 'Immaculate'
  | 'One'
  | 'Noir'
  | 'Eminence'
  // Premium
  | 'Spectra'
  | 'Obsidian'
  | 'Gold Standard'
  | 'Limited'
  | 'Encased'
  | 'Origins'
  // Mid-Tier
  | 'Donruss'
  | 'Contenders'
  | 'Plates & Patches'
  | 'Certified'
  | 'Absolute'
  | 'Playbook'
  | 'Phoenix'
  // College/Draft
  | 'Prizm Draft Picks'
  | 'Contenders Draft Picks'
  | 'Chronicles Draft'
  // Multi-Brand
  | 'Chronicles';

export type ScheduleStatus = 'live' | 'upcoming' | 'completed' | 'scheduled';

// Individual commitment block within a schedule
export interface Commitment {
  id: string;
  type: CommitmentType;
  station: Station;
  startTime: string; // "14:00"
  endTime: string;   // "14:30"
  notes?: string;    // "200 autos" or "ESPN interview"
}

// Station checklist item - what a player needs to complete
export interface StationChecklistItem {
  id: string;
  station: Station;
  type: CommitmentType;
  durationMinutes: number;     // How long they should be at this station
  isPresetTime: boolean;       // If true, has a fixed time (PR interviews)
  presetStartTime?: string;    // "14:00" - only for preset items
  presetEndTime?: string;      // "14:15" - only for preset items
  notes?: string;              // "ESPN interview" etc.
}

// Runtime state for tracking checklist progress
export interface StationChecklistProgress {
  playerId: string;
  stationId: string;           // matches StationChecklistItem.id
  startedAt?: number;          // timestamp when started
  completedAt?: number;        // timestamp when completed
}

export interface AppearanceSchedule {
  day: 'Thursday' | 'Friday' | 'Saturday';
  date: string; // "Feb 6", "Feb 7", "Feb 8"
  startTime: string; // "14:00" - overall start
  endTime: string; // "15:00" - overall end
  commitments?: Commitment[]; // Detailed breakdown (legacy)
  stationChecklist?: StationChecklistItem[]; // New checklist-based system
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
  paniniContentBeats?: string[]; // Content/interview talking points
  schedule: AppearanceSchedule | null;
  imageUrl?: string;
  questions?: PlayerQuestions; // Station-specific interview questions
}

// Station status tracking
export interface StationStatus {
  station: Station;
  currentPlayer: string | null; // player ID
  currentCommitment: CommitmentType | null;
  status: 'active' | 'idle' | 'setup';
  notes: string;
  nextPlayer?: string; // player ID
  nextTime?: string;
}

// Player arrival tracking
export interface PlayerArrival {
  playerId: string;
  arrivedAt: number; // timestamp
  departedAt?: number; // timestamp when they left
  actualDuration?: number; // in minutes
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

// Event checklist items
export type ChecklistCategory = 'setup' | 'player' | 'content' | 'teardown';

export interface ChecklistItem {
  id: string;
  category: ChecklistCategory;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: number;
  assignee?: string;
  dueDay?: 'Thursday' | 'Friday' | 'Saturday';
}

// Deliverables tracking
export type DeliverableStatus = 'pending' | 'in-progress' | 'completed' | 'delivered';
export type DeliverableType = 'photo' | 'video' | 'social' | 'document' | 'other';

export interface Deliverable {
  id: string;
  title: string;
  description?: string;
  type: DeliverableType;
  status: DeliverableStatus;
  playerId?: string;
  dueDay?: 'Thursday' | 'Friday' | 'Saturday';
  completedAt?: number;
  notes?: string;
}

// Interview questions for players
export type QuestionCategory = 'career' | 'cards' | 'personal' | 'event';

export interface InterviewQuestion {
  id: string;
  question: string;
  category: QuestionCategory;
  forCategories?: PlayerCategory[]; // Which player categories this applies to
}

// Player-specific questions bank for stations
export interface PlayerQuestions {
  signing: string[];
  packRips: string[];
}

// Platform character limits
export const PLATFORM_LIMITS: Record<Platform, number> = {
  'Instagram': 2200,
  'X': 280,
  'TikTok': 150,
  'Facebook': 63206
};

// Default station durations in minutes
export const STATION_DURATIONS: Record<string, number> = {
  'LED Wall': 15,
  'Signing': 70,
  'Pack Rips': 10,
  'Kid Reporter': 5,
  'Custom Gifting': 5,
  'PR Interview': 15,
  'Free': 10,
};

// Station icons
export const STATION_ICONS: Record<Station, string> = {
  'LED Wall': '📺',
  'Signing': '✍️',
  'PR Interview': '🎤',
  'Pack Rips': '📦',
  'Kid Reporter': '🎙️',
  'Custom Gifting': '🎁',
  'Free': '☕',
};

// Helper to get schedule status
export function getScheduleStatus(schedule: AppearanceSchedule | null): ScheduleStatus {
  if (!schedule) return 'scheduled';

  const now = new Date();
  const eventDates: Record<string, string> = {
    'Thursday': '2026-02-05',
    'Friday': '2026-02-06',
    'Saturday': '2026-02-07'
  };

  const dateStr = eventDates[schedule.day];
  if (!dateStr) return 'scheduled';

  const startDateTime = new Date(`${dateStr}T${schedule.startTime}:00-08:00`); // PST
  const endDateTime = new Date(`${dateStr}T${schedule.endTime}:00-08:00`);

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
    'Thursday': '2026-02-05',
    'Friday': '2026-02-06',
    'Saturday': '2026-02-07'
  };

  const dateStr = eventDates[schedule.day];
  if (!dateStr) return '';

  const startDateTime = new Date(`${dateStr}T${schedule.startTime}:00-08:00`);
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

// Clip marker for videographers to mark great moments
export interface ClipMarker {
  id: string;
  station: Station;
  playerId: string | null;  // The athlete at the station when marker was pressed
  playerName: string | null; // Denormalized for quick display
  timestamp: number;         // When the marker was pressed (Date.now())
  note?: string;             // Optional note about the clip
  markedBy?: string;         // Optional: who marked it (videographer name)
}

// Format timestamp for display
export function formatClipTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${period}`;
}

// ============================================
// Issue/Note Logger Types
// ============================================

export type IssueCategory = 'general' | 'technical' | 'scheduling' | 'vip' | 'media' | 'urgent';
export type IssuePriority = 'low' | 'medium' | 'high';
export type IssueStatus = 'open' | 'in-progress' | 'resolved';

export const ISSUE_CATEGORIES: IssueCategory[] = [
  'general',
  'technical',
  'scheduling',
  'vip',
  'media',
  'urgent'
];

export const ISSUE_CATEGORY_CONFIG: Record<IssueCategory, { label: string; icon: string; color: string }> = {
  general: { label: 'General', icon: '📝', color: '#9CA3AF' },
  technical: { label: 'Technical', icon: '🔧', color: '#3B82F6' },
  scheduling: { label: 'Scheduling', icon: '📅', color: '#F59E0B' },
  vip: { label: 'VIP', icon: '⭐', color: '#FFD100' },
  media: { label: 'Media', icon: '📢', color: '#8B5CF6' },
  urgent: { label: 'Urgent', icon: '⚡', color: '#EF4444' }
};

export const ISSUE_PRIORITY_CONFIG: Record<IssuePriority, { label: string; color: string }> = {
  low: { label: 'Low', color: '#6B7280' },
  medium: { label: 'Medium', color: '#F59E0B' },
  high: { label: 'High', color: '#EF4444' }
};

export const ISSUE_STATUS_CONFIG: Record<IssueStatus, { label: string; color: string }> = {
  open: { label: 'Open', color: '#3B82F6' },
  'in-progress': { label: 'In Progress', color: '#F59E0B' },
  resolved: { label: 'Resolved', color: '#22C55E' }
};

export interface IssueNote {
  id: string;
  content: string;
  category: IssueCategory;
  priority: IssuePriority;
  status: IssueStatus;
  stationId?: Station;
  playerId?: string;
  createdAt: number;
  updatedAt: number;
  resolvedAt?: number;
  createdBy?: string;
}

// ============================================
// Event Configuration
// ============================================

export type DayDate = '2026-02-05' | '2026-02-06' | '2026-02-07';

export const EVENT_CONFIG = {
  name: 'Prizm Lounge Super Bowl LX',
  partner: 'Panini America',
  dates: ['2026-02-05', '2026-02-06', '2026-02-07'] as DayDate[],
  timezone: 'America/Los_Angeles',
  startTime: '10:00',
  endTime: '18:00',
  lunchStart: '12:00',
  lunchEnd: '13:00',
};

export const EVENT_DATES = EVENT_CONFIG.dates;
export const EVENT_TIMEZONE = EVENT_CONFIG.timezone;

/**
 * Participants Template
 * Copy this file to src/data/players.ts and customize for your event
 *
 * Each participant needs:
 * - Unique ID (slug format: 'first-last')
 * - Name and basic info
 * - Key stats and talking points
 * - Schedule (if appearing)
 */

import type { Player, AppearanceSchedule, PlayerQuestions } from '@/types';

// Example participant structure
const examplePlayer: Player = {
  id: 'player-slug',
  name: 'Player Name',
  category: 'Current', // 'Current' | 'Legend' | 'Prospect'
  team: 'Team Name',
  position: 'Position',
  keyStats: [
    'Key statistic or achievement',
    'Another notable stat',
    'Career highlight',
  ],
  definingMoments: [
    'Career-defining moment',
    'Memorable game or play',
  ],
  cardHistory: [
    'Previous card appearances',
    'Notable card releases',
  ],
  personalDetails: [
    'Personal interest or hobby',
    'Fun fact',
  ],
  paniniContentBeats: [
    'Specific talking point for Panini content',
    'Brand-relevant story',
  ],
  schedule: {
    day: 'Thursday',
    date: 'Feb 6',
    startTime: '10:00',
    endTime: '11:00',
    commitments: [
      {
        id: 'commitment-1',
        type: 'LED Wall',
        station: 'LED Wall',
        startTime: '10:00',
        endTime: '10:15',
        notes: '',
      },
      {
        id: 'commitment-2',
        type: 'Signing',
        station: 'Signing',
        startTime: '10:15',
        endTime: '10:45',
        notes: '200 autos',
      },
      {
        id: 'commitment-3',
        type: 'Pack Rips',
        station: 'Pack Rips',
        startTime: '10:45',
        endTime: '11:00',
        notes: '',
      },
    ],
  },
  questions: {
    signing: [
      'Custom question for signing station',
      'Another signing-specific question',
    ],
    packRips: [
      'Custom question for pack rips',
      'Another pack rips-specific question',
    ],
  },
};

// Your participants list
export const players: Player[] = [
  // Add participants here following the structure above
  // examplePlayer,
];

// ============================================
// Helper Functions
// ============================================

// Create a map for quick lookups
const playerMap = new Map(players.map((p) => [p.id, p]));

/**
 * Get a player by their ID
 */
export function getPlayerById(id: string): Player | undefined {
  return playerMap.get(id);
}

/**
 * Search players by name, team, or position
 */
export function searchPlayers(query: string): Player[] {
  const q = query.toLowerCase();
  return players.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.team.toLowerCase().includes(q) ||
      p.position.toLowerCase().includes(q)
  );
}

/**
 * Get players by category
 */
export function getPlayersByCategory(category: Player['category']): Player[] {
  return players.filter((p) => p.category === category);
}

/**
 * Get players scheduled for a specific day
 */
export function getPlayersByDay(day: 'Thursday' | 'Friday' | 'Saturday'): Player[] {
  return players.filter((p) => p.schedule?.day === day);
}

/**
 * Get all scheduled players sorted by time
 */
export function getScheduledPlayers(): Player[] {
  return players
    .filter((p) => p.schedule)
    .sort((a, b) => {
      if (!a.schedule || !b.schedule) return 0;
      const dayOrder = { Thursday: 0, Friday: 1, Saturday: 2 };
      const dayDiff = dayOrder[a.schedule.day] - dayOrder[b.schedule.day];
      if (dayDiff !== 0) return dayDiff;
      return a.schedule.startTime.localeCompare(b.schedule.startTime);
    });
}

import { Player } from '@/types';
import { players } from '@/data/players';

// Parse time string like "11:00" or "14:30" to hours and minutes
export function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return { hours, minutes };
}

// Convert time string to total minutes from midnight
export function timeToMinutes(timeStr: string): number {
  const { hours, minutes } = parseTime(timeStr);
  return hours * 60 + minutes;
}

// Get current time in PT (Pacific Time)
export function getCurrentTimePT(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
}

// Get current minutes from midnight in PT
export function getCurrentMinutesPT(): number {
  const now = getCurrentTimePT();
  return now.getHours() * 60 + now.getMinutes();
}

// Event dates
export const EVENT_DATES = {
  day1: new Date('2026-02-06'), // Thursday
  day2: new Date('2026-02-07'), // Friday
  day3: new Date('2026-02-08'), // Saturday
};

// Get event day (1, 2, 3, or 0 if outside event)
export function getEventDay(): 0 | 1 | 2 | 3 {
  const now = getCurrentTimePT();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (today.getTime() === EVENT_DATES.day1.getTime()) return 1;
  if (today.getTime() === EVENT_DATES.day2.getTime()) return 2;
  if (today.getTime() === EVENT_DATES.day3.getTime()) return 3;
  return 0;
}

// Get day string from schedule day
export function getDayNumber(day: string): 1 | 2 | 3 {
  switch (day) {
    case 'Thursday': return 1;
    case 'Friday': return 2;
    case 'Saturday': return 3;
    default: return 1;
  }
}

// Get players for a specific day
export function getPlayersForDay(day: 'Thursday' | 'Friday' | 'Saturday'): Player[] {
  return players.filter(p => p.schedule?.day === day);
}

// Get all players with schedules, sorted by day and time
export function getScheduledPlayers(): Player[] {
  return players
    .filter(p => p.schedule !== null)
    .sort((a, b) => {
      if (!a.schedule || !b.schedule) return 0;

      // Sort by day first
      const dayOrder = { Thursday: 1, Friday: 2, Saturday: 3 };
      const dayDiff = dayOrder[a.schedule.day] - dayOrder[b.schedule.day];
      if (dayDiff !== 0) return dayDiff;

      // Then by start time
      return timeToMinutes(a.schedule.startTime) - timeToMinutes(b.schedule.startTime);
    });
}

// Check if a player is currently at station
export function isPlayerCurrent(player: Player): boolean {
  if (!player.schedule) return false;

  const eventDay = getEventDay();
  const playerDay = getDayNumber(player.schedule.day);

  if (eventDay !== playerDay) return false;

  const currentMinutes = getCurrentMinutesPT();
  const startMinutes = timeToMinutes(player.schedule.startTime);
  const endMinutes = timeToMinutes(player.schedule.endTime);

  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

// Get the current player (or null if none)
export function getCurrentPlayer(): Player | null {
  const scheduledPlayers = getScheduledPlayers();
  return scheduledPlayers.find(isPlayerCurrent) || null;
}

// Get the next player (or null if none)
export function getNextPlayer(): Player | null {
  const eventDay = getEventDay();
  if (eventDay === 0) {
    // Before event, return first player
    const scheduledPlayers = getScheduledPlayers();
    return scheduledPlayers[0] || null;
  }

  const currentMinutes = getCurrentMinutesPT();
  const dayName = eventDay === 1 ? 'Thursday' : eventDay === 2 ? 'Friday' : 'Saturday';

  // Get today's players sorted by time
  const todaysPlayers = getPlayersForDay(dayName).sort((a, b) => {
    if (!a.schedule || !b.schedule) return 0;
    return timeToMinutes(a.schedule.startTime) - timeToMinutes(b.schedule.startTime);
  });

  // Find next player
  for (const player of todaysPlayers) {
    if (!player.schedule) continue;
    const startMinutes = timeToMinutes(player.schedule.startTime);
    if (startMinutes > currentMinutes) {
      return player;
    }
  }

  return null;
}

// Get time remaining until slot ends (in seconds)
export function getTimeRemaining(player: Player): number {
  if (!player.schedule) return 0;

  const currentMinutes = getCurrentMinutesPT();
  const endMinutes = timeToMinutes(player.schedule.endTime);

  const remainingMinutes = endMinutes - currentMinutes;
  return Math.max(0, remainingMinutes * 60);
}

// Format seconds to MM:SS or HH:MM:SS
export function formatCountdown(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Format time for display (e.g., "11:00 AM")
export function formatTimeDisplay(timeStr: string): string {
  const { hours, minutes } = parseTime(timeStr);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Get completion stats for the day
export function getDayStats(day: 'Thursday' | 'Friday' | 'Saturday'): {
  completed: number;
  remaining: number;
  total: number;
} {
  const dayPlayers = getPlayersForDay(day);
  const currentMinutes = getCurrentMinutesPT();
  const eventDay = getEventDay();
  const targetDay = getDayNumber(day);

  let completed = 0;
  let remaining = 0;

  for (const player of dayPlayers) {
    if (!player.schedule) continue;

    if (eventDay > targetDay) {
      // Day already passed
      completed++;
    } else if (eventDay < targetDay) {
      // Day hasn't started
      remaining++;
    } else {
      // Current day
      const endMinutes = timeToMinutes(player.schedule.endTime);
      if (currentMinutes >= endMinutes) {
        completed++;
      } else {
        remaining++;
      }
    }
  }

  return {
    completed,
    remaining,
    total: dayPlayers.length,
  };
}

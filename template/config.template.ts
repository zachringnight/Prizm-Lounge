/**
 * Event Configuration Template
 * Copy this file to src/app/config.ts and customize for your event
 */

export const EVENT_CONFIG = {
  // Event Details
  name: 'YOUR EVENT NAME',
  partner: 'Partner Name',
  location: 'Event Location',
  venue: 'Venue Name',

  // Event Dates (format: YYYY-MM-DD)
  dates: ['2026-02-06', '2026-02-07', '2026-02-08'] as const,

  // Timezone for the event
  timezone: 'America/Los_Angeles',

  // Daily Schedule
  startTime: '10:00',
  endTime: '18:00',
  lunchStart: '12:00',
  lunchEnd: '13:00',

  // Station Configuration
  stations: [
    {
      id: 'LED Wall',
      name: 'LED Wall',
      icon: '📺',
      color: '#3B82F6',
      capacity: 1,
      questions: [
        'What does it mean to have your image displayed on this scale?',
        'How does seeing yourself on cards impact your career?',
        'What message do you have for young fans watching?',
      ],
    },
    {
      id: 'Signing',
      name: 'Signing Station',
      icon: '✍️',
      color: '#22C55E',
      capacity: -1, // unlimited
      questions: [
        'Do you remember your first autograph session?',
        'What do you think about when signing for fans?',
        'Any favorite memories from signing sessions?',
      ],
    },
    {
      id: 'PR Interview',
      name: 'PR Interview',
      icon: '🎤',
      color: '#8B5CF6',
      capacity: 1,
      questions: [
        'How has the card hobby impacted your connection with fans?',
        'What advice do you have for young collectors?',
        'Tell us about your most memorable card moment.',
      ],
    },
    {
      id: 'Pack Rips',
      name: 'Pack Rips',
      icon: '📦',
      color: '#F59E0B',
      capacity: 1,
      questions: [
        'Have you ever pulled your own card?',
        'What would be your dream pull?',
        'What do you look for when opening packs?',
      ],
    },
    {
      id: 'Free',
      name: 'Free / Break',
      icon: '☕',
      color: '#6B7280',
      capacity: -1,
      questions: [],
    },
  ],

  // Branding
  branding: {
    primaryColor: '#E31937',
    secondaryColor: '#FFD100',
    logo: '/logo.svg',
  },
};

// Type exports
export type DayDate = typeof EVENT_CONFIG.dates[number];
export const EVENT_DATES = EVENT_CONFIG.dates;
export const EVENT_TIMEZONE = EVENT_CONFIG.timezone;

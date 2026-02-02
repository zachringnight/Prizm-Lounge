import { ChecklistItem, InterviewQuestion } from '@/types';

// Default checklist items for the event
export const defaultChecklist: Omit<ChecklistItem, 'id' | 'completed' | 'completedAt'>[] = [
  // Setup - Thursday
  { category: 'setup', title: 'Venue walkthrough complete', dueDay: 'Thursday' },
  { category: 'setup', title: 'Signing tables positioned', dueDay: 'Thursday' },
  { category: 'setup', title: 'Card break station ready', dueDay: 'Thursday' },
  { category: 'setup', title: 'Media stage lighting checked', dueDay: 'Thursday' },
  { category: 'setup', title: 'Product display stocked', dueDay: 'Thursday' },
  { category: 'setup', title: 'WiFi/connectivity tested', dueDay: 'Thursday' },

  // Player arrival tasks
  { category: 'player', title: 'Green room prepared', description: 'Water, snacks, comfortable seating' },
  { category: 'player', title: 'Player schedules printed', description: 'Individual sheets for each player' },
  { category: 'player', title: 'Transportation confirmed', description: 'All player pickups/dropoffs' },
  { category: 'player', title: 'Signing materials ready', description: 'Sharpies, card stock, top loaders' },

  // Content capture tasks
  { category: 'content', title: 'Camera equipment charged' },
  { category: 'content', title: 'Memory cards formatted' },
  { category: 'content', title: 'Backdrop/lighting set' },
  { category: 'content', title: 'Shot list reviewed' },
  { category: 'content', title: 'B-roll locations identified' },

  // Daily tasks - Thursday
  { category: 'player', title: 'Ty Law - arrival confirmed', dueDay: 'Thursday' },
  { category: 'player', title: 'Trevor Lawrence - arrival confirmed', dueDay: 'Thursday' },
  { category: 'player', title: 'Aidan Hutchinson - arrival confirmed', dueDay: 'Thursday' },
  { category: 'player', title: 'Ricky Williams - arrival confirmed', dueDay: 'Thursday' },

  // Daily tasks - Friday
  { category: 'player', title: 'Garrett Wilson - arrival confirmed', dueDay: 'Friday' },
  { category: 'player', title: 'Matt Leinart - arrival confirmed', dueDay: 'Friday' },
  { category: 'player', title: 'Julian Edelman - arrival confirmed', dueDay: 'Friday' },
  { category: 'player', title: 'Malcolm Butler - arrival confirmed', dueDay: 'Friday' },

  // Daily tasks - Saturday
  { category: 'player', title: 'Dante Moore - arrival confirmed', dueDay: 'Saturday' },
  { category: 'player', title: 'Champ Bailey - arrival confirmed', dueDay: 'Saturday' },
  { category: 'player', title: 'Eli Manning - arrival confirmed', dueDay: 'Saturday' },

  // Teardown
  { category: 'teardown', title: 'Equipment inventory complete', dueDay: 'Saturday' },
  { category: 'teardown', title: 'All content backed up', dueDay: 'Saturday' },
  { category: 'teardown', title: 'Venue cleared', dueDay: 'Saturday' },
];

// Interview questions by category
export const interviewQuestions: Omit<InterviewQuestion, 'id'>[] = [
  // Career questions
  { question: 'What moment in your career are you most proud of?', category: 'career' },
  { question: 'Who was the toughest opponent you ever faced?', category: 'career' },
  { question: 'What advice would you give to young players?', category: 'career' },
  { question: 'How did you prepare for big games?', category: 'career' },
  { question: 'What was your pre-game routine?', category: 'career' },

  // Cards/Collecting questions
  { question: 'Did you collect cards growing up?', category: 'cards' },
  { question: 'What\'s your favorite card of yourself?', category: 'cards' },
  { question: 'Do you have any cards from your heroes?', category: 'cards' },
  { question: 'What do you think about the hobby today?', category: 'cards' },
  { question: 'What\'s it like seeing your cards at shows?', category: 'cards' },

  // Personal questions
  { question: 'What are you up to these days?', category: 'personal', forCategories: ['Legend'] },
  { question: 'What do you do in the off-season?', category: 'personal', forCategories: ['Current'] },
  { question: 'What are your goals for next season?', category: 'personal', forCategories: ['Current', 'Prospect'] },
  { question: 'Who inspired you to play football?', category: 'personal' },
  { question: 'What\'s something fans don\'t know about you?', category: 'personal' },

  // Event-specific questions
  { question: 'How does it feel to be at Super Bowl LX?', category: 'event' },
  { question: 'What are you looking forward to at the Prizm Lounge?', category: 'event' },
  { question: 'Any Super Bowl predictions?', category: 'event' },
  { question: 'What\'s your favorite Super Bowl memory?', category: 'event' },
];

// Deliverables template
export const defaultDeliverables: { title: string; type: 'photo' | 'video' | 'social' | 'document'; description?: string }[] = [
  { title: 'Player arrival photos', type: 'photo', description: 'Each player entering the lounge' },
  { title: 'Signing session footage', type: 'video', description: 'B-roll of autograph sessions' },
  { title: 'Player interview clips', type: 'video', description: '2-3 min interviews per player' },
  { title: 'Card break highlights', type: 'video', description: 'Best pulls and reactions' },
  { title: 'Daily recap photos', type: 'photo', description: 'End of day summary shots' },
  { title: 'Behind-the-scenes content', type: 'photo', description: 'Candid moments' },
  { title: 'Event wrap report', type: 'document', description: 'Final summary document' },
];

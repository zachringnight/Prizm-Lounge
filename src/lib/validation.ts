import { z } from 'zod';

// ============================================
// Station Validation
// ============================================

export const StationIdSchema = z.enum([
  'LED Wall',
  'Signing',
  'PR Interview',
  'Pack Rips',
  'Free'
]);

export const CommitmentTypeSchema = z.enum([
  'LED Wall',
  'Signing',
  'PR Hold',
  'Pack Rips',
  'Free'
]);

// ============================================
// Time & Date Validation
// ============================================

// Time string validation (HH:MM format)
export const TimeStringSchema = z.string().regex(
  /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  'Time must be in HH:MM format'
);

// Date string validation (YYYY-MM-DD format)
export const DateStringSchema = z.string().regex(
  /^\d{4}-\d{2}-\d{2}$/,
  'Date must be in YYYY-MM-DD format'
);

// Event day validation
export const EventDaySchema = z.enum(['Thursday', 'Friday', 'Saturday']);

// Event date validation
export const EventDateSchema = z.enum(['2026-02-05', '2026-02-06', '2026-02-07']);

// ============================================
// Player Validation
// ============================================

export const PlayerCategorySchema = z.enum(['Current', 'Legend', 'Prospect']);

export const CommitmentSchema = z.object({
  id: z.string().min(1, 'Commitment ID is required'),
  type: CommitmentTypeSchema,
  station: StationIdSchema,
  startTime: TimeStringSchema,
  endTime: TimeStringSchema,
  notes: z.string().optional(),
}).refine(
  (data) => {
    if (data.startTime === '00:00' && data.endTime === '00:00') return true;
    return data.endTime > data.startTime;
  },
  { message: 'End time must be after start time', path: ['endTime'] }
);

export const AppearanceScheduleSchema = z.object({
  day: EventDaySchema,
  date: z.string().min(1, 'Date is required'),
  startTime: TimeStringSchema,
  endTime: TimeStringSchema,
  commitments: z.array(CommitmentSchema).optional(),
});

export const PlayerQuestionsSchema = z.object({
  signing: z.array(z.string()),
  packRips: z.array(z.string()),
});

export const PlayerSchema = z.object({
  id: z.string().min(1, 'Player ID is required'),
  name: z.string().min(1, 'Player name is required'),
  category: PlayerCategorySchema,
  team: z.string().min(1, 'Team is required'),
  position: z.string().min(1, 'Position is required'),
  keyStats: z.array(z.string()),
  definingMoments: z.array(z.string()),
  cardHistory: z.array(z.string()),
  personalDetails: z.array(z.string()),
  paniniContentBeats: z.array(z.string()).optional(),
  schedule: AppearanceScheduleSchema.nullable(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  questions: PlayerQuestionsSchema.optional(),
});

// ============================================
// Clip Marker Validation
// ============================================

export const ClipMarkerSchema = z.object({
  id: z.string().uuid('Invalid clip marker ID'),
  station: StationIdSchema,
  playerId: z.string().nullable(),
  playerName: z.string().nullable(),
  timestamp: z.number().positive('Timestamp must be positive'),
  note: z.string().optional(),
  markedBy: z.string().optional(),
});

// ============================================
// Issue Note Validation
// ============================================

export const IssueCategorySchema = z.enum([
  'general',
  'technical',
  'scheduling',
  'vip',
  'media',
  'urgent'
]);

export const IssuePrioritySchema = z.enum(['low', 'medium', 'high']);

export const IssueStatusSchema = z.enum(['open', 'in-progress', 'resolved']);

export const IssueNoteSchema = z.object({
  id: z.string().uuid('Invalid issue note ID'),
  content: z.string().min(1, 'Content is required').max(2000, 'Content too long'),
  category: IssueCategorySchema,
  priority: IssuePrioritySchema,
  status: IssueStatusSchema,
  stationId: StationIdSchema.optional(),
  playerId: z.string().optional(),
  createdAt: z.number().positive(),
  updatedAt: z.number().positive(),
  resolvedAt: z.number().positive().optional(),
  createdBy: z.string().optional(),
});

// Input schema for creating new issue notes
export const CreateIssueNoteSchema = z.object({
  content: z.string().min(1, 'Content is required').max(2000, 'Content too long'),
  category: IssueCategorySchema,
  priority: IssuePrioritySchema,
  stationId: StationIdSchema.optional(),
  playerId: z.string().optional(),
});

// ============================================
// Content Generation Validation
// ============================================

export const ContentModeSchema = z.enum([
  'Player Spotlight',
  'Pack Reveal / Hit',
  'Signing Session',
  'Legend Tribute',
  'Current Star Hype',
  'Event Promo',
  'Behind the Scenes',
  'Day Recap',
  'Media Moment',
  'Product Drop',
  'Card Break Hype'
]);

export const PlatformSchema = z.enum(['Instagram', 'X', 'TikTok', 'Facebook']);

export const CardTypeSchema = z.enum([
  'Base',
  'Prizm Silver',
  'Prizm Gold (/10)',
  'Prizm Black (/1)',
  'Select',
  'Auto',
  'Patch Auto',
  'Numbered Parallel',
  '1/1',
  'Super Bowl Commemorative',
  'Legacy Insert'
]);

export const ProductSchema = z.enum([
  'Prizm',
  'Select',
  'Optic',
  'Mosaic',
  'National Treasures',
  'Flawless',
  'Immaculate',
  'One',
  'Noir',
  'Eminence',
  'Spectra',
  'Obsidian',
  'Gold Standard',
  'Limited',
  'Encased',
  'Origins',
  'Donruss',
  'Contenders',
  'Plates & Patches',
  'Certified',
  'Absolute',
  'Playbook',
  'Phoenix',
  'Prizm Draft Picks',
  'Contenders Draft Picks',
  'Chronicles Draft',
  'Chronicles'
]);

export const ContentGenerationInputSchema = z.object({
  playerId: z.string().min(1, 'Player is required'),
  mode: ContentModeSchema,
  platform: PlatformSchema,
  cardType: CardTypeSchema.optional(),
  product: ProductSchema.optional(),
  serialNumber: z.string().optional(),
  context: z.string().max(500, 'Context too long').optional(),
});

// ============================================
// Station Status Validation
// ============================================

export const StationStatusSchema = z.object({
  station: StationIdSchema,
  currentPlayer: z.string().nullable(),
  currentCommitment: CommitmentTypeSchema.nullable(),
  status: z.enum(['active', 'idle', 'setup']),
  notes: z.string(),
  nextPlayer: z.string().optional(),
  nextTime: TimeStringSchema.optional(),
});

// ============================================
// Helper Functions
// ============================================

/**
 * Validate data against a schema
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: string[];
} {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: formatValidationErrors(result.error)
  };
}

/**
 * Format Zod validation errors into readable strings
 */
export function formatValidationErrors(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.join('.');
    return path ? `${path}: ${issue.message}` : issue.message;
  });
}

/**
 * Validate and throw if invalid
 */
export function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

// ============================================
// Type Exports (inferred from schemas)
// ============================================

export type ValidatedPlayer = z.infer<typeof PlayerSchema>;
export type ValidatedClipMarker = z.infer<typeof ClipMarkerSchema>;
export type ValidatedIssueNote = z.infer<typeof IssueNoteSchema>;
export type ValidatedStationStatus = z.infer<typeof StationStatusSchema>;
export type ValidatedContentInput = z.infer<typeof ContentGenerationInputSchema>;

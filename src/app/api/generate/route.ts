import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import {
  ContentMode,
  Platform,
  CardType,
  Product,
  PLATFORM_LIMITS,
  Player,
  PlayerNote
} from '@/types';

// API timeout in milliseconds
const API_TIMEOUT = 30000;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

// Brand guardrails - auto-correct common misspellings
const SPELLING_CORRECTIONS: Record<string, string> = {
  'Prism': 'Prizm',
  'prism': 'Prizm',
  'PRISM': 'PRIZM',
  'Aiden': 'Aidan',
  'aiden': 'Aidan',
  'Edleman': 'Edelman',
  'edleman': 'Edelman',
  'Mannings': 'Manning',
  'Mannning': 'Manning'
};

// Banned phrases - competitors and negativity
const BANNED_PHRASES = [
  // Negativity
  'could have been',
  'what if',
  'unfortunately',
  'disappointing',
  'failed to',
  'struggled',
  'controversy',
  'controversial',
  'injury-prone',
  'bust',
  'overrated',
  // Competitors - NEVER mention these
  'Topps',
  'topps',
  'Upper Deck',
  'upper deck',
  'Leaf',
  'leaf',
  'Bowman',  // Bowman is Topps
  'bowman',
  'Chrome',  // Topps Chrome
  'Finest',  // Topps Finest
  'Stadium Club',
  'Heritage',
  'SPx',
  'SP Authentic',
  'Exquisite',
  'Wild Card',
  'Sage',
  'SAGE',
  'Press Pass',
  'Score',  // Old competitor
  'Pro Set',
  'Playoff',  // Old brand
  'Fleer',
  'SkyBox',
  'Collectors Edge'
];

// Escape special regex characters to prevent ReDoS
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function applyBrandGuardrails(text: string): string {
  let result = text;

  // Apply spelling corrections (with escaped regex)
  Object.entries(SPELLING_CORRECTIONS).forEach(([wrong, right]) => {
    result = result.replace(new RegExp(escapeRegExp(wrong), 'g'), right);
  });

  // Check for banned phrases (these would need manual review)
  BANNED_PHRASES.forEach(phrase => {
    if (result.toLowerCase().includes(phrase.toLowerCase())) {
      console.warn(`Warning: Generated content contains banned phrase: "${phrase}"`);
    }
  });

  return result;
}

// Validate request body
function validateRequest(body: unknown): body is GenerateRequest {
  if (!body || typeof body !== 'object') return false;
  const req = body as Record<string, unknown>;

  // Required fields
  if (!req.player || typeof req.player !== 'object') return false;
  if (!req.mode || typeof req.mode !== 'string') return false;
  if (!req.platform || typeof req.platform !== 'string') return false;

  // Validate player has required fields
  const player = req.player as Record<string, unknown>;
  if (!player.name || !player.team || !player.position) return false;

  return true;
}

interface GenerateRequest {
  player: Player;
  mode: ContentMode;
  platform: Platform;
  cardType?: CardType;
  product?: Product;
  serialNumber?: string;
  context?: string;
  notes?: PlayerNote[];
}

function buildPrompt(req: GenerateRequest): string {
  const { player, mode, platform, cardType, product, serialNumber, context, notes } = req;
  const charLimit = PLATFORM_LIMITS[platform];

  // Build player context
  const playerContext = `
PLAYER: ${player.name}
TEAM: ${player.team}
POSITION: ${player.position}
CATEGORY: ${player.category}

KEY STATS:
${player.keyStats.map(s => `- ${s}`).join('\n')}

DEFINING MOMENTS:
${player.definingMoments.map(m => `- ${m}`).join('\n')}

CARD HISTORY:
${player.cardHistory.map(c => `- ${c}`).join('\n')}

PERSONAL DETAILS:
${player.personalDetails.map(d => `- ${d}`).join('\n')}
`;

  // Build card context if applicable
  let cardContext = '';
  if (mode === 'Pack Reveal / Hit' && cardType) {
    cardContext = `
CARD DETAILS:
- Card Type: ${cardType}
- Product: ${product || 'Prizm'}
${serialNumber ? `- Serial Number: ${serialNumber}` : ''}
`;
  }

  // Build notes context
  let notesContext = '';
  if (notes && notes.length > 0) {
    const quotes = notes.filter(n => n.isQuote);
    const regularNotes = notes.filter(n => !n.isQuote);

    if (quotes.length > 0) {
      notesContext += `\nDIRECT QUOTES FROM ${player.name.toUpperCase()}:\n`;
      quotes.forEach(q => {
        notesContext += `"${q.content}"\n`;
      });
    }

    if (regularNotes.length > 0) {
      notesContext += `\nON-SITE NOTES:\n`;
      regularNotes.forEach(n => {
        notesContext += `- ${n.content}\n`;
      });
    }
  }

  // Mode-specific instructions
  const modeInstructions: Record<ContentMode, string> = {
    'Player Spotlight': `Create a feature post celebrating ${player.name}. Highlight what makes them special—their game, their impact, their story. Make collectors want to chase their cards.`,

    'Pack Reveal / Hit': `Create hype copy for a ${cardType || 'card'} pull of ${player.name}${product ? ` from ${product}` : ''}${serialNumber ? ` numbered ${serialNumber}` : ''}. This is about the thrill of the rip, the hit, the chase. Make it feel like holding gold.`,

    'Signing Session': `Create promo copy for ${player.name}'s autograph session at the Prizm Lounge. Pen to card moments. The hobby experience. Capture the energy of getting something signed in person.`,

    'Legend Tribute': `Create tribute content honoring ${player.name}'s legendary career. The defining moments, the legacy, why they matter. This is about respect and celebration.`,

    'Current Star Hype': `Create "get in now" collector momentum content for ${player.name}. They're on the rise, they're building something, and smart collectors are paying attention. Future value, current excitement.`,

    'Event Promo': `Create FOMO-driving content for the Prizm Lounge activation. ${player.name} is here. The energy is real. Drive foot traffic, create urgency.`,

    'Behind the Scenes': `Create exclusive access content from behind the scenes with ${player.name} at the Prizm Lounge. The moments you don't see elsewhere. Make followers feel like insiders.`,

    'Day Recap': `Create an end-of-day wrap-up post. This isn't about one player—it's about the whole day at the Prizm Lounge.`,

    'Media Moment': `Create content promoting ${player.name}'s media appearance at the Prizm Lounge. Interview clips, behind-the-camera moments, exclusive access. Make fans feel like they're getting insider content.`,

    'Product Drop': `Create hype for ${player.name} signing Panini product. Fresh ink, sticker autos, on-card signatures going into future products. This is hobby gold being created in real time.`,

    'Card Break Hype': `Create excitement for ${player.name}'s appearance on the card break stream. Live reactions, live pulls, live energy. The intersection of the player and the hobby in real time.`
  };

  // Platform-specific instructions
  const platformInstructions: Record<Platform, string> = {
    'Instagram': `Write for Instagram. Can run longer but doesn't need to. Visual-first mindset—the image does the heavy lifting. Maximum ${charLimit} characters.`,

    'X': `Write for X (Twitter). MUST be 280 characters or less. Tight, memorable, quotable. Every word earns its spot.`,

    'TikTok': `Write for TikTok caption. Maximum 150 characters. Hook energy. Scroll-stopping. Short and punchy.`,

    'Facebook': `Write for Facebook. Can breathe more, storytelling is OK. Connect with the community. Maximum ${charLimit} characters but aim for readable length.`
  };

  const prompt = `You are a content producer for Panini America's Prizm Lounge activation at Super Bowl LX in San Francisco (Feb 6-8, 2026). You create social media content for sports card collectors and football fans.

CRITICAL - PANINI ONLY:
- Only reference PANINI products: Prizm, Select, Mosaic, Optic, Donruss, Contenders, National Treasures, Immaculate, Flawless, Spectra, Obsidian, Plates & Patches, Chronicles, Absolute, Certified, Limited, Origins, Phoenix, Playbook, Gold Standard, Encased, One, Noir, Eminence
- NEVER mention competitors (Topps, Upper Deck, Bowman, Leaf, etc.) - these do not exist in your world
- All cards discussed are Panini cards

TONE AND STYLE:
- Everything is POSITIVE. Hype players up, celebrate careers, build excitement.
- No criticism, no "what ifs," no backhanded compliments. Ever.
- Write like someone who actually watches football—reference real plays, real moments, real tendencies.
- Write like someone who actually collects—know the difference between a base card and a 1/1, understand why an auto matters.
- Casual but sharp. Confident. Not corporate. Not cringe.
- NO HASHTAGS.
- NO EMOJIS unless the user specifically requests them.

${playerContext}
${cardContext}
${notesContext}

${context ? `ADDITIONAL CONTEXT: ${context}\n` : ''}

MODE: ${mode}
${modeInstructions[mode]}

PLATFORM: ${platform}
${platformInstructions[platform]}

Generate exactly 3 variations (A, B, C) of the post. Each should have a distinct angle or approach while staying true to the tone. Label them clearly.

Format your response as:
VARIATION A:
[content]

VARIATION B:
[content]

VARIATION C:
[content]`;

  return prompt;
}

function parseVariations(response: string): { label: 'A' | 'B' | 'C'; content: string }[] {
  const variations: { label: 'A' | 'B' | 'C'; content: string }[] = [];

  const patterns = [
    { label: 'A' as const, regex: /VARIATION A:\s*([\s\S]*?)(?=VARIATION B:|$)/i },
    { label: 'B' as const, regex: /VARIATION B:\s*([\s\S]*?)(?=VARIATION C:|$)/i },
    { label: 'C' as const, regex: /VARIATION C:\s*([\s\S]*?)$/i }
  ];

  patterns.forEach(({ label, regex }) => {
    const match = response.match(regex);
    if (match && match[1]) {
      const content = applyBrandGuardrails(match[1].trim());
      variations.push({ label, content });
    }
  });

  return variations;
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    if (!validateRequest(body)) {
      return NextResponse.json(
        { error: 'Invalid request: missing required fields (player, mode, platform)' },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const prompt = buildPrompt(body);

    // Create API call with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    let message;
    try {
      message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });
    } finally {
      clearTimeout(timeoutId);
    }

    // Handle empty or unexpected response
    if (!message.content || message.content.length === 0) {
      return NextResponse.json(
        { error: 'Empty response from AI model' },
        { status: 500 }
      );
    }

    // Extract text content, handling different content types
    const textContent = message.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json(
        { error: 'Unexpected response format from AI model' },
        { status: 500 }
      );
    }

    const responseText = textContent.text;
    const variations = parseVariations(responseText);

    if (variations.length === 0) {
      return NextResponse.json(
        { error: 'Failed to parse response variations' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      variations: variations.map(v => ({
        ...v,
        characterCount: v.content.length
      }))
    });

  } catch (error) {
    console.error('Generation error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timed out. Please try again.' },
          { status: 504 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Generation failed' },
      { status: 500 }
    );
  }
}

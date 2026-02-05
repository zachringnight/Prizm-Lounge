import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { Platform, PLATFORM_LIMITS } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

const API_TIMEOUT = 30000; // 30 seconds

const VALID_PLATFORMS: Platform[] = ['Instagram', 'X', 'TikTok', 'Facebook'];
const VALID_DAYS = ['Thursday', 'Friday', 'Saturday'] as const;

interface RecapRequest {
  platform: Platform;
  day: 'Thursday' | 'Friday' | 'Saturday';
  highlights: string;
  totalAutosSigned?: string;
  bestPull?: string;
  crowdNotes?: string;
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const body: RecapRequest = await request.json();

    // Validate required fields
    if (!body.platform || !VALID_PLATFORMS.includes(body.platform)) {
      return NextResponse.json(
        { error: `Invalid platform. Must be one of: ${VALID_PLATFORMS.join(', ')}` },
        { status: 400 }
      );
    }

    if (!body.day || !VALID_DAYS.includes(body.day)) {
      return NextResponse.json(
        { error: `Invalid day. Must be one of: ${VALID_DAYS.join(', ')}` },
        { status: 400 }
      );
    }

    if (!body.highlights || !body.highlights.trim()) {
      return NextResponse.json(
        { error: 'Highlights are required for recap generation' },
        { status: 400 }
      );
    }

    const { platform, day, highlights, totalAutosSigned, bestPull, crowdNotes } = body;
    const charLimit = PLATFORM_LIMITS[platform];

    const dayNumber = day === 'Thursday' ? '1' : day === 'Friday' ? '2' : '3';
    const dateDisplay = day === 'Thursday' ? 'Feb 5' : day === 'Friday' ? 'Feb 6' : 'Feb 7';

    const prompt = `You are a copywriter for Panini America's Prizm Lounge activation at Super Bowl LX in San Francisco (Feb 5-7, 2026).

Write a Day ${dayNumber} (${dateDisplay}) recap post for ${platform}.

RECAP DETAILS:
${highlights ? `Key Highlights:\n${highlights}` : ''}
${totalAutosSigned ? `Total Autos Signed: ${totalAutosSigned}` : ''}
${bestPull ? `Best Pull of the Day: ${bestPull}` : ''}
${crowdNotes ? `Crowd/Energy Notes: ${crowdNotes}` : ''}

BRAND RULES (CRITICAL):
- ONLY reference Panini products: Prizm, Select, Optic, Mosaic, National Treasures, Flawless, Immaculate, One, Noir, Eminence
- NEVER mention competitors: Topps, Upper Deck, Leaf, Bowman, or any non-Panini brands
- Always spell "Prizm" correctly (not "Prism")
- No negative language: avoid words like "unfortunately", "disappointing", "struggled", "bust", "overrated"

TONE AND STYLE:
- Celebratory, capturing the energy of the day
- Casual but sharp
- NO HASHTAGS
- NO EMOJIS
- Make it feel like you were there
- Reference specific moments and players if mentioned in highlights
- Build anticipation for the next day (unless it's Saturday, then build toward Super Bowl Sunday)

${platform === 'X' ? 'MUST be 280 characters or less.' : ''}
${platform === 'TikTok' ? 'Maximum 150 characters. Hook energy.' : ''}
${platform === 'Instagram' ? `Maximum ${charLimit} characters but keep it punchy.` : ''}
${platform === 'Facebook' ? 'Can tell more of a story. Connect with the community.' : ''}

Generate exactly 3 variations (A, B, C). Each should capture the day differently.

Format:
VARIATION A:
[content]

VARIATION B:
[content]

VARIATION C:
[content]`;

    // Create API call with timeout using AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    let message;
    try {
      message = await anthropic.messages.create(
        {
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }]
        },
        { signal: controller.signal }
      );
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

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    const variations: { label: 'A' | 'B' | 'C'; content: string; characterCount: number }[] = [];

    const patterns = [
      { label: 'A' as const, regex: /VARIATION A:\s*([\s\S]*?)(?=VARIATION B:|$)/i },
      { label: 'B' as const, regex: /VARIATION B:\s*([\s\S]*?)(?=VARIATION C:|$)/i },
      { label: 'C' as const, regex: /VARIATION C:\s*([\s\S]*?)$/i }
    ];

    patterns.forEach(({ label, regex }) => {
      const match = responseText.match(regex);
      if (match && match[1]) {
        const content = match[1].trim();
        variations.push({ label, content, characterCount: content.length });
      }
    });

    return NextResponse.json({ variations });

  } catch (error) {
    console.error('Recap generation error:', error);

    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timed out. Please try again.' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    );
  }
}

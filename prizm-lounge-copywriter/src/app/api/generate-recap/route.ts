import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { Platform, PLATFORM_LIMITS } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

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
    const body: RecapRequest = await request.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const { platform, day, highlights, totalAutosSigned, bestPull, crowdNotes } = body;
    const charLimit = PLATFORM_LIMITS[platform];

    const dayNumber = day === 'Thursday' ? '1' : day === 'Friday' ? '2' : '3';
    const dateDisplay = day === 'Thursday' ? 'Feb 6' : day === 'Friday' ? 'Feb 7' : 'Feb 8';

    const prompt = `You are a copywriter for Panini's Prizm Lounge activation at Super Bowl LIX in New Orleans.

Write a Day ${dayNumber} (${dateDisplay}) recap post for ${platform}.

RECAP DETAILS:
${highlights ? `Key Highlights:\n${highlights}` : ''}
${totalAutosSigned ? `Total Autos Signed: ${totalAutosSigned}` : ''}
${bestPull ? `Best Pull of the Day: ${bestPull}` : ''}
${crowdNotes ? `Crowd/Energy Notes: ${crowdNotes}` : ''}

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

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    });

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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    );
  }
}

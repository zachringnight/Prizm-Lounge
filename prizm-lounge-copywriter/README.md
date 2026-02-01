# Prizm Lounge Production Hub

Full content production tool for Panini America's Prizm Lounge activation at Super Bowl LIX in New Orleans.

**Event Dates:** Thursday Feb 6 - Saturday Feb 8, 2026

## Features

### Core Functionality
- **AI-Powered Content Generation** - Generate 3 variations for any player/mode/platform combination
- **10 Confirmed Players** - Complete database with stats, moments, and Panini card history
- **8 Content Modes** - Player Spotlight, Pack Reveal, Signing Session, and more
- **4 Platforms** - Instagram, X (280 char), TikTok (150 char), Facebook
- **Panini Product Integration** - All card references are Panini products only (Prizm, Select, National Treasures, etc.)

### Brand Guardrails
- **Panini-Only References** - System enforces only Panini products in all generated content
- **Competitor Blocking** - Auto-detects and flags any non-Panini card brand mentions
- **Spelling Protection** - Auto-corrects common misspellings (Prism→Prizm, etc.)

### Player Database
- Full bio, stats, and defining moments for each player
- Card history and collector context
- Personal details and talking points
- Searchable by name, team, position, or category

### Live Schedule
- Player appearance times with countdown timers
- Visual status indicators (Green = Live, Yellow = Up Next, Gray = Completed)
- Editable via admin panel

### Content Tracking
- Track which content modes you've used per player
- Content gap alerts ("You haven't done a Legend Tribute for Champ")
- Session history with export to CSV

### Real-Time Notes
- Capture notes and quotes during player appearances
- Voice-to-text input for speed
- Notes automatically feed into generation prompts

### Day Recap Generator
- End-of-day wrap-up posts
- Input highlights, autos signed, best pull, crowd notes
- Generates platform-specific recap content

### Offline Support
- Service worker for offline functionality
- Cached pages work without WiFi
- Data persists locally

### Mobile-First Design
- Large tap targets for thumbs
- Dark mode default
- Bottom navigation
- Works on any mobile device

## Tech Stack

- **Next.js 16** - React framework with App Router
- **React 19** - Latest React features
- **Tailwind CSS v4** - Styling
- **Zustand** - State management with persistence
- **Claude API** - AI content generation
- **TypeScript** - Type safety

## Setup

### 1. Clone and Install

```bash
npm install
```

### 2. Configure API Key

Create a `.env.local` file:

```bash
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 3. Run Development Server

```bash
npm run dev
```

### 4. Build for Production

```bash
npm run build
```

## Deploy to Vercel

1. Push to GitHub
2. Connect to Vercel
3. Add `ANTHROPIC_API_KEY` environment variable
4. Deploy

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Main generation UI
│   ├── players/           # Player list and detail pages
│   ├── schedule/          # Live schedule view
│   ├── tracking/          # Content tracking grid
│   ├── admin/             # Admin panel
│   ├── recap/             # Day recap generator
│   └── api/               # API routes for Claude
├── components/            # React components
├── data/                  # Player database
├── store/                 # Zustand state management
└── types/                 # TypeScript types
```

## Player Roster

### Current NFL Stars
- Trevor Lawrence (QB, Jaguars)
- Aidan Hutchinson (DE, Lions)
- Garrett Wilson (WR, Jets)

### Prospect
- Dante Moore (QB, Oregon)

### Legends
- Julian Edelman (WR, Patriots)
- Ty Law (CB, Patriots)
- Malcolm Butler (CB, Patriots)
- Eli Manning (QB, Giants)
- Ricky Williams (RB, Dolphins)
- Champ Bailey (CB, Broncos)

## Content Modes

1. **Player Spotlight** - Feature posts celebrating any player
2. **Pack Reveal / Hit** - Hyping card pulls
3. **Signing Session** - Autograph event promo
4. **Legend Tribute** - Career highlights for legends
5. **Current Star Hype** - "Get in now" collector momentum
6. **Event Promo** - FOMO-driving foot traffic content
7. **Behind the Scenes** - Exclusive access feel
8. **Day Recap** - End-of-day summary

## Tone Guidelines

- Everything positive - no criticism, no "what ifs"
- Write like someone who watches football
- Write like someone who collects cards
- Casual but sharp, confident, not corporate
- NO hashtags
- NO emojis (unless requested)

## Admin Functions

- Edit player schedule times
- Export session history
- Backup all data to JSON
- Clear data (with confirmation)

## Offline Mode

The app works offline with limited functionality:
- Browse players and schedule
- View notes and tracking
- Content generation requires connection

---

Built for Super Bowl LIX, New Orleans 2026

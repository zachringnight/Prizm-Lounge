# ZNew Repository

This repository contains the Prizm Lounge Production Hub application.

## Project Structure

```
.
├── prizm-lounge-copywriter/    # Next.js application for Super Bowl LX content generation
│   ├── src/                    # Application source code
│   ├── public/                 # Static assets
│   ├── package.json            # Dependencies
│   └── vercel.json             # Vercel config with app-specific headers
└── README.md                   # This file
```

## Deploy to Vercel

This project is ready to deploy to Vercel. Follow these steps:

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Import Project**
   - Go to [Vercel Dashboard](https://vercel.com/new)
   - Click "Import Project" or "Add New Project"
   - Import your GitHub repository (for example: `<org>/<repo>`)

2. **Configure Project Settings**
   - **Root Directory**: `prizm-lounge-copywriter` (important!)
   - **Framework Preset**: Next.js (should auto-detect)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

3. **Add Environment Variables**
   - Add the following environment variable in the Vercel project settings:
     - `ANTHROPIC_API_KEY`: Your Anthropic Claude API key
   - Get your API key at: https://console.anthropic.com/

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your application

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to the application directory
cd prizm-lounge-copywriter

# Login to Vercel
vercel login

# Deploy (follow the prompts)
vercel

# For production deployment
vercel --prod
```

When prompted, make sure to:
- Set the root directory to `prizm-lounge-copywriter`
- Add your `ANTHROPIC_API_KEY` environment variable

### Environment Variables

The application requires the following environment variable:

- `ANTHROPIC_API_KEY`: Your Anthropic Claude API key for AI content generation

You can find a template in `prizm-lounge-copywriter/.env.example`

## Local Development

See [prizm-lounge-copywriter/README.md](./prizm-lounge-copywriter/README.md) for detailed information about the application and local development setup.

## Application Details

The Prizm Lounge Production Hub is a full content production tool for Panini America's Prizm Lounge activation at Super Bowl LX in San Francisco.

**Event Dates:** Thursday Feb 6 - Saturday Feb 8, 2026

For more information about features, setup, and usage, see the [application README](./prizm-lounge-copywriter/README.md).

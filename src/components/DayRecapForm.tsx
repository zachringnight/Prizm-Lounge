'use client';

import { useState } from 'react';
import { useAppStore } from '@/store';
import { Platform, PLATFORM_LIMITS, ContentVariation } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { CopyIcon, CheckIcon, SparklesIcon } from './Icons';
import { useToast } from './Toast';

interface GeneratedVariation extends ContentVariation {
  id: string;
}

export default function DayRecapForm() {
  const {
    dayRecapHighlights,
    dayRecapAutosSigned,
    dayRecapBestPull,
    dayRecapCrowdNotes,
    setDayRecapField,
    addGeneratedContent,
    isGenerating,
    setIsGenerating
  } = useAppStore();

  const [selectedDay, setSelectedDay] = useState<'Thursday' | 'Friday' | 'Saturday'>('Thursday');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('Instagram');
  const [variations, setVariations] = useState<GeneratedVariation[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { showToast, ToastComponent } = useToast();

  const charLimit = PLATFORM_LIMITS[selectedPlatform];
  const days: ('Thursday' | 'Friday' | 'Saturday')[] = ['Thursday', 'Friday', 'Saturday'];
  const platforms: Platform[] = ['Instagram', 'X', 'TikTok', 'Facebook'];

  const handleGenerate = async () => {
    if (!dayRecapHighlights.trim()) {
      showToast('Add some highlights first', 'error');
      return;
    }

    setIsGenerating(true);
    setVariations([]);

    try {
      const response = await fetch('/api/generate-recap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: selectedPlatform,
          day: selectedDay,
          highlights: dayRecapHighlights,
          totalAutosSigned: dayRecapAutosSigned,
          bestPull: dayRecapBestPull,
          crowdNotes: dayRecapCrowdNotes
        })
      });

      if (!response.ok) {
        throw new Error('Generation failed');
      }

      const data = await response.json();

      const newVariations: GeneratedVariation[] = data.variations.map((v: { label: string; content: string; characterCount: number }) => ({
        id: uuidv4(),
        label: v.label,
        content: v.content,
        characterCount: v.characterCount,
        used: false,
        savedAsTemplate: false
      }));

      setVariations(newVariations);

      // Save to history
      addGeneratedContent({
        playerId: 'day-recap',
        playerName: `Day Recap - ${selectedDay}`,
        mode: 'Day Recap',
        platform: selectedPlatform,
        context: dayRecapHighlights,
        variations: newVariations
      });

      showToast('Generated 3 variations', 'success');

    } catch (err) {
      console.error('Generation error:', err);
      showToast('Generation failed', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (variation: GeneratedVariation) => {
    try {
      await navigator.clipboard.writeText(variation.content);
      setCopiedId(variation.id);
      setTimeout(() => setCopiedId(null), 2000);
      if ('vibrate' in navigator) navigator.vibrate(10);
      showToast('Copied to clipboard', 'success');
    } catch {
      showToast('Failed to copy', 'error');
    }
  };

  const getCharCountClass = (count: number) => {
    if (count > charLimit) return 'over-limit';
    if (count > charLimit * 0.9) return 'near-limit';
    return '';
  };

  return (
    <div className="space-y-6">
      {/* Day Selection */}
      <div>
        <div className="section-header">
          <span className="section-title">Day</span>
        </div>
        <div className="tabs">
          {days.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`tab ${selectedDay === day ? 'active' : ''}`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Platform Selection */}
      <div>
        <div className="section-header">
          <span className="section-title">Platform</span>
        </div>
        <div className="tabs">
          {platforms.map(platform => (
            <button
              key={platform}
              onClick={() => setSelectedPlatform(platform)}
              className={`tab ${selectedPlatform === platform ? 'active' : ''}`}
            >
              {platform}
            </button>
          ))}
        </div>
      </div>

      {/* Highlights */}
      <div>
        <div className="section-header">
          <span className="section-title">Key Highlights</span>
        </div>
        <textarea
          value={dayRecapHighlights}
          onChange={(e) => setDayRecapField('highlights', e.target.value)}
          placeholder="What happened today? Key moments, player interactions, memorable quotes..."
          className="input textarea"
          rows={4}
        />
      </div>

      {/* Total Autos */}
      <div>
        <div className="section-header">
          <span className="section-title">Total Autos Signed (optional)</span>
        </div>
        <input
          type="text"
          value={dayRecapAutosSigned}
          onChange={(e) => setDayRecapField('autosSigned', e.target.value)}
          placeholder="e.g., 500+"
          className="input"
        />
      </div>

      {/* Best Pull */}
      <div>
        <div className="section-header">
          <span className="section-title">Best Pull of the Day (optional)</span>
        </div>
        <input
          type="text"
          value={dayRecapBestPull}
          onChange={(e) => setDayRecapField('bestPull', e.target.value)}
          placeholder="e.g., Trevor Lawrence 1/1 Black Prizm Auto"
          className="input"
        />
      </div>

      {/* Crowd Notes */}
      <div>
        <div className="section-header">
          <span className="section-title">Crowd/Energy Notes (optional)</span>
        </div>
        <textarea
          value={dayRecapCrowdNotes}
          onChange={(e) => setDayRecapField('crowdNotes', e.target.value)}
          placeholder="Line around the block, energy was electric, sold out..."
          className="input textarea"
          rows={2}
        />
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!dayRecapHighlights.trim() || isGenerating}
        className="btn btn-primary w-full gap-2"
      >
        {isGenerating ? (
          <>
            <div className="spinner" />
            Generating...
          </>
        ) : (
          <>
            <SparklesIcon size={20} />
            Generate Recap
          </>
        )}
      </button>

      {/* Variations Output */}
      {variations.length > 0 && (
        <div className="space-y-4 animate-fade-in">
          <div className="section-header">
            <span className="section-title">Generated Variations</span>
          </div>

          {variations.map(variation => (
            <div key={variation.id} className="variation-card">
              <div className="flex items-center justify-between mb-3">
                <div className="variation-label">{variation.label}</div>
                <span className={`char-count ${getCharCountClass(variation.characterCount)}`}>
                  {variation.characterCount}/{charLimit}
                </span>
              </div>

              <p className="text-[var(--foreground)] whitespace-pre-wrap mb-4 leading-relaxed">
                {variation.content}
              </p>

              <button
                onClick={() => handleCopy(variation)}
                className="btn btn-secondary w-full gap-2"
              >
                {copiedId === variation.id ? (
                  <>
                    <CheckIcon size={16} />
                    Copied
                  </>
                ) : (
                  <>
                    <CopyIcon size={16} />
                    Copy to Clipboard
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {ToastComponent}
    </div>
  );
}

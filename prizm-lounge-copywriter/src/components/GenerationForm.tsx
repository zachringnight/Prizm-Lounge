'use client';

import { useState, useEffect } from 'react';
import { useAppStore, useSelectedPlayer, usePlayerNotes } from '@/store';
import {
  ContentMode,
  Platform,
  CardType,
  Product,
  PLATFORM_LIMITS,
  ContentVariation
} from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { CopyIcon, CheckIcon, SaveIcon, SparklesIcon, MicIcon } from './Icons';
import PlayerSelector from './PlayerSelector';
import { useToast } from './Toast';

const CONTENT_MODES: ContentMode[] = [
  'Player Spotlight',
  'Pack Reveal / Hit',
  'Signing Session',
  'Legend Tribute',
  'Current Star Hype',
  'Event Promo',
  'Behind the Scenes',
  'Day Recap'
];

const PLATFORMS: Platform[] = ['Instagram', 'X', 'TikTok', 'Facebook'];

const CARD_TYPES: CardType[] = [
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
];

const PRODUCTS: Product[] = [
  'Prizm',
  'Select',
  'Obsidian',
  'Spectra',
  'Immaculate',
  'National Treasures',
  'Flawless',
  'Optic',
  'Mosaic',
  'Donruss',
  'Contenders',
  'Plates & Patches'
];

interface GeneratedVariation extends ContentVariation {
  id: string;
}

export default function GenerationForm() {
  const {
    selectedPlayerId,
    selectedMode,
    selectedPlatform,
    selectedCardType,
    selectedProduct,
    serialNumber,
    contextInput,
    isGenerating,
    setSelectedMode,
    setSelectedPlatform,
    setSelectedCardType,
    setSelectedProduct,
    setSerialNumber,
    setContextInput,
    setIsGenerating,
    addGeneratedContent,
    trackContent,
    saveTemplate,
    markVariationUsed,
    markVariationAsSavedTemplate,
    notes
  } = useAppStore();

  const selectedPlayer = useSelectedPlayer();
  const playerNotes = selectedPlayerId ? notes.filter(n => n.playerId === selectedPlayerId) : [];
  const [variations, setVariations] = useState<GeneratedVariation[]>([]);
  const [contentId, setContentId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPlayerSelector, setShowPlayerSelector] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const { showToast, ToastComponent } = useToast();

  const charLimit = PLATFORM_LIMITS[selectedPlatform];
  const showCardOptions = selectedMode === 'Pack Reveal / Hit';
  const showSerialInput = selectedCardType === 'Numbered Parallel' ||
    selectedCardType === 'Prizm Gold (/10)' ||
    selectedCardType === 'Prizm Black (/1)';

  // Filter modes based on player category
  const availableModes = CONTENT_MODES.filter(mode => {
    if (!selectedPlayer) return true;
    if (mode === 'Legend Tribute' && selectedPlayer.category !== 'Legend') return false;
    if (mode === 'Current Star Hype' && selectedPlayer.category !== 'Current') return false;
    return true;
  });

  // Voice input handler
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      showToast('Voice input not supported in this browser', 'error');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const newValue = contextInput ? `${contextInput} ${transcript}` : transcript;
      setContextInput(newValue);
      showToast('Voice captured', 'success');
    };

    recognition.onerror = () => {
      setIsListening(false);
      showToast('Voice input failed', 'error');
    };

    recognition.start();
  };

  const handleGenerate = async () => {
    if (!selectedPlayer) {
      showToast('Please select a player', 'error');
      return;
    }

    setIsGenerating(true);
    setVariations([]);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player: selectedPlayer,
          mode: selectedMode,
          platform: selectedPlatform,
          cardType: showCardOptions ? selectedCardType : undefined,
          product: showCardOptions ? selectedProduct : undefined,
          serialNumber: showSerialInput ? serialNumber : undefined,
          context: contextInput,
          notes: playerNotes
        })
      });

      if (!response.ok) {
        throw new Error('Generation failed');
      }

      const data = await response.json();

      const newVariations: GeneratedVariation[] = data.variations.map((v: any) => ({
        id: uuidv4(),
        label: v.label,
        content: v.content,
        characterCount: v.characterCount,
        used: false,
        savedAsTemplate: false
      }));

      setVariations(newVariations);

      // Save to history
      const id = addGeneratedContent({
        playerId: selectedPlayer.id,
        playerName: selectedPlayer.name,
        mode: selectedMode,
        platform: selectedPlatform,
        cardType: showCardOptions ? selectedCardType || undefined : undefined,
        product: showCardOptions ? selectedProduct || undefined : undefined,
        serialNumber: showSerialInput ? serialNumber : undefined,
        context: contextInput,
        variations: newVariations
      });

      setContentId(id);
      showToast('Generated 3 variations', 'success');

    } catch (error) {
      console.error('Generation error:', error);
      showToast('Generation failed. Check your connection.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (variation: GeneratedVariation) => {
    try {
      await navigator.clipboard.writeText(variation.content);
      setCopiedId(variation.id);
      setTimeout(() => setCopiedId(null), 2000);

      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }

      showToast('Copied to clipboard', 'success');
    } catch (error) {
      showToast('Failed to copy', 'error');
    }
  };

  const handleUse = (variation: GeneratedVariation) => {
    if (contentId && selectedPlayer) {
      markVariationUsed(contentId, variation.id);
      trackContent(selectedPlayer.id, selectedMode, selectedPlatform);

      // Update local state
      setVariations(prev =>
        prev.map(v => v.id === variation.id ? { ...v, used: true } : v)
      );

      showToast('Marked as used', 'success');
    }
  };

  const handleSaveTemplate = (variation: GeneratedVariation) => {
    if (contentId && selectedPlayer) {
      saveTemplate(selectedMode, selectedPlatform, variation.content, selectedPlayer.name);
      markVariationAsSavedTemplate(contentId, variation.id);

      // Update local state
      setVariations(prev =>
        prev.map(v => v.id === variation.id ? { ...v, savedAsTemplate: true } : v)
      );

      showToast('Saved as template', 'success');
    }
  };

  const getCharCountClass = (count: number) => {
    if (count > charLimit) return 'over-limit';
    if (count > charLimit * 0.9) return 'near-limit';
    return '';
  };

  return (
    <div className="space-y-6">
      {/* Player Selection */}
      <div>
        <div className="section-header">
          <span className="section-title">Player</span>
        </div>
        {selectedPlayer ? (
          <button
            onClick={() => setShowPlayerSelector(true)}
            className="player-card selected w-full text-left"
          >
            <div className="avatar">
              {selectedPlayer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-semibold">{selectedPlayer.name}</span>
              <div className="text-sm text-[var(--foreground-muted)]">
                {selectedPlayer.position} - {selectedPlayer.team}
              </div>
            </div>
            <span className={`badge badge-${selectedPlayer.category.toLowerCase()}`}>
              {selectedPlayer.category}
            </span>
          </button>
        ) : (
          <button
            onClick={() => setShowPlayerSelector(true)}
            className="btn btn-secondary w-full"
          >
            Select Player
          </button>
        )}
      </div>

      {/* Mode Selection */}
      <div>
        <div className="section-header">
          <span className="section-title">Content Mode</span>
        </div>
        <div className="quick-actions">
          {availableModes.map(mode => (
            <button
              key={mode}
              onClick={() => setSelectedMode(mode)}
              className={`quick-action ${selectedMode === mode ? 'active' : ''}`}
            >
              {mode}
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
          {PLATFORMS.map(platform => (
            <button
              key={platform}
              onClick={() => setSelectedPlatform(platform)}
              className={`tab ${selectedPlatform === platform ? 'active' : ''}`}
            >
              {platform}
              <span className="text-xs ml-1 opacity-50">
                {platform === 'X' ? '280' : platform === 'TikTok' ? '150' : ''}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Card Options (for Pack Reveal mode) */}
      {showCardOptions && (
        <>
          <div>
            <div className="section-header">
              <span className="section-title">Card Type</span>
            </div>
            <select
              value={selectedCardType || ''}
              onChange={(e) => setSelectedCardType(e.target.value as CardType || null)}
              className="input select"
            >
              <option value="">Select card type...</option>
              {CARD_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="section-header">
              <span className="section-title">Product</span>
            </div>
            <select
              value={selectedProduct || ''}
              onChange={(e) => setSelectedProduct(e.target.value as Product || null)}
              className="input select"
            >
              <option value="">Select product...</option>
              {PRODUCTS.map(product => (
                <option key={product} value={product}>{product}</option>
              ))}
            </select>
          </div>

          {showSerialInput && (
            <div>
              <div className="section-header">
                <span className="section-title">Serial Number</span>
              </div>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="e.g., 07/10"
                className="input"
              />
            </div>
          )}
        </>
      )}

      {/* Context Input */}
      <div>
        <div className="section-header">
          <span className="section-title">Additional Context</span>
          <button
            onClick={handleVoiceInput}
            className={`p-2 rounded-full transition-colors ${isListening ? 'bg-[var(--panini-red)] text-white' : 'bg-[var(--background-tertiary)]'}`}
            disabled={isListening}
          >
            <MicIcon size={18} />
          </button>
        </div>
        <textarea
          value={contextInput}
          onChange={(e) => setContextInput(e.target.value)}
          placeholder="Add any real-time context, observations, or details to include..."
          className="input textarea"
          rows={3}
        />
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!selectedPlayer || isGenerating}
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
            Generate Copy
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

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handleCopy(variation)}
                  className="btn btn-secondary flex-1 gap-2"
                >
                  {copiedId === variation.id ? (
                    <>
                      <CheckIcon size={16} />
                      Copied
                    </>
                  ) : (
                    <>
                      <CopyIcon size={16} />
                      Copy
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleUse(variation)}
                  disabled={variation.used}
                  className={`btn flex-1 gap-2 ${variation.used ? 'btn-secondary opacity-50' : 'btn-accent'}`}
                >
                  {variation.used ? 'Used' : 'Use This'}
                </button>

                <button
                  onClick={() => handleSaveTemplate(variation)}
                  disabled={variation.savedAsTemplate}
                  className="btn btn-secondary gap-2"
                >
                  <SaveIcon size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Player Selector Modal */}
      {showPlayerSelector && (
        <div className="modal-overlay" onClick={() => setShowPlayerSelector(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="text-lg font-semibold">Select Player</h2>
              <button
                onClick={() => setShowPlayerSelector(false)}
                className="p-2"
              >
                Close
              </button>
            </div>
            <div className="modal-body">
              <PlayerSelector onSelect={() => setShowPlayerSelector(false)} />
            </div>
          </div>
        </div>
      )}

      {ToastComponent}
    </div>
  );
}

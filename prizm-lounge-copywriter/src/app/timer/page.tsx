'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '@/store';

// Format seconds to display
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

const PRESETS = [
  { label: '5m', seconds: 5 * 60 },
  { label: '10m', seconds: 10 * 60 },
  { label: '15m', seconds: 15 * 60 },
  { label: '30m', seconds: 30 * 60 },
];

export default function TimerPage() {
  const { notificationSound } = useAppStore();

  const [mode, setMode] = useState<'countdown' | 'stopwatch'>('countdown');
  const [seconds, setSeconds] = useState(0);
  const [initialSeconds, setInitialSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activePreset, setActivePreset] = useState<number | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/sounds/timer-complete.mp3');
      audioRef.current.preload = 'auto';
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Play completion sound
  const playCompletionSound = useCallback(() => {
    if (soundEnabled && notificationSound && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Autoplay may be blocked
      });
    }
    // Also vibrate if available
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }
  }, [soundEnabled, notificationSound]);

  // Timer logic
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setSeconds(prev => {
        if (mode === 'countdown') {
          if (prev <= 1) {
            setIsRunning(false);
            playCompletionSound();
            return 0;
          }
          return prev - 1;
        } else {
          return prev + 1;
        }
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, mode, playCompletionSound]);

  const handlePreset = useCallback((presetSeconds: number, index: number) => {
    setSeconds(presetSeconds);
    setInitialSeconds(presetSeconds);
    setActivePreset(index);
    setMode('countdown');
    setIsRunning(false);
  }, []);

  const handleStart = useCallback(() => {
    if (mode === 'countdown' && seconds === 0 && initialSeconds === 0) {
      // No time set for countdown, set a default
      setSeconds(5 * 60);
      setInitialSeconds(5 * 60);
      setActivePreset(0);
    }
    setIsRunning(true);
  }, [mode, seconds, initialSeconds]);

  const handlePause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    if (mode === 'countdown') {
      setSeconds(initialSeconds);
    } else {
      setSeconds(0);
    }
  }, [mode, initialSeconds]);

  const handleModeChange = useCallback((newMode: 'countdown' | 'stopwatch') => {
    setIsRunning(false);
    setMode(newMode);
    setSeconds(0);
    setInitialSeconds(0);
    setActivePreset(null);
  }, []);

  // Calculate progress percentage
  const progress = mode === 'countdown' && initialSeconds > 0
    ? ((initialSeconds - seconds) / initialSeconds) * 100
    : 0;

  // Determine display state
  const isWarning = mode === 'countdown' && seconds <= 60 && seconds > 10;
  const isCritical = mode === 'countdown' && seconds <= 10 && seconds > 0;
  const isComplete = mode === 'countdown' && seconds === 0 && initialSeconds > 0;

  return (
    <div className="timer-page">
      {/* Mode Toggle */}
      <div className="timer-mode-toggle">
        <button
          className={`timer-mode-btn ${mode === 'countdown' ? 'active' : ''}`}
          onClick={() => handleModeChange('countdown')}
        >
          Countdown
        </button>
        <button
          className={`timer-mode-btn ${mode === 'stopwatch' ? 'active' : ''}`}
          onClick={() => handleModeChange('stopwatch')}
        >
          Stopwatch
        </button>
      </div>

      {/* Timer Display */}
      <div
        className={`timer-display ${isWarning ? 'warning' : ''} ${isCritical ? 'critical' : ''}`}
      >
        {formatTime(seconds)}
      </div>

      {/* Progress Bar (countdown only) */}
      {mode === 'countdown' && initialSeconds > 0 && (
        <div className="timer-progress">
          <div
            className={`timer-progress-bar ${isWarning ? 'warning' : ''} ${isCritical ? 'critical' : ''}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Presets (countdown only) */}
      {mode === 'countdown' && (
        <div className="timer-presets">
          {PRESETS.map((preset, index) => (
            <button
              key={preset.label}
              className={`timer-preset-btn ${activePreset === index ? 'active' : ''}`}
              onClick={() => handlePreset(preset.seconds, index)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="timer-controls">
        {isRunning ? (
          <button
            className="timer-control-btn pause"
            onClick={handlePause}
            aria-label="Pause"
          >
            ||
          </button>
        ) : (
          <button
            className="timer-control-btn start"
            onClick={handleStart}
            aria-label="Start"
          >
            {isComplete ? '🔄' : '▶'}
          </button>
        )}
        <button
          className="timer-control-btn reset"
          onClick={handleReset}
          aria-label="Reset"
        >
          ↺
        </button>
      </div>

      {/* Options */}
      <div className="timer-options">
        <label className="timer-option">
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={(e) => setSoundEnabled(e.target.checked)}
          />
          Sound Alert
        </label>
      </div>

      {/* Complete message */}
      {isComplete && (
        <div style={{
          marginTop: '24px',
          padding: '16px 24px',
          background: 'var(--success)',
          borderRadius: '12px',
          color: 'white',
          fontWeight: 600,
          animation: 'pulse-live 2s ease-in-out infinite'
        }}>
          Time&apos;s Up!
        </div>
      )}
    </div>
  );
}

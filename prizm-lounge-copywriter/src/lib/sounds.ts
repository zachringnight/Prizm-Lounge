/**
 * Sound management for the Prizm Lounge Production Hub
 * Handles audio playback for notifications, timers, and feedback
 */

export type SoundType = 'notification' | 'timerComplete' | 'warning' | 'tick' | 'success' | 'error';

// Sound file paths
export const SOUNDS: Record<SoundType, string> = {
  notification: '/sounds/notification.mp3',
  timerComplete: '/sounds/timer-complete.mp3',
  warning: '/sounds/warning.mp3',
  tick: '/sounds/tick.mp3',
  success: '/sounds/success.mp3',
  error: '/sounds/error.mp3',
} as const;

// Audio element cache for instant playback
const audioCache = new Map<string, HTMLAudioElement>();

// Default volume levels for different sound types
const DEFAULT_VOLUMES: Record<SoundType, number> = {
  notification: 0.5,
  timerComplete: 0.7,
  warning: 0.6,
  tick: 0.3,
  success: 0.4,
  error: 0.5,
};

/**
 * Check if running in browser environment
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Preload a sound file for faster playback
 */
export function preloadSound(type: SoundType): void {
  if (!isBrowser()) return;

  const path = SOUNDS[type];
  if (audioCache.has(path)) return;

  try {
    const audio = new Audio(path);
    audio.preload = 'auto';
    audio.volume = DEFAULT_VOLUMES[type];
    audioCache.set(path, audio);
  } catch (error) {
    console.warn(`Failed to preload sound: ${type}`, error);
  }
}

/**
 * Preload all sounds
 */
export function preloadAllSounds(): void {
  if (!isBrowser()) return;

  Object.keys(SOUNDS).forEach((type) => {
    preloadSound(type as SoundType);
  });
}

/**
 * Play a sound effect
 * @param type - The type of sound to play
 * @param volume - Optional volume override (0-1)
 * @returns Promise that resolves when sound starts playing
 */
export async function playSound(
  type: SoundType,
  volume?: number
): Promise<boolean> {
  if (!isBrowser()) return false;

  try {
    const path = SOUNDS[type];
    let audio = audioCache.get(path);

    // Create and cache if not preloaded
    if (!audio) {
      audio = new Audio(path);
      audioCache.set(path, audio);
    }

    // Set volume
    audio.volume = Math.max(0, Math.min(1, volume ?? DEFAULT_VOLUMES[type]));

    // Reset to beginning if already playing
    audio.currentTime = 0;

    // Play the sound
    await audio.play();
    return true;
  } catch (error) {
    // Autoplay may be blocked by browser
    console.warn(`Failed to play sound: ${type}`, error);
    return false;
  }
}

/**
 * Stop a currently playing sound
 */
export function stopSound(type: SoundType): void {
  if (!isBrowser()) return;

  const path = SOUNDS[type];
  const audio = audioCache.get(path);

  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
}

/**
 * Stop all currently playing sounds
 */
export function stopAllSounds(): void {
  if (!isBrowser()) return;

  audioCache.forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });
}

/**
 * Request audio permission from the browser
 * Useful for enabling autoplay on mobile devices
 * @returns Promise that resolves to true if permission granted
 */
export async function requestAudioPermission(): Promise<boolean> {
  if (!isBrowser()) return false;

  try {
    // Create a silent audio context interaction
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (AudioContext) {
      const ctx = new AudioContext();
      await ctx.resume();
      ctx.close();
    }

    // Also try playing a silent audio
    const audio = new Audio();
    audio.volume = 0;
    // Silent audio data
    audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
    await audio.play();
    audio.pause();

    return true;
  } catch (error) {
    console.warn('Failed to request audio permission:', error);
    return false;
  }
}

/**
 * Trigger haptic feedback on supported devices
 * @param pattern - Vibration pattern in milliseconds
 */
export function hapticFeedback(pattern: number | number[] = 10): void {
  if (!isBrowser()) return;

  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}

/**
 * Combined audio and haptic feedback
 * @param type - Sound type to play
 * @param hapticPattern - Optional haptic pattern
 */
export async function feedback(
  type: SoundType,
  hapticPattern?: number | number[]
): Promise<void> {
  await playSound(type);
  hapticFeedback(hapticPattern);
}

/**
 * Create a repeating tick sound for countdowns
 * @param interval - Interval in milliseconds
 * @returns Stop function
 */
export function startTickSound(interval: number = 1000): () => void {
  if (!isBrowser()) return () => {};

  const tickInterval = setInterval(() => {
    playSound('tick', 0.2);
  }, interval);

  return () => {
    clearInterval(tickInterval);
  };
}

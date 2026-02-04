import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import {
  Player,
  PlayerNote,
  ContentTracking,
  GeneratedContent,
  SavedTemplate,
  ContentMode,
  Platform,
  CardType,
  Product,
  AppearanceSchedule,
  ChecklistItem,
  Deliverable,
  DeliverableStatus,
  Station,
  StationStatus,
  PlayerArrival,
  ClipMarker,
  STATIONS
} from '@/types';
import { players as initialPlayers } from '@/data/players';
import { defaultChecklist, defaultDeliverables } from '@/data/checklist';

// Initialization flags to prevent race conditions
let stationsInitialized = false;
let checklistInitialized = false;
let deliverablesInitialized = false;

// Check if we're in browser environment
const isBrowser = typeof window !== 'undefined';

// Safe localStorage wrapper with quota handling and SSR support
const safeLocalStorage = {
  getItem: (name: string): string | null => {
    if (!isBrowser) return null;
    try {
      return localStorage.getItem(name);
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    if (!isBrowser) return;
    try {
      localStorage.setItem(name, value);
    } catch (error) {
      console.warn('Failed to write to localStorage:', error);
      // If quota exceeded, try to clear old data
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('Storage quota exceeded. Consider clearing old data.');
      }
    }
  },
  removeItem: (name: string): void => {
    if (!isBrowser) return;
    try {
      localStorage.removeItem(name);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  }
};

interface AppState {
  // Players (editable copy)
  players: Player[];
  updatePlayer: (id: string, updates: Partial<Player>) => void;
  updatePlayerSchedule: (id: string, schedule: AppearanceSchedule | null) => void;

  // Notes
  notes: PlayerNote[];
  addNote: (playerId: string, content: string, isQuote?: boolean) => void;
  deleteNote: (noteId: string) => void;
  getNotesForPlayer: (playerId: string) => PlayerNote[];

  // Content Tracking
  contentTracking: ContentTracking[];
  trackContent: (playerId: string, mode: ContentMode, platform: Platform) => void;
  getTrackingForPlayer: (playerId: string) => ContentTracking[];
  hasUsedMode: (playerId: string, mode: ContentMode) => boolean;
  getUnusedModes: (playerId: string) => ContentMode[];

  // Generated Content History
  generatedContent: GeneratedContent[];
  addGeneratedContent: (content: Omit<GeneratedContent, 'id' | 'createdAt'>) => string;
  markVariationUsed: (contentId: string, variationId: string) => void;
  markVariationAsSavedTemplate: (contentId: string, variationId: string) => void;
  getContentHistory: () => GeneratedContent[];

  // Saved Templates
  templates: SavedTemplate[];
  saveTemplate: (mode: ContentMode, platform: Platform, content: string, playerName: string) => void;
  deleteTemplate: (id: string) => void;
  getTemplatesForModeAndPlatform: (mode: ContentMode, platform: Platform) => SavedTemplate[];

  // UI State
  selectedPlayerId: string | null;
  selectedMode: ContentMode;
  selectedPlatform: Platform;
  selectedCardType: CardType | null;
  selectedProduct: Product | null;
  serialNumber: string;
  contextInput: string;
  isGenerating: boolean;
  isOffline: boolean;
  largeTextMode: boolean;

  // UI Actions
  setSelectedPlayer: (id: string | null) => void;
  setSelectedMode: (mode: ContentMode) => void;
  setSelectedPlatform: (platform: Platform) => void;
  setSelectedCardType: (cardType: CardType | null) => void;
  setSelectedProduct: (product: Product | null) => void;
  setSerialNumber: (serial: string) => void;
  setContextInput: (context: string) => void;
  setIsGenerating: (generating: boolean) => void;
  setIsOffline: (offline: boolean) => void;
  toggleLargeTextMode: () => void;

  // Day Recap
  dayRecapHighlights: string;
  dayRecapAutosSigned: string;
  dayRecapBestPull: string;
  dayRecapCrowdNotes: string;
  setDayRecapField: (field: 'highlights' | 'autosSigned' | 'bestPull' | 'crowdNotes', value: string) => void;

  // Checklist
  checklist: ChecklistItem[];
  toggleChecklistItem: (id: string) => void;
  initializeChecklist: () => void;

  // Deliverables
  deliverables: Deliverable[];
  updateDeliverableStatus: (id: string, status: DeliverableStatus) => void;
  addDeliverableNote: (id: string, note: string) => void;
  initializeDeliverables: () => void;

  // Stations
  stations: StationStatus[];
  updateStation: (station: Station, updates: Partial<StationStatus>) => void;
  initializeStations: () => void;

  // Player Arrivals
  playerArrivals: PlayerArrival[];
  markPlayerArrived: (playerId: string) => void;
  markPlayerDeparted: (playerId: string) => void;
  getPlayerArrival: (playerId: string) => PlayerArrival | undefined;
  getElapsedTime: (playerId: string) => number | null;

  // Clip Markers (for videographers)
  clipMarkers: ClipMarker[];
  addClipMarker: (station: Station, playerId: string | null, playerName: string | null, markedBy?: string) => string;
  deleteClipMarker: (markerId: string) => void;
  updateClipMarkerNote: (markerId: string, note: string) => void;
  getClipMarkersForStation: (station: Station) => ClipMarker[];
  getClipMarkersForPlayer: (playerId: string) => ClipMarker[];
  getAllClipMarkers: () => ClipMarker[];
  clearAllClipMarkers: () => void;

  // Reset
  resetUIState: () => void;
}

const ALL_MODES: ContentMode[] = [
  'Player Spotlight',
  'Pack Reveal / Hit',
  'Signing Session',
  'Legend Tribute',
  'Current Star Hype',
  'Event Promo',
  'Behind the Scenes',
  'Media Moment',
  'Product Drop',
  'Card Break Hype',
  'Day Recap'
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Players
      players: initialPlayers,
      updatePlayer: (id, updates) => set(state => ({
        players: state.players.map(p => p.id === id ? { ...p, ...updates } : p)
      })),
      updatePlayerSchedule: (id, schedule) => set(state => ({
        players: state.players.map(p => p.id === id ? { ...p, schedule } : p)
      })),

      // Notes
      notes: [],
      addNote: (playerId, content, isQuote = false) => set(state => ({
        notes: [...state.notes, {
          id: uuidv4(),
          playerId,
          content,
          isQuote,
          timestamp: Date.now()
        }]
      })),
      deleteNote: (noteId) => set(state => ({
        notes: state.notes.filter(n => n.id !== noteId)
      })),
      getNotesForPlayer: (playerId) => get().notes.filter(n => n.playerId === playerId),

      // Content Tracking
      contentTracking: [],
      trackContent: (playerId, mode, platform) => set(state => ({
        contentTracking: [...state.contentTracking, {
          playerId,
          mode,
          platform,
          usedAt: Date.now()
        }]
      })),
      getTrackingForPlayer: (playerId) => get().contentTracking.filter(t => t.playerId === playerId),
      hasUsedMode: (playerId, mode) => get().contentTracking.some(t => t.playerId === playerId && t.mode === mode),
      getUnusedModes: (playerId) => {
        const usedModes = get().contentTracking
          .filter(t => t.playerId === playerId)
          .map(t => t.mode);
        return ALL_MODES.filter(m => !usedModes.includes(m));
      },

      // Generated Content
      generatedContent: [],
      addGeneratedContent: (content) => {
        const id = uuidv4();
        set(state => ({
          generatedContent: [...state.generatedContent, {
            ...content,
            id,
            createdAt: Date.now()
          }]
        }));
        return id;
      },
      markVariationUsed: (contentId, variationId) => set(state => ({
        generatedContent: state.generatedContent.map(gc =>
          gc.id === contentId
            ? {
                ...gc,
                variations: gc.variations.map(v =>
                  v.id === variationId ? { ...v, used: true } : v
                )
              }
            : gc
        )
      })),
      markVariationAsSavedTemplate: (contentId, variationId) => set(state => ({
        generatedContent: state.generatedContent.map(gc =>
          gc.id === contentId
            ? {
                ...gc,
                variations: gc.variations.map(v =>
                  v.id === variationId ? { ...v, savedAsTemplate: true } : v
                )
              }
            : gc
        )
      })),
      getContentHistory: () => get().generatedContent.sort((a, b) => b.createdAt - a.createdAt),

      // Templates
      templates: [],
      saveTemplate: (mode, platform, content, playerName) => set(state => ({
        templates: [...state.templates, {
          id: uuidv4(),
          mode,
          platform,
          content,
          playerName,
          createdAt: Date.now()
        }]
      })),
      deleteTemplate: (id) => set(state => ({
        templates: state.templates.filter(t => t.id !== id)
      })),
      getTemplatesForModeAndPlatform: (mode, platform) =>
        get().templates.filter(t => t.mode === mode && t.platform === platform),

      // UI State
      selectedPlayerId: null,
      selectedMode: 'Player Spotlight',
      selectedPlatform: 'Instagram',
      selectedCardType: null,
      selectedProduct: null,
      serialNumber: '',
      contextInput: '',
      isGenerating: false,
      isOffline: false,
      largeTextMode: false,

      setSelectedPlayer: (id) => set({ selectedPlayerId: id }),
      setSelectedMode: (mode) => set({ selectedMode: mode }),
      setSelectedPlatform: (platform) => set({ selectedPlatform: platform }),
      setSelectedCardType: (cardType) => set({ selectedCardType: cardType }),
      setSelectedProduct: (product) => set({ selectedProduct: product }),
      setSerialNumber: (serial) => set({ serialNumber: serial }),
      setContextInput: (context) => set({ contextInput: context }),
      setIsGenerating: (generating) => set({ isGenerating: generating }),
      setIsOffline: (offline) => set({ isOffline: offline }),
      toggleLargeTextMode: () => set(state => ({ largeTextMode: !state.largeTextMode })),

      // Day Recap
      dayRecapHighlights: '',
      dayRecapAutosSigned: '',
      dayRecapBestPull: '',
      dayRecapCrowdNotes: '',
      setDayRecapField: (field, value) => {
        const fieldMap = {
          highlights: 'dayRecapHighlights',
          autosSigned: 'dayRecapAutosSigned',
          bestPull: 'dayRecapBestPull',
          crowdNotes: 'dayRecapCrowdNotes'
        } as const;
        set({ [fieldMap[field]]: value });
      },

      // Checklist
      checklist: [],
      toggleChecklistItem: (id) => set(state => ({
        checklist: state.checklist.map(item =>
          item.id === id
            ? { ...item, completed: !item.completed, completedAt: !item.completed ? Date.now() : undefined }
            : item
        )
      })),
      initializeChecklist: () => {
        // Prevent race condition with flag
        if (checklistInitialized) return;
        checklistInitialized = true;

        set(state => {
          if (state.checklist.length === 0) {
            return {
              checklist: defaultChecklist.map(item => ({
                ...item,
                id: uuidv4(),
                completed: false
              }))
            };
          }
          return {};
        });
      },

      // Deliverables
      deliverables: [],
      updateDeliverableStatus: (id, status) => set(state => ({
        deliverables: state.deliverables.map(d =>
          d.id === id
            ? { ...d, status, completedAt: status === 'completed' || status === 'delivered' ? Date.now() : undefined }
            : d
        )
      })),
      addDeliverableNote: (id, note) => set(state => ({
        deliverables: state.deliverables.map(d =>
          d.id === id ? { ...d, notes: note } : d
        )
      })),
      initializeDeliverables: () => {
        // Prevent race condition with flag
        if (deliverablesInitialized) return;
        deliverablesInitialized = true;

        const { deliverables } = get();
        if (deliverables.length > 0) {
          return;
        }
        set({
          deliverables: defaultDeliverables.map(d => ({
            ...d,
            id: uuidv4(),
            status: 'pending' as const
          }))
        });
      },

      // Stations
      stations: [],
      updateStation: (station, updates) => set(state => ({
        stations: state.stations.map(s =>
          s.station === station ? { ...s, ...updates } : s
        )
      })),
      initializeStations: () => {
        // Prevent race condition with flag
        if (stationsInitialized) return;
        stationsInitialized = true;

        const { stations } = get();
        if (stations.length > 0) {
          return;
        }
        set({
          stations: STATIONS.map(station => ({
            station,
            currentPlayer: null,
            currentCommitment: null,
            status: 'idle' as const,
            notes: ''
          }))
        });
      },

      // Player Arrivals
      playerArrivals: [],
      markPlayerArrived: (playerId) => set(state => {
        // Check if already arrived
        const existing = state.playerArrivals.find(a => a.playerId === playerId && !a.departedAt);
        if (existing) return {};

        return {
          playerArrivals: [...state.playerArrivals, {
            playerId,
            arrivedAt: Date.now()
          }]
        };
      }),
      markPlayerDeparted: (playerId) => set(state => ({
        playerArrivals: state.playerArrivals.map(a => {
          if (a.playerId === playerId && !a.departedAt) {
            const departedAt = Date.now();
            return {
              ...a,
              departedAt,
              actualDuration: Math.round((departedAt - a.arrivedAt) / (1000 * 60))
            };
          }
          return a;
        })
      })),
      getPlayerArrival: (playerId) => {
        return get().playerArrivals.find(a => a.playerId === playerId && !a.departedAt);
      },
      getElapsedTime: (playerId) => {
        const arrival = get().playerArrivals.find(a => a.playerId === playerId && !a.departedAt);
        if (!arrival) return null;
        return Math.round((Date.now() - arrival.arrivedAt) / (1000 * 60));
      },

      // Clip Markers
      clipMarkers: [],
      addClipMarker: (station, playerId, playerName, markedBy) => {
        const id = uuidv4();
        set(state => ({
          clipMarkers: [...state.clipMarkers, {
            id,
            station,
            playerId,
            playerName,
            timestamp: Date.now(),
            markedBy
          }]
        }));
        return id;
      },
      deleteClipMarker: (markerId) => set(state => ({
        clipMarkers: state.clipMarkers.filter(m => m.id !== markerId)
      })),
      updateClipMarkerNote: (markerId, note) => set(state => ({
        clipMarkers: state.clipMarkers.map(m =>
          m.id === markerId ? { ...m, note } : m
        )
      })),
      getClipMarkersForStation: (station) => {
        return get().clipMarkers
          .filter(m => m.station === station)
          .sort((a, b) => b.timestamp - a.timestamp);
      },
      getClipMarkersForPlayer: (playerId) => {
        return get().clipMarkers
          .filter(m => m.playerId === playerId)
          .sort((a, b) => b.timestamp - a.timestamp);
      },
      getAllClipMarkers: () => {
        return get().clipMarkers.sort((a, b) => b.timestamp - a.timestamp);
      },
      clearAllClipMarkers: () => set({ clipMarkers: [] }),

      // Reset
      resetUIState: () => set({
        selectedPlayerId: null,
        selectedMode: 'Player Spotlight',
        selectedPlatform: 'Instagram',
        selectedCardType: null,
        selectedProduct: null,
        serialNumber: '',
        contextInput: ''
      })
    }),
    {
      name: 'prizm-lounge-storage',
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (state) => ({
        // Persist everything except transient UI state
        players: state.players,
        notes: state.notes,
        contentTracking: state.contentTracking,
        generatedContent: state.generatedContent,
        templates: state.templates,
        dayRecapHighlights: state.dayRecapHighlights,
        dayRecapAutosSigned: state.dayRecapAutosSigned,
        dayRecapBestPull: state.dayRecapBestPull,
        dayRecapCrowdNotes: state.dayRecapCrowdNotes,
        checklist: state.checklist,
        deliverables: state.deliverables,
        stations: state.stations,
        playerArrivals: state.playerArrivals,
        clipMarkers: state.clipMarkers,
        largeTextMode: state.largeTextMode
      })
    }
  )
);

// Cross-tab sync: Listen for storage changes from other tabs
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'prizm-lounge-storage' && event.newValue) {
      try {
        const newState = JSON.parse(event.newValue);
        if (newState?.state) {
          // Trigger store rehydration on cross-tab changes
          useAppStore.setState(newState.state);
        }
      } catch (error) {
        console.warn('Failed to sync state from other tab:', error);
      }
    }
  });
}

// Selector hooks for common patterns
export const useSelectedPlayer = () => {
  const { selectedPlayerId, players } = useAppStore();
  return players.find(p => p.id === selectedPlayerId);
};

export const usePlayerNotes = (playerId: string) => {
  const notes = useAppStore(state => state.notes);
  return notes.filter(n => n.playerId === playerId).sort((a, b) => b.timestamp - a.timestamp);
};

export const useContentGaps = () => {
  const { players, contentTracking } = useAppStore();
  const gaps: { player: Player; unusedModes: ContentMode[] }[] = [];

  players.forEach(player => {
    const usedModes = contentTracking
      .filter(t => t.playerId === player.id)
      .map(t => t.mode);

    // Filter modes based on player category
    let relevantModes = [...ALL_MODES];
    if (player.category !== 'Legend') {
      relevantModes = relevantModes.filter(m => m !== 'Legend Tribute');
    }
    if (player.category !== 'Current') {
      relevantModes = relevantModes.filter(m => m !== 'Current Star Hype');
    }

    const unusedModes = relevantModes.filter(m => !usedModes.includes(m) && m !== 'Day Recap');

    if (unusedModes.length > 0) {
      gaps.push({ player, unusedModes });
    }
  });

  return gaps;
};

import { create } from 'zustand';
import type { YouTubeTrack, ViewName } from '@/types';

interface PlayerState {
  // Current playback
  currentTrack: YouTubeTrack | null;
  queue: YouTubeTrack[];
  history: YouTubeTrack[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: number; // 0=off 1=all 2=one
  isShuffle: boolean;

  // Navigation
  currentView: ViewName;
  currentPlaylistId: string | null;
  searchQuery: string;

  // Player ref
  playerReady: boolean;

  // Actions
  setCurrentTrack: (track: YouTubeTrack | null) => void;
  playTrack: (track: YouTubeTrack) => void;
  addToQueue: (track: YouTubeTrack) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  playNext: () => void;
  playPrevious: () => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  cycleRepeat: () => void;
  toggleShuffle: () => void;
  setCurrentView: (view: ViewName) => void;
  setCurrentPlaylistId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setPlayerReady: (ready: boolean) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  queue: [],
  history: [],
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 80,
  isMuted: false,
  repeatMode: 0,
  isShuffle: false,
  currentView: 'home',
  currentPlaylistId: null,
  searchQuery: '',
  playerReady: false,

  setCurrentTrack: (track) => set({ currentTrack: track }),

  playTrack: (track) => {
    const { currentTrack, history } = get();
    const newHistory = currentTrack
      ? [currentTrack, ...history].slice(0, 50)
      : history;
    set({
      currentTrack: track,
      isPlaying: true,
      currentTime: 0,
      history: newHistory,
    });
  },

  addToQueue: (track) => set((s) => ({ queue: [...s.queue, track] })),

  removeFromQueue: (index) =>
    set((s) => ({ queue: s.queue.filter((_, i) => i !== index) })),

  clearQueue: () => set({ queue: [] }),

  playNext: () => {
    const { queue, currentTrack, history, repeatMode, isShuffle } = get();
    if (repeatMode === 2 && currentTrack) {
      // Repeat one — restart same track
      set({ currentTime: 0, isPlaying: true });
      return;
    }
    if (queue.length > 0) {
      const nextIndex = isShuffle
        ? Math.floor(Math.random() * queue.length)
        : 0;
      const next = queue[nextIndex];
      const newQueue = queue.filter((_, i) => i !== nextIndex);
      const newHistory = currentTrack
        ? [currentTrack, ...history].slice(0, 50)
        : history;
      set({
        currentTrack: next,
        queue: newQueue,
        history: newHistory,
        isPlaying: true,
        currentTime: 0,
      });
    } else if (repeatMode === 1 && history.length > 0) {
      // Repeat all — cycle through history
      const reversed = [...history].reverse();
      set({
        currentTrack: reversed[0],
        queue: reversed.slice(1),
        history: [],
        isPlaying: true,
        currentTime: 0,
      });
    } else {
      set({ isPlaying: false });
    }
  },

  playPrevious: () => {
    const { history, currentTrack, queue } = get();
    if (history.length > 0) {
      const prev = history[0];
      const newHistory = history.slice(1);
      const newQueue = currentTrack ? [currentTrack, ...queue] : queue;
      set({
        currentTrack: prev,
        history: newHistory,
        queue: newQueue,
        isPlaying: true,
        currentTime: 0,
      });
    }
  },

  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume }),
  toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
  cycleRepeat: () => set((s) => ({ repeatMode: (s.repeatMode + 1) % 3 })),
  toggleShuffle: () => set((s) => ({ isShuffle: !s.isShuffle })),
  setCurrentView: (currentView) => set({ currentView }),
  setCurrentPlaylistId: (currentPlaylistId) => set({ currentPlaylistId }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setPlayerReady: (playerReady) => set({ playerReady }),
}));

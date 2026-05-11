import { create } from 'zustand';
import type { Track, Playlist, ViewName, AppConfig } from '@/types';

interface PlayerState {
  // Library
  tracks: Track[];
  filteredTracks: Track[];
  currentIndex: number;
  isPlaying: boolean;
  isShuffle: boolean;
  repeatMode: number; // 0=off 1=all 2=one
  volume: number;
  isMuted: boolean;
  liked: Set<number>;
  currentView: ViewName;

  // Playlists
  playlists: Record<string, Playlist>;
  currentPlaylistId: string | null;

  // Listen log (On Repeat)
  listenLog: Record<string, number>;

  // Lyrics
  lyricsVisible: boolean;
  lyricsOverlayOpen: boolean;

  // Config
  config: Partial<AppConfig>;

  // Actions
  setTracks: (tracks: Track[]) => void;
  setFilteredTracks: (tracks: Track[]) => void;
  setCurrentIndex: (index: number) => void;
  setIsPlaying: (playing: boolean) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleLike: (id: number) => void;
  setCurrentView: (view: ViewName) => void;
  setPlaylists: (pl: Record<string, Playlist>) => void;
  setCurrentPlaylistId: (id: string | null) => void;
  addPlaylist: (id: string, playlist: Playlist) => void;
  removePlaylist: (id: string) => void;
  setListenLog: (log: Record<string, number>) => void;
  recordListenTime: (key: string, seconds: number) => void;
  toggleLyricsVisible: () => void;
  toggleLyricsOverlay: () => void;
  setLyricsOverlayOpen: (open: boolean) => void;
  setConfig: (config: Partial<AppConfig>) => void;
  setLikedSet: (liked: number[]) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  tracks: [],
  filteredTracks: [],
  currentIndex: -1,
  isPlaying: false,
  isShuffle: false,
  repeatMode: 0,
  volume: 0.8,
  isMuted: false,
  liked: new Set(),
  currentView: 'songs',
  playlists: {},
  currentPlaylistId: null,
  listenLog: {},
  lyricsVisible: true,
  lyricsOverlayOpen: false,
  config: {},

  setTracks: (tracks) => set({ tracks, filteredTracks: [...tracks] }),
  setFilteredTracks: (filteredTracks) => set({ filteredTracks }),
  setCurrentIndex: (currentIndex) => set({ currentIndex }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  toggleShuffle: () => set((s) => ({ isShuffle: !s.isShuffle })),
  cycleRepeat: () => set((s) => ({ repeatMode: (s.repeatMode + 1) % 3 })),
  setVolume: (volume) => set({ volume }),
  toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
  toggleLike: (id) =>
    set((s) => {
      const next = new Set(s.liked);
      next.has(id) ? next.delete(id) : next.add(id);
      return { liked: next };
    }),
  setCurrentView: (currentView) => set({ currentView }),
  setPlaylists: (playlists) => set({ playlists }),
  setCurrentPlaylistId: (currentPlaylistId) => set({ currentPlaylistId }),
  addPlaylist: (id, playlist) =>
    set((s) => ({ playlists: { ...s.playlists, [id]: playlist } })),
  removePlaylist: (id) =>
    set((s) => {
      const next = { ...s.playlists };
      delete next[id];
      return { playlists: next };
    }),
  setListenLog: (listenLog) => set({ listenLog }),
  recordListenTime: (key, seconds) =>
    set((s) => ({
      listenLog: { ...s.listenLog, [key]: (s.listenLog[key] || 0) + seconds },
    })),
  toggleLyricsVisible: () => set((s) => ({ lyricsVisible: !s.lyricsVisible })),
  toggleLyricsOverlay: () => set((s) => ({ lyricsOverlayOpen: !s.lyricsOverlayOpen })),
  setLyricsOverlayOpen: (open) => set({ lyricsOverlayOpen: open }),
  setConfig: (config) => set((s) => ({ config: { ...s.config, ...config } })),
  setLikedSet: (liked) => set({ liked: new Set(liked) }),
}));

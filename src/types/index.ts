// ─── Electron API (exposed via preload.js) ────────────────
export interface ElectronAPI {
  closeWindow: () => Promise<void>;
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  openFolder: () => Promise<string | null>;
  readDir: (dirPath: string) => Promise<FileEntry[]>;
  readFileSlice: (filePath: string, start: number, end: number) => Promise<Buffer | null>;
  fileUrl: (filePath: string) => Promise<string>;
  readConfig: () => Promise<AppConfig | null>;
  writeConfig: (data: AppConfig) => Promise<boolean>;
  getConfigPath: () => Promise<string>;
  isElectron: boolean;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

// ─── Core Types ───────────────────────────────────────────

export interface FileEntry {
  name: string;
  path: string;
}

export interface Track {
  id: number;
  file: File | null;
  path: string | null;
  url: string;
  name: string;
  artist: string;
  album: string;
  duration: number;
  artLoaded: boolean;
  lrcFile: File | null;
  lrcPath: string | null;
  // Server-side fields (if synced)
  serverId?: string;
  categoryId?: string | null;
}

export interface Category {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
}

export interface Playlist {
  name: string;
  trackIds: number[];
}

export interface RadioStation {
  id: string;
  name: string;
  url: string;
  favicon: string;
  country: string;
  countryCode: string;
  language: string;
  tags: string;
  codec: string;
  bitrate: number;
  votes: number;
}

export interface RadioCountry {
  name: string;
  code: string;
  stationCount: number;
}

// ─── Auth Types ───────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  roles: string[];
  createdAt: string;
}

export interface AuthTokens {
  token: string;
  refreshToken?: string;
}

// ─── Config ───────────────────────────────────────────────

export interface AppConfig {
  musicFolder: string;
  volume: number;
  shuffle: boolean;
  repeat: number; // 0=off 1=all 2=one
  lyricsVisible: boolean;
  accentColor: string;
  dynamicColor: boolean;
  autoLyrics: boolean;
  blurLyrics: boolean;
  crossfade: boolean;
  eqPreset: string;
  bgEffect: string;
  playbackSpeed: number;
  playlists: Record<string, Playlist>;
  listenLog: Record<string, number>;
  liked: number[];
  // Auth
  authToken?: string;
  refreshToken?: string;
  userEmail?: string;
}

// ─── Lyrics ───────────────────────────────────────────────

export interface SyncedLyricLine {
  time: number;
  text: string;
}

export interface LyricsResult {
  synced?: string;
  plain?: string;
  source: string;
}

// ─── View Types ───────────────────────────────────────────

export type ViewName =
  | 'songs'
  | 'albums'
  | 'artists'
  | 'liked'
  | 'stats'
  | 'categories'
  | 'radio'
  | 'playlist-onrepeat'
  | 'playlist-custom';

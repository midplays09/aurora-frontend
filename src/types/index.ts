// ─── YouTube Track ────────────────────────────────────────
export interface YouTubeTrack {
  videoId: string;
  title: string;
  channelName: string;
  thumbnail: string;
  duration: number; // seconds
}

export interface LibraryTrack {
  id: string;
  title: string;
  artist: string;
  album?: string | null;
  duration: number;
  categoryId?: string | null;
  userId: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
}

// ─── Playlist ─────────────────────────────────────────────
export interface Playlist {
  id: string;
  name: string;
  userId: string;
  trackIds: string[]; // YouTube video IDs
  createdAt: string;
  updatedAt: string;
}

// ─── Favorite ─────────────────────────────────────────────
export interface Favorite {
  id: string;
  userId: string;
  videoId: string;
  title: string;
  channelName: string;
  thumbnail: string;
  duration: number;
  createdAt: string;
}

// ─── Comment ──────────────────────────────────────────────
export interface Comment {
  id: string;
  userId: string;
  userEmail?: string;
  username?: string;
  displayName?: string;
  videoId: string;
  text: string;
  createdAt: string;
}

// ─── Track Stats ──────────────────────────────────────────
export interface TrackStat {
  videoId: string;
  totalViews: number;
  totalWatchTimeSeconds: number;
  totalLikes: number;
}

// ─── Radio ────────────────────────────────────────────────
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
  username?: string | null;
  displayName?: string;
  roles: string[];
  createdAt: string;
}

// ─── View Types ───────────────────────────────────────────
export type ViewName =
  | 'home'
  | 'search'
  | 'library'
  | 'playlists'
  | 'playlist-detail'
  | 'favorites'
  | 'radio';

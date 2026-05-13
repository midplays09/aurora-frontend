'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Trash2, Loader2 } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { formatDuration } from '@/lib/utils';
import api from '@/lib/api';
import type { Playlist, YouTubeTrack } from '@/types';

export default function PlaylistDetailView() {
  const { currentPlaylistId, setCurrentView, playTrack, addToQueue } = usePlayerStore();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [tracks, setTracks] = useState<YouTubeTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentPlaylistId) return;
    loadPlaylist();
  }, [currentPlaylistId]);

  const loadPlaylist = async () => {
    setIsLoading(true);
    try {
      const playlists = await api.getPlaylists();
      const pl = playlists.find((p: Playlist) => p.id === currentPlaylistId);
      setPlaylist(pl || null);
      if (pl?.trackIds?.length) {
        const detailResults = await Promise.all(
          pl.trackIds.map((videoId: string) => api.getVideoDetails(videoId).catch(() => null))
        );
        const hydratedTracks = detailResults
          .map((detail, index) => {
            if (!detail) return null;
            return {
              videoId: pl.trackIds[index],
              title: detail.title || detail.name || pl.trackIds[index],
              channelName: detail.channelName || detail.channelTitle || 'YouTube',
              thumbnail: detail.thumbnail || detail.thumbnails?.medium?.url || detail.thumbnails?.default?.url || '',
              duration: detail.duration || 0,
            };
          })
          .filter(Boolean) as YouTubeTrack[];
        setTracks(hydratedTracks);
      } else {
        setTracks([]);
      }
    } catch { /* ignore */ }
    setIsLoading(false);
  };

  const handleRemoveTrack = async (videoId: string) => {
    if (!currentPlaylistId) return;
    try {
      const updated = await api.removeTrackFromPlaylist(currentPlaylistId, videoId);
      setPlaylist(updated);
      setTracks((prev) => prev.filter((track) => track.videoId !== videoId));
    } catch { /* ignore */ }
  };

  const playAll = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0]);
      tracks.slice(1).forEach((t) => addToQueue(t));
    }
  };

  if (!currentPlaylistId) return null;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
      >
        {/* Back button */}
        <button
          onClick={() => setCurrentView('playlists')}
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: 16, gap: 6 }}
        >
          <ArrowLeft size={14} /> Back to Playlists
        </button>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <Loader2 size={24} className="animate-spin" style={{ color: 'var(--text-tertiary)' }} />
          </div>
        ) : playlist ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700, letterSpacing: 0, marginBottom: 4 }}>
                  {playlist.name}
                </h1>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {playlist.trackIds.length} {playlist.trackIds.length === 1 ? 'track' : 'tracks'}
                </p>
              </div>
              {tracks.length > 0 && (
                <button onClick={playAll} className="btn btn-primary" style={{ gap: 6 }}>
                  <Play size={14} fill="white" /> Play All
                </button>
              )}
            </div>

            {playlist.trackIds.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                  This playlist is empty
                </p>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', marginTop: 4 }}>
                  Search for music and add tracks to this playlist.
                </p>
              </div>
            ) : (
              <div>
                {(tracks.length ? tracks : playlist.trackIds.map((videoId) => ({
                  videoId,
                  title: videoId,
                  channelName: 'Loading metadata',
                  thumbnail: '',
                  duration: 0,
                }))).map((track, index) => (
                  <div
                    key={track.videoId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 12px',
                      borderRadius: 8,
                      transition: 'background 150ms ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-hover)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', width: 24, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                      {index + 1}
                    </span>
                    {track.thumbnail && (
                      <img src={track.thumbnail} alt="" style={{ width: 42, height: 32, borderRadius: 6, objectFit: 'cover' }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="truncate" style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {track.title}
                      </p>
                      <p className="truncate" style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        {track.channelName}
                      </p>
                    </div>
                    {tracks.length > 0 && (
                      <button onClick={() => playTrack(track)} className="btn-icon" title="Play">
                        <Play size={14} fill="currentColor" />
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveTrack(track.videoId)}
                      className="btn-icon"
                      style={{ color: 'var(--text-tertiary)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--error)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <p style={{ color: 'var(--text-tertiary)' }}>Playlist not found.</p>
        )}
      </motion.div>
    </div>
  );
}

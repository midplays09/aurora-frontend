'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Play, Heart, Plus, Loader2 } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { formatDuration } from '@/lib/utils';
import api from '@/lib/api';
import type { YouTubeTrack } from '@/types';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { ease: [0.22, 1, 0.36, 1] as const, duration: 0.4 } },
};

export default function SearchView() {
  const { playTrack, addToQueue } = usePlayerStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<YouTubeTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setHasSearched(true);
    try {
      const data = await api.searchYouTube(query.trim());
      setResults(data || []);
    } catch {
      setResults([]);
    }
    setIsLoading(false);
  }, [query]);

  const handleFavorite = async (track: YouTubeTrack) => {
    try {
      await api.addFavorite({
        videoId: track.videoId,
        title: track.title,
        channelName: track.channelName,
        thumbnail: track.thumbnail,
        duration: track.duration,
      });
    } catch { /* already favorited or error */ }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Search Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
      >
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, letterSpacing: '-0.04em', marginBottom: 20 }}>
          Search
        </h1>

        {/* Search Input */}
        <div style={{ position: 'relative', marginBottom: 32 }}>
          <Search size={18} style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-tertiary)', pointerEvents: 'none',
          }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search for songs, artists..."
            className="input"
            style={{
              paddingLeft: 42, paddingRight: 80,
              height: 44, fontSize: '0.9375rem',
              borderRadius: 10,
            }}
            autoFocus
          />
          <button
            onClick={handleSearch}
            disabled={isLoading || !query.trim()}
            className="btn btn-primary btn-sm"
            style={{
              position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
              borderRadius: 7,
            }}
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : 'Search'}
          </button>
        </div>
      </motion.div>

      {/* Results */}
      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="shimmer" style={{ height: 64, borderRadius: 10 }} />
          ))}
        </div>
      )}

      {!isLoading && hasSearched && results.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '60px 0' }}
        >
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9375rem' }}>
            No results found for &ldquo;{query}&rdquo;
          </p>
        </motion.div>
      )}

      {!isLoading && results.length > 0 && (
        <motion.div variants={container} initial="hidden" animate="show">
          {/* Column header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '48px 1fr 140px 60px 80px',
            gap: 12,
            padding: '0 12px 8px',
            fontSize: '0.6875rem',
            fontWeight: 600,
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            borderBottom: '1px solid var(--border)',
            marginBottom: 4,
          }}>
            <span></span>
            <span>Title</span>
            <span>Channel</span>
            <span style={{ textAlign: 'right' }}>Duration</span>
            <span></span>
          </div>

          {results.map((track, index) => (
            <motion.div
              key={track.videoId}
              variants={item}
              style={{
                display: 'grid',
                gridTemplateColumns: '48px 1fr 140px 60px 80px',
                gap: 12,
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'background 150ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              onClick={() => playTrack(track)}
            >
              {/* Thumbnail */}
              <div style={{
                width: 48, height: 36, borderRadius: 6, overflow: 'hidden',
                background: 'var(--surface)', position: 'relative', flexShrink: 0,
              }}>
                <img src={track.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(0,0,0,0.4)', opacity: 0, transition: 'opacity 150ms ease',
                }}
                  className="play-overlay"
                >
                  <Play size={14} fill="white" color="white" />
                </div>
              </div>

              {/* Title */}
              <div style={{ minWidth: 0 }}>
                <p className="truncate" style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {track.title}
                </p>
              </div>

              {/* Channel */}
              <p className="truncate" style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                {track.channelName}
              </p>

              {/* Duration */}
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                {formatDuration(track.duration)}
              </p>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => handleFavorite(track)}
                  className="btn-icon"
                  title="Add to favorites"
                >
                  <Heart size={14} />
                </button>
                <button
                  onClick={() => addToQueue(track)}
                  className="btn-icon"
                  title="Add to queue"
                >
                  <Plus size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Empty state */}
      {!hasSearched && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ textAlign: 'center', padding: '80px 0' }}
        >
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'var(--accent-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Search size={28} style={{ color: 'var(--accent)' }} />
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', fontWeight: 500 }}>
            Search YouTube&apos;s music catalog
          </p>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', marginTop: 4 }}>
            Find songs, artists, albums, and more
          </p>
        </motion.div>
      )}
    </div>
  );
}

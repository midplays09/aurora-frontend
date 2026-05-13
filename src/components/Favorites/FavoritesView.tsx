'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Play, Trash2, Loader2 } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { formatDuration } from '@/lib/utils';
import api from '@/lib/api';
import type { Favorite } from '@/types';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { ease: [0.22, 1, 0.36, 1] as const, duration: 0.4 } },
};

export default function FavoritesView() {
  const { playTrack } = usePlayerStore();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setIsLoading(true);
    try {
      const data = await api.getFavorites();
      setFavorites(data || []);
    } catch { /* ignore */ }
    setIsLoading(false);
  };

  const handleRemove = async (videoId: string) => {
    try {
      await api.removeFavorite(videoId);
      setFavorites((prev) => prev.filter((f) => f.videoId !== videoId));
    } catch { /* ignore */ }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
        style={{ marginBottom: 24 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(239,68,68,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Heart size={18} style={{ color: '#EF4444' }} />
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, letterSpacing: 0 }}>
            Favorites
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          {favorites.length} {favorites.length === 1 ? 'track' : 'tracks'}
        </p>
      </motion.div>

      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--text-tertiary)' }} />
        </div>
      )}

      {!isLoading && favorites.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '60px 0' }}
        >
          <Heart size={40} style={{ color: 'var(--text-tertiary)', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>No favorites yet</p>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', marginTop: 4 }}>
            Search for music and click the heart icon to save tracks here.
          </p>
        </motion.div>
      )}

      {!isLoading && favorites.length > 0 && (
        <motion.div variants={container} initial="hidden" animate="show">
          {favorites.map((fav) => (
            <motion.div
              key={fav.id}
              variants={item}
              style={{
                display: 'grid',
                gridTemplateColumns: '48px 1fr 140px 60px 40px',
                gap: 12,
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'background 150ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              onClick={() => playTrack({
                videoId: fav.videoId,
                title: fav.title,
                channelName: fav.channelName,
                thumbnail: fav.thumbnail,
                duration: fav.duration,
              })}
            >
              <div style={{
                width: 48, height: 36, borderRadius: 6, overflow: 'hidden',
                background: 'var(--surface)', flexShrink: 0,
              }}>
                <img src={fav.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <p className="truncate" style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{fav.title}</p>
              <p className="truncate" style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>{fav.channelName}</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                {formatDuration(fav.duration)}
              </p>
              <div onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => handleRemove(fav.videoId)}
                  className="btn-icon"
                  title="Remove from favorites"
                  style={{ color: 'var(--text-tertiary)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--error)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

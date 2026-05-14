'use client';

import { useEffect, useState } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function LyricsOverlay() {
  const { currentTrack, isLyricsOpen, setIsLyricsOpen } = usePlayerStore();
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLyricsOpen || !currentTrack) return;
    
    // We try to extract artist and title from the YouTube video title
    // A naive approach: "Artist - Title"
    const parseTitle = (title: string, channelName: string) => {
      let artist = channelName;
      let songName = title;
      
      // If title has " - ", split it
      if (title.includes(' - ')) {
        const parts = title.split(' - ');
        artist = parts[0];
        songName = parts[1];
      }
      
      // Remove common suffixes like (Official Video), [MV], etc.
      songName = songName.replace(/\([^)]+\)|\[[^\]]+\]/g, '').trim();
      artist = artist.replace(/VEVO|Official|Topic/gi, '').trim();
      
      return { artist, songName };
    };

    const fetchLyrics = async () => {
      setLoading(true);
      setError(null);
      setLyrics(null);
      
      try {
        const { artist, songName } = parseTitle(currentTrack.title, currentTrack.channelName);
        const res = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(songName)}`);
        
        if (!res.ok) {
          throw new Error('Lyrics not found');
        }
        
        const data = await res.json();
        setLyrics(data.lyrics);
      } catch (err) {
        setError("We couldn't find lyrics for this track.");
      } finally {
        setLoading(false);
      }
    };

    fetchLyrics();
  }, [currentTrack, isLyricsOpen]);

  return (
    <AnimatePresence>
      {isLyricsOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={{
            position: 'fixed',
            bottom: 'calc(var(--player-height) + 16px)',
            right: 16,
            width: 340,
            maxHeight: '60vh',
            background: 'color-mix(in srgb, var(--surface) 95%, transparent)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 90,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600 }}>Lyrics</h3>
              <p className="truncate" style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', maxWidth: 260 }}>
                {currentTrack?.title}
              </p>
            </div>
            <button onClick={() => setIsLyricsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>✕</button>
          </div>
          
          <div className="scrollbar-thin" style={{ padding: '16px', overflowY: 'auto', flex: 1, whiteSpace: 'pre-line', fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                <div style={{ width: 24, height: 24, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} className="animate-spin" />
              </div>
            )}
            
            {error && !loading && (
              <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '40px 0' }}>
                {error}
              </div>
            )}
            
            {lyrics && !loading && lyrics}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { usePlayerStore } from '@/store/playerStore';
import { useAuthStore } from '@/store/authStore';
import { Play } from 'lucide-react';
import api from '@/lib/api';
import type { YouTubeTrack } from '@/types';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { ease: [0.22, 1, 0.36, 1] as const, duration: 0.5 } },
};

export default function HomeView() {
  const playTrack = usePlayerStore((s) => s.playTrack);
  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const user = useAuthStore((s) => s.user);
  
  const [trending, setTrending] = useState<YouTubeTrack[]>([]);
  const [chillVibes, setChillVibes] = useState<YouTubeTrack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchDiscover = async () => {
      try {
        setLoading(true);
        // We do a couple parallel searches for standard discover topics
        const [trendingRes, chillRes] = await Promise.all([
          api.searchYouTube('trending music hits', 12),
          api.searchYouTube('lofi hip hop chill beats', 12)
        ]);
        if (mounted) {
          setTrending(trendingRes);
          setChillVibes(chillRes);
        }
      } catch (err) {
        console.error('Failed to load discover content', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchDiscover();
    return () => { mounted = false; };
  }, []);

  const TrackRow = ({ tracks, title }: { tracks: YouTubeTrack[], title: string }) => (
    <motion.div variants={item} style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
        {title}
      </h2>
      <div 
        className="scrollbar-thin"
        style={{ 
          display: 'flex', 
          gap: 16, 
          overflowX: 'auto', 
          paddingBottom: 16,
          margin: '0 -20px',
          padding: '0 20px 16px 20px'
        }}
      >
        {tracks.map((track) => (
          <div 
            key={track.videoId}
            className="group"
            style={{ 
              width: 160, 
              flexShrink: 0, 
              background: 'var(--surface)', 
              padding: 12, 
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              transition: 'background 200ms ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--surface)'}
            onClick={() => playTrack(track)}
          >
            <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', marginBottom: 12, borderRadius: 8, overflow: 'hidden' }}>
              <img src={track.thumbnail} alt={track.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div 
                style={{
                  position: 'absolute', bottom: 8, right: 8, 
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'var(--accent)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: 0, transform: 'translateY(8px)',
                  transition: 'all 200ms ease',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.3)'
                }}
                className="group-hover-play"
              >
                <Play size={20} fill="currentColor" style={{ marginLeft: 2 }} />
              </div>
            </div>
            <p className="truncate" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              {track.title}
            </p>
            <p className="truncate" style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              {track.channelName}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      style={{ padding: '32px' }}
    >
      {/* Hero greeting */}
      <motion.div variants={item} style={{ marginBottom: 40 }}>
        <h1 style={{
          fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em',
          marginBottom: 8, color: 'var(--text-primary)'
        }}>
          {getGreeting()}{user ? `, ${user.displayName || user.username || user.email.split('@')[0]}` : ''}
        </h1>
      </motion.div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
          <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} className="animate-spin" />
        </div>
      ) : (
        <>
          <style>{`
            .group:hover .group-hover-play {
              opacity: 1 !important;
              transform: translateY(0) !important;
            }
          `}</style>
          {trending.length > 0 && <TrackRow tracks={trending} title="Trending Now" />}
          {chillVibes.length > 0 && <TrackRow tracks={chillVibes} title="Chill Vibes" />}
        </>
      )}
    </motion.div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

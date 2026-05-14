'use client';

import { usePlayerStore } from '@/store/playerStore';
import { formatDuration } from '@/lib/utils';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Repeat, Repeat1, Shuffle, ListMusic, MonitorPlay, Mic2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PlayerBar() {
  const {
    currentTrack, isPlaying, currentTime, duration,
    volume, isMuted, repeatMode, isShuffle,
    setIsPlaying, setVolume, toggleMute,
    cycleRepeat, toggleShuffle, playNext, playPrevious,
    setSeekRequest, isVideoPopupOpen, setIsVideoPopupOpen,
    isLyricsOpen, setIsLyricsOpen,
  } = usePlayerStore();

  if (!currentTrack) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setSeekRequest(percent * duration);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="glass"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 'var(--sidebar-width)',
          right: 0,
          height: 'var(--player-height)',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: 20,
          zIndex: 50,
        }}
      >
        {/* Left — Track Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: 280, flexShrink: 0 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 8, overflow: 'hidden',
            background: 'var(--surface-hover)', flexShrink: 0,
          }}>
            {currentTrack.thumbnail && (
              <img
                src={currentTrack.thumbnail}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <p className="truncate" style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}>
              {currentTrack.title}
            </p>
            <p className="truncate" style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              {currentTrack.channelName}
            </p>
          </div>
        </div>

        {/* Center — Controls + Progress */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={toggleShuffle}
              className="btn-icon"
              style={{ color: isShuffle ? 'var(--accent)' : 'var(--text-tertiary)' }}
            >
              <Shuffle size={16} />
            </button>
            <button onClick={playPrevious} className="btn-icon">
              <SkipBack size={18} />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'var(--text-primary)', color: 'var(--bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: 'none', cursor: 'pointer',
                transition: 'transform 150ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" style={{ marginLeft: 2 }} />}
            </button>
            <button onClick={playNext} className="btn-icon">
              <SkipForward size={18} />
            </button>
            <button
              onClick={cycleRepeat}
              className="btn-icon"
              style={{ color: repeatMode > 0 ? 'var(--accent)' : 'var(--text-tertiary)' }}
            >
              {repeatMode === 2 ? <Repeat1 size={16} /> : <Repeat size={16} />}
            </button>
          </div>

          {/* Progress bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', maxWidth: 500 }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', width: 36, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
              {formatDuration(currentTime)}
            </span>
            <div 
              onClick={handleProgressClick}
              style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--border)', position: 'relative', cursor: 'pointer' }}
            >
              <div style={{
                height: '100%', borderRadius: 2,
                background: 'var(--accent)',
                width: `${progress}%`,
                transition: 'width 100ms linear',
              }} />
            </div>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', width: 36, fontVariantNumeric: 'tabular-nums' }}>
              {formatDuration(duration)}
            </span>
          </div>
        </div>

        {/* Right — Volume + Queue */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 220, justifyContent: 'flex-end', flexShrink: 0 }}>
          <button 
            className="btn-icon" 
            onClick={() => setIsLyricsOpen(!isLyricsOpen)}
            style={{ color: isLyricsOpen ? 'var(--accent)' : 'var(--text-tertiary)' }}
            title="Lyrics"
          >
            <Mic2 size={16} />
          </button>
          <button 
            className="btn-icon" 
            onClick={() => setIsVideoPopupOpen(!isVideoPopupOpen)}
            style={{ color: isVideoPopupOpen ? 'var(--accent)' : 'var(--text-tertiary)' }}
            title="Watch Video"
          >
            <MonitorPlay size={16} />
          </button>
          <button onClick={toggleMute} className="btn-icon" style={{ marginLeft: 8 }}>
            {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            style={{ 
              width: 80, 
              accentColor: 'var(--accent)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

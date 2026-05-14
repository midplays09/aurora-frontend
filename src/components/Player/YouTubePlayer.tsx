'use client';

import { useRef, useEffect } from 'react';
import YouTube from 'react-youtube';
import type { YouTubeEvent } from 'react-youtube';
import { usePlayerStore } from '@/store/playerStore';
import api from '@/lib/api';

export default function YouTubePlayer() {
  const {
    currentTrack, isPlaying, volume, isMuted,
    setIsPlaying, setCurrentTime, setDuration,
    setPlayerReady, playNext,
    seekRequest, setSeekRequest,
    isVideoPopupOpen, setIsVideoPopupOpen,
  } = usePlayerStore();

  const playerRef = useRef<ReturnType<YouTubeEvent['target']['getInternalPlayer']> | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const watchStartRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (playerRef.current) {
      try {
        if (isPlaying) {
          playerRef.current.playVideo();
        } else {
          playerRef.current.pauseVideo();
        }
      } catch { /* player not ready */ }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (playerRef.current) {
      try {
        playerRef.current.setVolume(isMuted ? 0 : volume);
      } catch { /* ignore */ }
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (seekRequest !== null && playerRef.current) {
      try {
        playerRef.current.seekTo(seekRequest, true);
      } catch { /* ignore */ }
      setSeekRequest(null);
    }
  }, [seekRequest, setSeekRequest]);

  const onReady = (event: YouTubeEvent) => {
    playerRef.current = event.target;
    setPlayerReady(true);
    event.target.setVolume(isMuted ? 0 : volume);
    if (isPlaying) {
      event.target.playVideo();
    }
  };

  const onStateChange = (event: YouTubeEvent) => {
    const state = event.data;
    // -1=unstarted, 0=ended, 1=playing, 2=paused, 3=buffering, 5=cued
    if (state === 1) {
      // Playing
      setIsPlaying(true);
      const dur = event.target.getDuration();
      setDuration(dur);
      watchStartRef.current = Date.now();

      // Track progress
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        if (playerRef.current) {
          try {
            const t = playerRef.current.getCurrentTime();
            setCurrentTime(t);
          } catch { /* ignore */ }
        }
      }, 500);
    } else if (state === 2) {
      // Paused
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else if (state === 0) {
      // Ended — record watch time and play next
      if (intervalRef.current) clearInterval(intervalRef.current);
      const watchTime = Math.floor((Date.now() - watchStartRef.current) / 1000);
      if (currentTrack) {
        api.recordView(currentTrack.videoId, watchTime).catch(() => {});
      }
      playNext();
    }
  };

  if (!currentTrack) return null;

  return (
    <>
      <div 
        style={{ 
          position: 'fixed', 
          bottom: 100, 
          right: 20, 
          zIndex: isVideoPopupOpen ? 9999 : 100, 
          opacity: isVideoPopupOpen ? 1 : 0.01, 
          pointerEvents: isVideoPopupOpen ? 'auto' : 'none', 
          width: isVideoPopupOpen ? 480 : 1, 
          height: isVideoPopupOpen ? 270 : 1, 
          overflow: 'hidden',
          borderRadius: 'var(--radius-lg)',
          boxShadow: isVideoPopupOpen ? 'var(--shadow-lg)' : 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          background: 'var(--surface-hover)'
        }}
      >
        {isVideoPopupOpen && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '12px 16px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)', display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
            <span style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 500, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>Now Playing</span>
            <button onClick={() => setIsVideoPopupOpen(false)} style={{ color: '#fff', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.8 }}>✕</button>
          </div>
        )}
        <YouTube
          videoId={currentTrack.videoId}
          opts={{
            height: isVideoPopupOpen ? '270' : '1',
            width: isVideoPopupOpen ? '480' : '1',
            playerVars: {
              autoplay: 1,
              controls: isVideoPopupOpen ? 1 : 0,
              disablekb: 1,
              fs: 0,
              modestbranding: 1,
              rel: 0,
            },
          }}
          onReady={onReady}
          onStateChange={onStateChange}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      
      {isVideoPopupOpen && (
        <div 
          onClick={() => setIsVideoPopupOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--overlay)',
            zIndex: 9998,
            backdropFilter: 'blur(4px)'
          }}
        />
      )}
    </>
  );
}

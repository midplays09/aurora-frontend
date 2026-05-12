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
    <div style={{ position: 'fixed', bottom: 100, right: 20, zIndex: 100, opacity: 0.01, pointerEvents: 'none', width: 1, height: 1, overflow: 'hidden' }}>
      <YouTube
        videoId={currentTrack.videoId}
        opts={{
          height: '1',
          width: '1',
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            rel: 0,
          },
        }}
        onReady={onReady}
        onStateChange={onStateChange}
      />
    </div>
  );
}

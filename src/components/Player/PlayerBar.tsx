'use client';

import { usePlayerStore } from '@/store/playerStore';
import { formatTime } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';

export default function PlayerBar() {
  const { 
    tracks, currentIndex, isPlaying, setIsPlaying, 
    volume, setVolume, toggleMute, isMuted,
    toggleShuffle, isShuffle, cycleRepeat, repeatMode,
    toggleLyricsVisible, lyricsVisible, config
  } = usePlayerStore();

  const [progress, setProgress] = useState(0);
  const track = tracks[currentIndex] || null;
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current && typeof window !== 'undefined') {
      audioRef.current = new Audio();
      
      const audio = audioRef.current;
      audio.addEventListener('timeupdate', () => setProgress(audio.currentTime));
      audio.addEventListener('ended', () => {
        // Need to trigger next track logic from a custom hook later
        window.dispatchEvent(new CustomEvent('app:nextTrack'));
      });
    }

    if (track && audioRef.current) {
      if (audioRef.current.src !== track.url) {
        audioRef.current.src = track.url;
        audioRef.current.load();
      }
      if (isPlaying) audioRef.current.play().catch(console.error);
      else audioRef.current.pause();
    }
  }, [track, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setProgress(time);
    if (audioRef.current) audioRef.current.currentTime = time;
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  if (!track) {
    return (
      <div className="fixed bottom-0 left-0 right-0 h-24 bg-black/40 backdrop-blur-xl border-t border-white/5 flex items-center px-6 z-50">
        <div className="flex-1"></div>
        <div className="flex flex-col items-center flex-1 space-y-2">
          <div className="flex items-center space-x-6 text-white/20">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 19 2 12 11 5 11 19"></polygon><polygon points="22 19 13 12 22 5 22 19"></polygon></svg>
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 19 22 12 13 5 13 19"></polygon><polygon points="2 19 11 12 2 5 2 19"></polygon></svg>
          </div>
          <div className="w-full max-w-md h-1 bg-white/10 rounded-full"></div>
        </div>
        <div className="flex-1"></div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-black/40 backdrop-blur-xl border-t border-white/10 flex items-center px-6 z-50">
      
      {/* Track Info */}
      <div className="flex items-center flex-1 overflow-hidden min-w-0 pr-4">
        <div className="relative w-14 h-14 rounded-md overflow-hidden shrink-0 bg-white/10 shadow-lg group">
          {/* Vinyl placeholder or cover art */}
          <div className={`w-full h-full bg-gradient-to-br from-[#24C8D8] to-purple-600 ${isPlaying ? 'animate-spin-slow rounded-full' : ''}`} />
          {isPlaying && (
            <div className="absolute inset-0 m-auto w-3 h-3 bg-black rounded-full border border-white/20" />
          )}
        </div>
        <div className="ml-4 truncate min-w-0">
          <h4 className="text-white font-medium truncate">{track.name}</h4>
          <p className="text-white/60 text-sm truncate">{track.artist}</p>
        </div>
        <button className="ml-4 text-white/40 hover:text-[#24C8D8] transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center flex-1 max-w-xl px-4">
        <div className="flex items-center space-x-6 mb-2">
          <button 
            onClick={toggleShuffle} 
            className={`${isShuffle ? 'text-[#24C8D8]' : 'text-white/40'} hover:text-white transition-colors`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>
          </button>
          
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('app:prevTrack'))}
            className="text-white/80 hover:text-white transition-colors"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 19 2 12 11 5 11 19"></polygon><polygon points="22 19 13 12 22 5 22 19"></polygon></svg>
          </button>
          
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            )}
          </button>
          
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('app:nextTrack'))}
            className="text-white/80 hover:text-white transition-colors"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 19 22 12 13 5 13 19"></polygon><polygon points="2 19 11 12 2 5 2 19"></polygon></svg>
          </button>

          <button 
            onClick={cycleRepeat} 
            className={`${repeatMode > 0 ? 'text-[#24C8D8]' : 'text-white/40'} hover:text-white transition-colors relative`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
            {repeatMode === 2 && <span className="absolute -top-1 -right-1 text-[8px] bg-[#24C8D8] text-black w-3 h-3 rounded-full flex items-center justify-center font-bold">1</span>}
          </button>
        </div>

        <div className="flex items-center w-full space-x-3 text-xs text-white/50 font-medium">
          <span className="w-10 text-right">{formatTime(progress)}</span>
          <div className="flex-1 group relative flex items-center h-4">
            <input 
              type="range" 
              min="0" 
              max={track.duration || 100} 
              value={progress}
              onChange={handleSeek}
              className="absolute w-full z-10 opacity-0 cursor-pointer h-full"
            />
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white group-hover:bg-[#24C8D8] transition-colors"
                style={{ width: `${(progress / (track.duration || 100)) * 100}%` }}
              />
            </div>
          </div>
          <span className="w-10">{formatTime(track.duration)}</span>
        </div>
      </div>

      {/* Extra Controls */}
      <div className="flex items-center justify-end flex-1 pr-4 space-x-4">
        <button 
          onClick={toggleLyricsVisible}
          className={`${lyricsVisible ? 'text-[#24C8D8]' : 'text-white/40'} hover:text-white transition-colors`}
          title="Toggle Lyrics"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
        </button>

        <div className="flex items-center space-x-2 w-32 group relative h-4">
          <button onClick={toggleMute} className="text-white/60 hover:text-white shrink-0">
            {isMuted || volume === 0 ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
            )}
          </button>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolume}
            className="absolute w-full z-10 opacity-0 cursor-pointer h-full left-6"
          />
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden ml-6">
            <div 
              className="h-full bg-white/80 group-hover:bg-white transition-colors"
              style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

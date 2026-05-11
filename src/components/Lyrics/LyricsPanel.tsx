'use client';

import { useState, useEffect, useRef } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { fetchLyrics, parseLRC } from '@/lib/lyrics';
import type { SyncedLyricLine } from '@/types';

export default function LyricsPanel() {
  const { lyricsVisible, tracks, currentIndex, isPlaying } = usePlayerStore();
  const track = tracks[currentIndex];
  
  const [lyrics, setLyrics] = useState<SyncedLyricLine[]>([]);
  const [plainLyrics, setPlainLyrics] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [activeLine, setActiveLine] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!track || !lyricsVisible) return;

    const loadLyrics = async () => {
      setLoading(true);
      setLyrics([]);
      setPlainLyrics('');

      try {
        const result = await fetchLyrics(track.name, track.artist);
        if (result?.synced) {
          setLyrics(parseLRC(result.synced));
        } else if (result?.plain) {
          setPlainLyrics(result.plain);
        } else {
          setPlainLyrics("No lyrics found.");
        }
      } catch {
        setPlainLyrics("Error loading lyrics.");
      }
      setLoading(false);
    };

    loadLyrics();
  }, [track?.id, track?.name, track?.artist, lyricsVisible]);

  // Simulate active line tracking (in a real app, this syncs with the Audio element's currentTime)
  useEffect(() => {
    if (!lyrics.length || !isPlaying) return;
    
    // This is a placeholder. The real implementation needs an interval or requestAnimationFrame
    // that reads the <audio> element's currentTime and finds the closest lyric line.
    const interval = setInterval(() => {
      // Simulate progress for demo purposes
      setActiveLine(prev => (prev + 1) % lyrics.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [lyrics, isPlaying]);

  // Auto-scroll to active line
  useEffect(() => {
    if (containerRef.current && activeLine > 0) {
      const activeEl = containerRef.current.querySelector('.lyric-active');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeLine]);

  if (!lyricsVisible) return null;

  return (
    <div className="w-80 h-full border-l border-white/5 bg-black/30 backdrop-blur-md flex flex-col pb-24 transition-all duration-300">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="font-display font-bold text-lg text-white">Lyrics</h3>
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('app:toggleFullscreenLyrics'))}
          className="w-8 h-8 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
        </button>
      </div>

      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4 text-white/40">
            <div className="w-6 h-6 border-2 border-[#24C8D8] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm">Fetching lyrics...</p>
          </div>
        ) : lyrics.length > 0 ? (
          <div className="space-y-4 pb-32 pt-16">
            {lyrics.map((line, i) => (
              <p 
                key={i}
                className={`text-lg font-bold transition-all duration-300 cursor-pointer ${
                  i === activeLine 
                    ? 'text-white scale-105 origin-left lyric-active shadow-black' 
                    : 'text-white/30 hover:text-white/60'
                }`}
                style={i === activeLine ? { textShadow: '0 2px 10px rgba(0,0,0,0.5)' } : {}}
              >
                {line.text}
              </p>
            ))}
          </div>
        ) : plainLyrics ? (
          <div className="whitespace-pre-wrap text-white/60 font-medium leading-relaxed">
            {plainLyrics}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-white/30 text-center px-4">
            <div>
              <svg className="w-12 h-12 mx-auto mb-4 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
              <p>Play a track to see lyrics</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

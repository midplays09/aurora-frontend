'use client';

import { usePlayerStore } from '@/store/playerStore';
import { formatTime } from '@/lib/utils';
import type { Track } from '@/types';

export default function SongsView() {
  const { filteredTracks, currentIndex, isPlaying, setCurrentIndex, setIsPlaying, toggleLike, liked } = usePlayerStore();

  const handlePlayTrack = (index: number) => {
    if (currentIndex === index) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentIndex(index);
      setIsPlaying(true);
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="sticky top-0 z-10 bg-[#0d0d0f]/90 backdrop-blur-md pb-4 pt-2">
        <h1 className="text-4xl font-display font-bold text-white mb-6">Songs</h1>
        
        <div className="flex items-center space-x-4 mb-6">
          <button 
            className="btn btn-primary rounded-full w-12 h-12 flex items-center justify-center pl-1 shadow-lg shadow-[#24C8D8]/20"
            onClick={() => filteredTracks.length > 0 && handlePlayTrack(0)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          </button>
          <button className="btn w-12 h-12 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>
          </button>
          
          <div className="ml-auto relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              placeholder="Search songs..." 
              className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#24C8D8] transition-colors w-64"
            />
          </div>
        </div>

        {/* Header Row */}
        <div className="grid grid-cols-[auto_1fr_1fr_auto_auto] gap-4 px-4 py-2 text-xs font-bold text-white/40 uppercase tracking-wider border-b border-white/10">
          <div className="w-8 text-center">#</div>
          <div>Title</div>
          <div>Album</div>
          <div className="w-24 text-right">Duration</div>
          <div className="w-12 text-center"></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredTracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-white/40">
            <svg className="w-16 h-16 mb-4 opacity-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
            <p>No songs found. Open a folder to add music.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredTracks.map((track, i) => {
              const isCurrent = currentIndex === i;
              const isLiked = liked.has(track.id);
              
              return (
                <div 
                  key={track.id}
                  onDoubleClick={() => handlePlayTrack(i)}
                  className={`group grid grid-cols-[auto_1fr_1fr_auto_auto] gap-4 items-center px-4 py-3 rounded-lg cursor-pointer transition-colors ${
                    isCurrent ? 'bg-white/10' : 'hover:bg-white/5'
                  }`}
                >
                  {/* Number / Play Button */}
                  <div className="w-8 text-center flex items-center justify-center">
                    {isCurrent && isPlaying ? (
                      <div className="flex space-x-1 items-end h-4">
                        <div className="w-1 bg-[#24C8D8] animate-[pulse_1s_ease-in-out_infinite]" style={{ height: '100%' }}></div>
                        <div className="w-1 bg-[#24C8D8] animate-[pulse_1.2s_ease-in-out_infinite]" style={{ height: '60%' }}></div>
                        <div className="w-1 bg-[#24C8D8] animate-[pulse_0.8s_ease-in-out_infinite]" style={{ height: '80%' }}></div>
                      </div>
                    ) : (
                      <>
                        <span className={`text-sm ${isCurrent ? 'text-[#24C8D8] font-bold hidden group-hover:hidden' : 'text-white/40 group-hover:hidden'}`}>
                          {i + 1}
                        </span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handlePlayTrack(i); }}
                          className={`hidden group-hover:flex text-white hover:text-[#24C8D8] ${isCurrent ? '!flex text-[#24C8D8]' : ''}`}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                        </button>
                      </>
                    )}
                  </div>

                  {/* Title & Artist */}
                  <div className="min-w-0">
                    <p className={`truncate font-medium ${isCurrent ? 'text-[#24C8D8]' : 'text-white'}`}>
                      {track.name}
                    </p>
                    <p className="truncate text-sm text-white/50 group-hover:text-white/80 transition-colors">
                      {track.artist}
                    </p>
                  </div>

                  {/* Album */}
                  <div className="min-w-0">
                    <p className="truncate text-sm text-white/50 group-hover:text-white/80 transition-colors">
                      {track.album || 'Unknown Album'}
                    </p>
                  </div>

                  {/* Duration */}
                  <div className="w-24 text-right text-sm text-white/50">
                    {formatTime(track.duration)}
                  </div>

                  {/* Actions */}
                  <div className="w-12 flex items-center justify-end">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleLike(track.id); }}
                      className={`hover:scale-110 transition-transform ${isLiked ? 'text-red-500' : 'text-white/20 hover:text-white'}`}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

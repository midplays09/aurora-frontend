'use client';

import { isElectron } from '@/lib/utils';
import { useState } from 'react';

export default function TopBar() {
  const [isMaximized, setIsMaximized] = useState(false);

  if (!isElectron()) return null;

  const handleMinimize = () => window.electronAPI?.minimizeWindow();
  const handleMaximize = () => {
    window.electronAPI?.maximizeWindow();
    setIsMaximized(!isMaximized);
  };
  const handleClose = () => window.electronAPI?.closeWindow();

  return (
    <div 
      className="fixed top-0 left-0 right-0 h-8 flex items-center justify-between z-50 bg-black/20"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <div className="flex items-center pl-4 space-x-2">
        <div className="w-4 h-4 rounded-full bg-[#24C8D8] opacity-80" />
        <span className="text-xs font-bold tracking-widest text-white/50 uppercase font-display">
          Aurora
        </span>
      </div>

      <div 
        className="flex items-center h-full"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <button 
          onClick={handleMinimize}
          className="h-full px-4 hover:bg-white/10 text-white/70 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12"><path fill="currentColor" d="M1 5.5h10v1H1z"/></svg>
        </button>
        <button 
          onClick={handleMaximize}
          className="h-full px-4 hover:bg-white/10 text-white/70 transition-colors"
        >
          {isMaximized ? (
             <svg width="12" height="12" viewBox="0 0 12 12"><path fill="currentColor" d="M2.5 2.5v7h7v-7h-7zM1 1h10v10H1V1z"/></svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12"><path fill="currentColor" d="M1.5 1.5v9h9v-9h-9zM0 0h12v12H0V0z"/></svg>
          )}
        </button>
        <button 
          onClick={handleClose}
          className="h-full px-4 hover:bg-red-500 text-white/70 hover:text-white transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12"><path fill="currentColor" d="M1.414 1L6 5.586 10.586 1 12 2.414 7.414 7 12 11.586 10.586 13 6 8.414 1.414 13 0 11.586 4.586 7 0 2.414 1.414 1z"/></svg>
        </button>
      </div>
    </div>
  );
}

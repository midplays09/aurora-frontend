'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { usePlayerStore } from '@/store/playerStore';
import AuthPage from '@/components/Auth/AuthPage';
import Sidebar from '@/components/Sidebar/Sidebar';
import PlayerBar from '@/components/Player/PlayerBar';
import YouTubePlayer from '@/components/Player/YouTubePlayer';
import HomeView from '@/components/Home/HomeView';
import SearchView from '@/components/Search/SearchView';
import PlaylistsView from '@/components/Playlists/PlaylistsView';
import PlaylistDetailView from '@/components/Playlists/PlaylistDetailView';
import FavoritesView from '@/components/Favorites/FavoritesView';
import RadioView from '@/components/Radio/RadioView';

export default function Home() {
  const { isAuthenticated, restoreSession, isLoading: authLoading } = useAuthStore();
  const { currentView, currentTrack } = usePlayerStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('aurora_token');
      if (token) {
        await restoreSession(token);
      }
      setIsInitializing(false);
    };
    init();
  }, [restoreSession]);

  // Loading screen
  if (isInitializing || authLoading) {
    return (
      <div style={{
        display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)', flexDirection: 'column', gap: 16,
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--accent), #3B82F6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
          </svg>
        </motion.div>
        <div style={{
          width: 20, height: 20,
          border: '2px solid var(--border)',
          borderTopColor: 'var(--accent)',
          borderRadius: '50%',
        }} className="animate-spin" />
      </div>
    );
  }

  // Auth screen
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // Main app
  const renderView = () => {
    switch (currentView) {
      case 'home': return <HomeView />;
      case 'search': return <SearchView />;
      case 'playlists': return <PlaylistsView />;
      case 'playlist-detail': return <PlaylistDetailView />;
      case 'favorites': return <FavoritesView />;
      case 'radio': return <RadioView />;
      default: return <HomeView />;
    }
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      background: 'var(--bg)',
      color: 'var(--text-primary)',
    }}>
      <Sidebar />

      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '32px 40px',
          paddingBottom: currentTrack ? 'calc(var(--player-height) + 32px)' : 32,
        }}
        className="scrollbar-thin"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] as const }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      <PlayerBar />
      <YouTubePlayer />
    </div>
  );
}

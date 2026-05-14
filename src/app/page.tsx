'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { usePlayerStore } from '@/store/playerStore';
import AuthPage from '@/components/Auth/AuthPage';
import AppHeader from '@/components/Header/AppHeader';
import Sidebar from '@/components/Sidebar/Sidebar';
import PlayerBar from '@/components/Player/PlayerBar';
import YouTubePlayer from '@/components/Player/YouTubePlayer';
import LyricsOverlay from '@/components/Player/LyricsOverlay';
import HomeView from '@/components/Home/HomeView';
import SearchView from '@/components/Search/SearchView';
import LibraryView from '@/components/Library/LibraryView';
import PlaylistsView from '@/components/Playlists/PlaylistsView';
import PlaylistDetailView from '@/components/Playlists/PlaylistDetailView';
import FavoritesView from '@/components/Favorites/FavoritesView';
import RadioView from '@/components/Radio/RadioView';
import SettingsView from '@/components/Settings/SettingsView';

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
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-primary)',
            fontWeight: 800,
          }}
        >
          A
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
      case 'library': return <LibraryView />;
      case 'playlists': return <PlaylistsView />;
      case 'playlist-detail': return <PlaylistDetailView />;
      case 'favorites': return <FavoritesView />;
      case 'radio': return <RadioView />;
      case 'settings': return <SettingsView />;
      default: return <HomeView />;
    }
  };

  return (
    <div className="app-frame">
      <Sidebar />

      <main
        className="main-stage scrollbar-thin"
        style={{ paddingBottom: currentTrack ? 'calc(var(--player-height) + 34px)' : 34 }}
      >
        <AppHeader />
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: 18, filter: 'blur(6px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -18, filter: 'blur(6px)' }}
            transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] as const }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      <PlayerBar />
      <LyricsOverlay />
      <YouTubePlayer />
    </div>
  );
}

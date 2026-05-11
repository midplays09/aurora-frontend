'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { usePlayerStore } from '@/store/playerStore';
import { isElectron, isOnline } from '@/lib/utils';
import LoginForm from '@/components/Auth/LoginForm';
import Sidebar from '@/components/Sidebar/Sidebar';
import PlayerBar from '@/components/Player/PlayerBar';
import LyricsPanel from '@/components/Lyrics/LyricsPanel';
import BackgroundEffects from '@/components/UI/BackgroundEffects';
import TopBar from '@/components/UI/TopBar';
// Views
import SongsView from '@/components/Library/SongsView';
import CategoriesView from '@/components/Categories/CategoryView';
import RadioView from '@/components/Radio/RadioView';

export default function Home() {
  const { isAuthenticated, restoreSession, isLoading: authLoading } = useAuthStore();
  const { currentView } = usePlayerStore();
  
  const [isInitializing, setIsInitializing] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);

  useEffect(() => {
    const init = async () => {
      // Check online status
      const online = isOnline();
      
      if (!online) {
        setOfflineMode(true);
        setIsInitializing(false);
        return;
      }

      // Try to restore session
      let token = null;
      if (isElectron()) {
        const config = await window.electronAPI?.readConfig();
        token = config?.authToken;
      } else {
        token = localStorage.getItem('aurora_token');
      }

      if (token) {
        await restoreSession(token);
      }
      
      setIsInitializing(false);
    };

    init();

    const handleOnline = () => setOfflineMode(false);
    const handleOffline = () => setOfflineMode(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [restoreSession]);

  if (isInitializing || authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0d0d0f]">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-[#24C8D8]"></div>
      </div>
    );
  }

  // Show login if not authenticated and not in offline mode
  if (!isAuthenticated && !offlineMode) {
    return <LoginForm onContinueOffline={() => setOfflineMode(true)} />;
  }

  // Render main app
  return (
    <div className="relative flex h-screen w-screen overflow-hidden text-white selection:bg-[#24C8D8] selection:text-black">
      <BackgroundEffects />
      
      {/* Top drag bar for Electron */}
      <TopBar />

      <div className="z-10 flex h-full w-full flex-col pt-8">
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 pb-24">
            {currentView === 'songs' && <SongsView />}
            {currentView === 'categories' && <CategoriesView />}
            {currentView === 'radio' && <RadioView />}
            {/* Add other views here */}
            {currentView !== 'songs' && currentView !== 'categories' && currentView !== 'radio' && (
              <div className="flex h-full items-center justify-center">
                <h2 className="text-2xl font-bold text-gray-500">Coming Soon</h2>
              </div>
            )}
          </main>

          <LyricsPanel />
        </div>

        <PlayerBar />
      </div>
    </div>
  );
}

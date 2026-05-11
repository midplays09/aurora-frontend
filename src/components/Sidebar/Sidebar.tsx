'use client';

import { usePlayerStore } from '@/store/playerStore';
import { useAuthStore } from '@/store/authStore';
import { isElectron } from '@/lib/utils';
import type { ViewName } from '@/types';

export default function Sidebar() {
  const { currentView, setCurrentView, playlists } = usePlayerStore();
  const { isAuthenticated, user, logout } = useAuthStore();

  const handleOpenFolder = async () => {
    if (isElectron()) {
      const folder = await window.electronAPI?.openFolder();
      if (folder) {
        // Trigger library scan - to be implemented in useAudioPlayer
        window.dispatchEvent(new CustomEvent('app:scanFolder', { detail: folder }));
      }
    }
  };

  const NavItem = ({ icon, label, view }: { icon: React.ReactNode; label: string; view: ViewName | 'folder' | 'settings' }) => {
    const isActive = currentView === view;
    return (
      <button
        onClick={() => {
          if (view === 'folder') handleOpenFolder();
          else if (view !== 'settings') setCurrentView(view as ViewName);
        }}
        className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
          isActive 
            ? 'bg-white/10 text-white font-medium' 
            : 'text-white/60 hover:text-white hover:bg-white/5'
        }`}
      >
        <span className={isActive ? 'text-[#24C8D8]' : ''}>{icon}</span>
        <span className="text-sm">{label}</span>
      </button>
    );
  };

  return (
    <div className="w-64 h-full flex flex-col border-r border-white/5 bg-black/20 backdrop-blur-md pb-24">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
        
        {/* Library Section */}
        <div>
          <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2 px-4">Library</h3>
          <div className="space-y-1">
            <NavItem 
              view="songs" 
              label="Songs" 
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>} 
            />
            <NavItem 
              view="categories" 
              label="Categories" 
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>} 
            />
            <NavItem 
              view="radio" 
              label="Radio" 
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="2"></circle><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"></path></svg>} 
            />
            {isElectron() && (
              <NavItem 
                view="folder" 
                label="Open Folder" 
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>} 
              />
            )}
          </div>
        </div>

        {/* Playlists Section */}
        <div>
          <div className="flex items-center justify-between px-4 mb-2">
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider">Playlists</h3>
            <button className="text-white/40 hover:text-white transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
          </div>
          <div className="space-y-1">
            <NavItem 
              view="playlist-onrepeat" 
              label="On Repeat" 
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>} 
            />
            {Object.keys(playlists).map(id => (
              <NavItem 
                key={id}
                view="playlist-custom" 
                label={playlists[id].name} 
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-white/5 bg-black/10">
        {isAuthenticated ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#24C8D8] to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {user?.email?.[0].toUpperCase()}
              </div>
              <div className="truncate text-sm text-white/80">
                {user?.email}
              </div>
            </div>
            <button onClick={logout} className="text-white/40 hover:text-white shrink-0 ml-2" title="Logout">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </div>
        ) : (
          <button 
            onClick={() => window.location.reload()} 
            className="w-full btn border border-white/10 hover:bg-white/5"
          >
            Sign In
          </button>
        )}
      </div>
    </div>
  );
}

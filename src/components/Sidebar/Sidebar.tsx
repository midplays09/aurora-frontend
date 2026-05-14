'use client';

import { usePlayerStore } from '@/store/playerStore';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import {
  Home, Search, ListMusic, Heart, Radio,
  Plus, ChevronRight, Library,
} from 'lucide-react';
import type { ViewName, Playlist } from '@/types';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function Sidebar() {
  const currentView = usePlayerStore((s) => s.currentView);
  const setCurrentView = usePlayerStore((s) => s.setCurrentView);
  const setCurrentPlaylistId = usePlayerStore((s) => s.setCurrentPlaylistId);
  const setSearchQuery = usePlayerStore((s) => s.setSearchQuery);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showNewPlaylist, setShowNewPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      api.getPlaylists().then(setPlaylists).catch(() => {});
    }
  }, [isAuthenticated, currentView]);

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    try {
      const pl = await api.createPlaylist(newPlaylistName.trim());
      setPlaylists((prev) => [pl, ...prev]);
      setNewPlaylistName('');
      setShowNewPlaylist(false);
    } catch { /* ignore */ }
  };

  const NavItem = ({ icon, label, view, onClick }: {
    icon: React.ReactNode;
    label: string;
    view?: ViewName;
    onClick?: () => void;
  }) => {
    const isActive = view ? currentView === view : false;
    return (
      <button
        onClick={() => {
          if (onClick) onClick();
          else if (view) {
            setCurrentView(view);
            if (view === 'search') setSearchQuery('');
          }
        }}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '7px 12px',
          borderRadius: 8,
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.8125rem',
          fontWeight: isActive ? 500 : 400,
          fontFamily: 'var(--font-sans)',
          color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
          background: isActive ? 'var(--surface-hover)' : 'transparent',
          transition: 'all 150ms ease',
          position: 'relative',
        }}
        onMouseEnter={(e) => {
          if (!isActive) e.currentTarget.style.background = 'var(--surface-hover)';
        }}
        onMouseLeave={(e) => {
          if (!isActive) e.currentTarget.style.background = 'transparent';
        }}
      >
        {isActive && (
          <motion.div
            layoutId="sidebar-indicator"
            style={{
              position: 'absolute',
              left: 0, top: '50%', transform: 'translateY(-50%)',
              width: 3, height: 16,
              borderRadius: 4,
              background: 'var(--accent)',
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}
        <span style={{ display: 'flex', alignItems: 'center', opacity: isActive ? 1 : 0.6 }}>
          {icon}
        </span>
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div style={{
      width: 'var(--sidebar-width)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid var(--border)',
      background: 'var(--bg-subtle)',
      flexShrink: 0,
      userSelect: 'none',
    }}>
      {/* Navigation */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 8px' }} className="scrollbar-thin">
        {/* Discover */}
        <div style={{ marginBottom: 20 }}>
          <p style={{
            fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-tertiary)',
            textTransform: 'uppercase', letterSpacing: '0.05em',
            padding: '0 12px', marginBottom: 6,
          }}>Discover</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <NavItem icon={<Home size={16} />} label="Home" view="home" />
            <NavItem icon={<Search size={16} />} label="Search" view="search" />
            <NavItem icon={<Library size={16} />} label="Library" view="library" />
          </div>
        </div>

        {/* Library */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 12px', marginBottom: 6,
          }}>
            <p style={{
              fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-tertiary)',
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>Library</p>
            <button
              onClick={() => setShowNewPlaylist(!showNewPlaylist)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-tertiary)', display: 'flex', padding: 2,
                borderRadius: 4, transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; }}
              title="Create playlist"
            >
              <Plus size={14} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <NavItem icon={<Heart size={16} />} label="Favorites" view="favorites" />
            <NavItem icon={<ListMusic size={16} />} label="Playlists" view="playlists" />
          </div>

          {/* New Playlist Input */}
          {showNewPlaylist && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              style={{ padding: '8px 12px' }}
            >
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
                  placeholder="Playlist name..."
                  className="input"
                  style={{ fontSize: '0.75rem', padding: '5px 8px' }}
                  autoFocus
                />
                <button
                  onClick={handleCreatePlaylist}
                  className="btn btn-primary btn-sm"
                  style={{ flexShrink: 0 }}
                >
                  Add
                </button>
              </div>
            </motion.div>
          )}

          {/* Playlist items */}
          {playlists.map((pl) => (
            <button
              key={pl.id}
              onClick={() => {
                setCurrentPlaylistId(pl.id);
                setCurrentView('playlist-detail');
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '6px 12px 6px 38px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                fontFamily: 'var(--font-sans)',
                color: 'var(--text-secondary)',
                background: 'transparent',
                borderRadius: 8,
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <ChevronRight size={12} style={{ opacity: 0.4 }} />
              <span className="truncate">{pl.name}</span>
              <span style={{ marginLeft: 'auto', fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                {pl.trackIds.length}
              </span>
            </button>
          ))}
        </div>

        {/* Live */}
        <div>
          <p style={{
            fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-tertiary)',
            textTransform: 'uppercase', letterSpacing: '0.05em',
            padding: '0 12px', marginBottom: 6,
          }}>Live</p>
          <NavItem icon={<Radio size={16} />} label="Radio" view="radio" />
        </div>
      </div>
    </div>
  );
}

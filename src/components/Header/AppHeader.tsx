'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Bell, ChevronDown, Compass, Library, Moon, Radio, Search, Sun,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { usePlayerStore } from '@/store/playerStore';
import type { ViewName } from '@/types';

const navItems: Array<{ label: string; view: ViewName; icon: React.ReactNode }> = [
  { label: 'Discover', view: 'home', icon: <Compass size={14} /> },
  { label: 'Search', view: 'search', icon: <Search size={14} /> },
  { label: 'Library', view: 'library', icon: <Library size={14} /> },
  { label: 'Radio', view: 'radio', icon: <Radio size={14} /> },
];

export default function AppHeader() {
  const { currentView, setCurrentView, setSearchQuery, searchQuery } = usePlayerStore();
  const { user } = useAuthStore();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = (localStorage.getItem('aurora_theme') || 'dark') as 'dark' | 'light';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('aurora_theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setCurrentView('search');
    }
  };

  return (
    <header className="app-header">
      <motion.div
        className="brand-mark"
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35 }}
      >
        <span>Aurora</span>
      </motion.div>

      <nav className="top-nav" aria-label="Primary">
        {navItems.map((item) => {
          const active = currentView === item.view || (item.view === 'library' && ['playlists', 'playlist-detail', 'favorites'].includes(currentView));
          return (
            <button
              key={item.view}
              className={active ? 'active' : ''}
              onClick={() => setCurrentView(item.view)}
            >
              {active && <motion.span layoutId="top-nav-pill" className="top-nav-pill" transition={{ type: 'spring', stiffness: 420, damping: 36 }} />}
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="header-actions">
        <form onSubmit={handleSearchSubmit} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, color: 'var(--text-tertiary)' }} />
          <input
            ref={searchInputRef}
            type="text"
            className="command-button"
            placeholder="Search music"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 34, paddingRight: 34, textAlign: 'left', outline: 'none', width: 220 }}
          />
          <kbd style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>/</kbd>
        </form>
        <button className="icon-button" onClick={toggleTheme} title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button className="icon-button" title="Notifications">
          <Bell size={16} />
        </button>
        {user && (
          <button className="profile-button" onClick={() => setCurrentView('settings')} title="Settings">
            <span>{user.displayName || user.username || user.email.split('@')[0]}</span>
            <ChevronDown size={13} />
          </button>
        )}
      </div>
    </header>
  );
}

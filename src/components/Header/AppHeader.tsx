'use client';

import { useEffect, useState } from 'react';
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
  const { currentView, setCurrentView, setSearchQuery } = usePlayerStore();
  const { user, logout } = useAuthStore();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = (localStorage.getItem('aurora_theme') || 'dark') as 'dark' | 'light';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('aurora_theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const openSearch = () => {
    setCurrentView('search');
    setSearchQuery('');
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
        <button className="command-button" onClick={openSearch}>
          <Search size={15} />
          <span>Search music</span>
          <kbd>/</kbd>
        </button>
        <button className="icon-button" onClick={toggleTheme} title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button className="icon-button" title="Notifications">
          <Bell size={16} />
        </button>
        {user && (
          <button className="profile-button" onClick={logout} title="Sign out">
            <span>{user.displayName || user.username || user.email.split('@')[0]}</span>
            <ChevronDown size={13} />
          </button>
        )}
      </div>
    </header>
  );
}

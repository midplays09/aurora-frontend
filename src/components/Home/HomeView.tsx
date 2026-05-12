'use client';

import { motion } from 'framer-motion';
import { usePlayerStore } from '@/store/playerStore';
import { useAuthStore } from '@/store/authStore';
import { Search, Play, Heart, Radio, ListMusic, ArrowRight } from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { ease: [0.22, 1, 0.36, 1] as const, duration: 0.5 } },
};

export default function HomeView() {
  const { setCurrentView } = usePlayerStore();
  const { user } = useAuthStore();

  const quickActions = [
    { icon: <Search size={20} />, label: 'Search Music', desc: 'Find any track on YouTube', view: 'search' as const, color: '#8B5CF6' },
    { icon: <Heart size={20} />, label: 'Favorites', desc: 'Your liked tracks', view: 'favorites' as const, color: '#EF4444' },
    { icon: <ListMusic size={20} />, label: 'Playlists', desc: 'Your custom collections', view: 'playlists' as const, color: '#3B82F6' },
    { icon: <Radio size={20} />, label: 'Live Radio', desc: 'Worldwide stations', view: 'radio' as const, color: '#22C55E' },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      style={{ maxWidth: 900, margin: '0 auto' }}
    >
      {/* Hero greeting */}
      <motion.div variants={item} style={{ marginBottom: 48 }}>
        <h1 style={{
          fontSize: '2.25rem', fontWeight: 700, letterSpacing: '-0.04em',
          marginBottom: 8,
        }}>
          {getGreeting()}{user ? `, ${user.email.split('@')[0]}` : ''}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          What do you want to listen to today?
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 12,
        }}>
          {quickActions.map((action) => (
            <motion.button
              key={action.label}
              onClick={() => setCurrentView(action.view)}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 12,
                padding: 20,
                borderRadius: 12,
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'var(--font-sans)',
                transition: 'border-color 200ms ease, box-shadow 200ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-hover)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: `${action.color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: action.color,
              }}>
                {action.icon}
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                  {action.label}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  {action.desc}
                </p>
              </div>
              <ArrowRight size={14} style={{ color: 'var(--text-tertiary)', marginTop: 'auto' }} />
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Keyboard shortcut hint */}
      <motion.div
        variants={item}
        style={{
          marginTop: 48,
          padding: '16px 20px',
          borderRadius: 10,
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <Search size={16} style={{ color: 'var(--text-tertiary)' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
          Click <strong style={{ color: 'var(--text-primary)' }}>Search</strong> in the sidebar to find music from YouTube&apos;s entire catalog.
        </p>
      </motion.div>
    </motion.div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

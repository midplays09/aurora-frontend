'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ListMusic, Plus, Trash2, Loader2 } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import api from '@/lib/api';
import type { Playlist } from '@/types';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { ease: [0.22, 1, 0.36, 1] as const, duration: 0.5 } },
};

export default function PlaylistsView() {
  const { setCurrentView, setCurrentPlaylistId } = usePlayerStore();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    setIsLoading(true);
    try {
      const data = await api.getPlaylists();
      setPlaylists(data || []);
    } catch { /* ignore */ }
    setIsLoading(false);
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      const pl = await api.createPlaylist(newName.trim());
      setPlaylists((prev) => [pl, ...prev]);
      setNewName('');
      setShowCreate(false);
    } catch { /* ignore */ }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deletePlaylist(id);
      setPlaylists((prev) => prev.filter((p) => p.id !== id));
    } catch { /* ignore */ }
  };

  const openPlaylist = (id: string) => {
    setCurrentPlaylistId(id);
    setCurrentView('playlist-detail');
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
        style={{ marginBottom: 24 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(59,130,246,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ListMusic size={18} style={{ color: '#3B82F6' }} />
            </div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 700, letterSpacing: 0 }}>Playlists</h1>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn btn-primary btn-sm">
            <Plus size={14} /> New Playlist
          </button>
        </div>
      </motion.div>

      {/* Create modal */}
      {showCreate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          style={{
            padding: 16, borderRadius: 10,
            border: '1px solid var(--border)', background: 'var(--surface)',
            marginBottom: 20, display: 'flex', gap: 10,
          }}
        >
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="Playlist name..."
            className="input"
            autoFocus
          />
          <button onClick={handleCreate} className="btn btn-primary" style={{ flexShrink: 0 }}>Create</button>
          <button onClick={() => { setShowCreate(false); setNewName(''); }} className="btn" style={{ flexShrink: 0 }}>Cancel</button>
        </motion.div>
      )}

      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--text-tertiary)' }} />
        </div>
      )}

      {!isLoading && playlists.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '60px 0' }}
        >
          <ListMusic size={40} style={{ color: 'var(--text-tertiary)', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>No playlists yet</p>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', marginTop: 4 }}>
            Create your first playlist to start organizing your music.
          </p>
        </motion.div>
      )}

      {!isLoading && playlists.length > 0 && (
        <motion.div
          variants={container} initial="hidden" animate="show"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}
        >
          {playlists.map((pl) => (
            <motion.div
              key={pl.id}
              variants={item}
              whileHover={{ y: -2 }}
              onClick={() => openPlaylist(pl.id)}
              className="card"
              style={{ padding: 20, cursor: 'pointer', position: 'relative' }}
            >
              {/* Playlist icon */}
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'var(--accent-subtle)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 14,
              }}>
                <ListMusic size={22} style={{ color: 'var(--accent)' }} />
              </div>
              <p style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: 4 }}>{pl.name}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                {pl.trackIds.length} {pl.trackIds.length === 1 ? 'track' : 'tracks'}
              </p>
              {/* Delete */}
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(pl.id); }}
                className="btn-icon"
                style={{ position: 'absolute', top: 12, right: 12, color: 'var(--text-tertiary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--error)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; }}
                title="Delete playlist"
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

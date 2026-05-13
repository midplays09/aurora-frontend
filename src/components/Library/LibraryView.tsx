'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FolderPlus, Library, ListFilter, Loader2, Pencil, Plus, Save,
  Tags, Trash2, X,
} from 'lucide-react';
import api from '@/lib/api';
import { formatDuration } from '@/lib/utils';
import type { Category, LibraryTrack } from '@/types';

const slide = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const } },
};

type TrackForm = {
  title: string;
  artist: string;
  album: string;
  duration: string;
  categoryId: string;
};

const emptyTrackForm: TrackForm = {
  title: '',
  artist: '',
  album: '',
  duration: '',
  categoryId: '',
};

export default function LibraryView() {
  const [tracks, setTracks] = useState<LibraryTrack[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [trackForm, setTrackForm] = useState<TrackForm>(emptyTrackForm);
  const [categoryName, setCategoryName] = useState('');
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadLibrary = useCallback(async () => {
    setIsLoading(true);
    try {
      const [trackData, categoryData] = await Promise.all([
        api.getTracks(selectedCategory || null),
        api.getCategories(),
      ]);
      setTracks(trackData || []);
      setCategories(categoryData || []);
    } catch {
      setTracks([]);
      setCategories([]);
    }
    setIsLoading(false);
  }, [selectedCategory]);

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  const categoryById = useMemo(() => {
    return categories.reduce<Record<string, string>>((acc, category) => {
      acc[category.id] = category.name;
      return acc;
    }, {});
  }, [categories]);

  const resetTrackForm = () => {
    setTrackForm(emptyTrackForm);
    setEditingTrackId(null);
  };

  const saveTrack = async () => {
    if (!trackForm.title.trim() || !trackForm.artist.trim()) return;
    setIsSaving(true);
    try {
      const payload = {
        title: trackForm.title.trim(),
        artist: trackForm.artist.trim(),
        album: trackForm.album.trim() || undefined,
        duration: Number(trackForm.duration || 0),
        categoryId: trackForm.categoryId || null,
      };

      if (editingTrackId) {
        const updated = await api.updateTrack(editingTrackId, payload);
        if (payload.categoryId !== undefined) {
          await api.assignTrackCategory(editingTrackId, payload.categoryId);
        }
        setTracks((prev) => prev.map((track) => (track.id === editingTrackId ? { ...track, ...updated, categoryId: payload.categoryId } : track)));
      } else {
        const created = await api.createTrack(payload);
        setTracks((prev) => [created, ...prev]);
      }
      resetTrackForm();
    } catch {
      // Keep form values in place so the user can retry.
    }
    setIsSaving(false);
  };

  const editTrack = (track: LibraryTrack) => {
    setEditingTrackId(track.id);
    setTrackForm({
      title: track.title,
      artist: track.artist,
      album: track.album || '',
      duration: String(Math.round(track.duration || 0)),
      categoryId: track.categoryId || '',
    });
  };

  const deleteTrack = async (id: string) => {
    try {
      await api.deleteTrack(id);
      setTracks((prev) => prev.filter((track) => track.id !== id));
      if (editingTrackId === id) resetTrackForm();
    } catch {
      // Ignore transient API failures.
    }
  };

  const saveCategory = async () => {
    if (!categoryName.trim()) return;
    setIsSaving(true);
    try {
      if (editingCategoryId) {
        const updated = await api.updateCategory(editingCategoryId, categoryName.trim());
        setCategories((prev) => prev.map((category) => (category.id === editingCategoryId ? updated : category)));
      } else {
        const created = await api.createCategory(categoryName.trim());
        setCategories((prev) => [created, ...prev]);
      }
      setCategoryName('');
      setEditingCategoryId(null);
    } catch {
      // Keep input intact for retry.
    }
    setIsSaving(false);
  };

  const deleteCategory = async (id: string) => {
    try {
      await api.deleteCategory(id);
      setCategories((prev) => prev.filter((category) => category.id !== id));
      setTracks((prev) => prev.map((track) => (track.categoryId === id ? { ...track, categoryId: null } : track)));
      if (selectedCategory === id) setSelectedCategory('');
      if (editingCategoryId === id) {
        setEditingCategoryId(null);
        setCategoryName('');
      }
    } catch {
      // Ignore transient API failures.
    }
  };

  return (
    <motion.div variants={slide} initial="hidden" animate="show" className="view-shell">
      <section className="section-hero compact">
        <div className="hero-kicker">
          <Library size={15} />
          Backend library
        </div>
        <div className="hero-row">
          <div>
            <h1>Your music system</h1>
            <p>Save personal tracks, organize them with backend categories, and keep the rest of Aurora discoverable.</p>
          </div>
          <div className="hero-stat-grid">
            <div><strong>{tracks.length}</strong><span>Tracks</span></div>
            <div><strong>{categories.length}</strong><span>Categories</span></div>
          </div>
        </div>
      </section>

      <div className="library-layout">
        <section className="panel-block">
          <div className="panel-title">
            <Library size={16} />
            <span>{editingTrackId ? 'Edit track' : 'Add track'}</span>
          </div>
          <div className="form-grid">
            <input className="input" value={trackForm.title} onChange={(e) => setTrackForm((s) => ({ ...s, title: e.target.value }))} placeholder="Track title" />
            <input className="input" value={trackForm.artist} onChange={(e) => setTrackForm((s) => ({ ...s, artist: e.target.value }))} placeholder="Artist" />
            <input className="input" value={trackForm.album} onChange={(e) => setTrackForm((s) => ({ ...s, album: e.target.value }))} placeholder="Album" />
            <input className="input" value={trackForm.duration} onChange={(e) => setTrackForm((s) => ({ ...s, duration: e.target.value }))} placeholder="Duration in seconds" inputMode="numeric" />
            <select className="input" value={trackForm.categoryId} onChange={(e) => setTrackForm((s) => ({ ...s, categoryId: e.target.value }))}>
              <option value="">No category</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            <div className="button-row">
              <button className="btn btn-primary" onClick={saveTrack} disabled={isSaving || !trackForm.title.trim() || !trackForm.artist.trim()}>
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {editingTrackId ? 'Save' : 'Add'}
              </button>
              {editingTrackId && (
                <button className="btn" onClick={resetTrackForm}>
                  <X size={14} />
                  Cancel
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="panel-block">
          <div className="panel-title">
            <Tags size={16} />
            <span>Categories</span>
          </div>
          <div className="category-editor">
            <input className="input" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveCategory()} placeholder="Category name" />
            <button className="btn btn-primary" onClick={saveCategory} disabled={isSaving || !categoryName.trim()}>
              {editingCategoryId ? <Save size={14} /> : <FolderPlus size={14} />}
            </button>
          </div>
          <div className="category-pills">
            <button className={`chip ${selectedCategory === '' ? 'active' : ''}`} onClick={() => setSelectedCategory('')}>
              <ListFilter size={13} />
              All
            </button>
            {categories.map((category) => (
              <span key={category.id} className={`chip editable ${selectedCategory === category.id ? 'active' : ''}`}>
                <button onClick={() => setSelectedCategory(category.id)}>{category.name}</button>
                <button onClick={() => { setEditingCategoryId(category.id); setCategoryName(category.name); }} title="Edit category"><Pencil size={12} /></button>
                <button onClick={() => deleteCategory(category.id)} title="Delete category"><Trash2 size={12} /></button>
              </span>
            ))}
          </div>
        </section>
      </div>

      <section className="track-table-wrap">
        <div className="table-head">
          <span>#</span>
          <span>Title</span>
          <span>Artist</span>
          <span>Album</span>
          <span>Category</span>
          <span>Time</span>
          <span />
        </div>
        {isLoading ? (
          <div className="empty-state"><Loader2 className="animate-spin" size={22} /></div>
        ) : tracks.length === 0 ? (
          <div className="empty-state">
            <Library size={30} />
            <p>No library tracks yet</p>
            <span>Add a track above to test the backend library endpoints.</span>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {tracks.map((track, index) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="track-row"
              >
                <span className="row-index">{index + 1}</span>
                <strong className="truncate">{track.title}</strong>
                <span className="truncate">{track.artist}</span>
                <span className="truncate">{track.album || 'Single'}</span>
                <span className="category-label">{track.categoryId ? categoryById[track.categoryId] || 'Unknown' : 'Unsorted'}</span>
                <span className="mono">{formatDuration(track.duration || 0)}</span>
                <span className="row-actions">
                  <button className="btn-icon" onClick={() => editTrack(track)} title="Edit track"><Pencil size={14} /></button>
                  <button className="btn-icon danger" onClick={() => deleteTrack(track.id)} title="Delete track"><Trash2 size={14} /></button>
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </section>
    </motion.div>
  );
}

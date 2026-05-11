'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import type { Category } from '@/types';

export default function CategoryView() {
  const { isAuthenticated } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadCategories();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadCategories = async () => {
    try {
      const cats = await api.getCategories();
      setCategories(cats);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    
    try {
      const cat = await api.createCategory(newCatName.trim());
      setCategories([...categories, cat]);
      setNewCatName('');
      setIsCreating(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? Tracks will not be deleted.')) return;
    try {
      await api.deleteCategory(id);
      setCategories(categories.filter(c => c.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto animate-fade-in">
        <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
          <svg className="w-10 h-10 text-[#24C8D8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
        </div>
        <h2 className="text-3xl font-display font-bold text-white mb-2">Cloud Categories</h2>
        <p className="text-white/60 mb-8">
          Sign in to organize your music into synced categories that follow you across all devices.
        </p>
        <button onClick={() => window.location.reload()} className="btn btn-primary px-8 py-3 rounded-full text-base">
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-4xl font-display font-bold text-white">Categories</h1>
          <p className="text-white/50 mt-2">Organize your music collection</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="btn btn-primary shadow-lg shadow-[#24C8D8]/20"
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          New Category
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="glass-panel p-6 mb-8 flex items-end space-x-4 animate-fade-in">
          <div className="flex-1">
            <label className="block text-sm font-medium text-white/80 mb-2">Category Name</label>
            <input
              autoFocus
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-white placeholder-white/30 focus:border-[#24C8D8] focus:outline-none transition-colors"
              placeholder="e.g. Chill Vibes, Work Focus, Gym..."
            />
          </div>
          <button type="submit" className="btn btn-primary px-6 py-2 h-[42px]">Save</button>
          <button type="button" onClick={() => setIsCreating(false)} className="btn px-6 py-2 h-[42px] border border-white/10 hover:bg-white/5">Cancel</button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#24C8D8] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-white/40 border-2 border-dashed border-white/10 rounded-2xl">
          <svg className="w-12 h-12 mb-4 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          <p>You haven't created any categories yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div key={cat.id} className="glass-panel p-6 group cursor-pointer hover:border-[#24C8D8]/50 hover:shadow-lg hover:shadow-[#24C8D8]/10 transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#24C8D8] to-purple-600 mb-4 flex items-center justify-center shadow-lg shadow-black/50">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#24C8D8] transition-colors">{cat.name}</h3>
              <p className="text-sm text-white/50 mb-4">View tracks →</p>
              
              <div className="flex items-center justify-end border-t border-white/5 pt-4">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(cat.id); }}
                  className="text-white/30 hover:text-red-500 transition-colors p-2"
                  title="Delete category"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

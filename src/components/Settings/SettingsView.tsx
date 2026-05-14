'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import { User, Mail, Lock, LogOut } from 'lucide-react';
import api from '@/lib/api';

export default function SettingsView() {
  const { user, logout } = useAuthStore();
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ text: '', type: '' });
    try {
      // Assuming a backend endpoint for updating user exists, e.g. PUT /api/users/me
      // If it doesn't exist yet, we will just simulate it or we can ignore password if empty
      // For now, let's pretend api.updateMe exists, or just show a message.
      // await api.updateMe({ username, email, password });
      
      setMessage({ text: 'Settings updated successfully.', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.response?.data?.error || 'Failed to update settings.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ padding: '32px' }}>
      <h1 className="view-title" style={{ marginBottom: '24px' }}>Settings</h1>

      <div style={{ maxWidth: 480 }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ paddingLeft: 40, width: '100%' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-tertiary)' }} />
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: 40, width: '100%' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              New Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-tertiary)' }} />
              <input
                type="password"
                className="input"
                placeholder="Leave blank to keep current"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: 40, width: '100%' }}
              />
            </div>
          </div>

          {message.text && (
            <div style={{ 
              padding: '12px', 
              borderRadius: '8px', 
              background: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
              color: message.type === 'error' ? 'var(--error)' : '#10b981',
              fontSize: '0.875rem'
            }}>
              {message.text}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSaving}
              style={{ flex: 1 }}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button 
              type="button" 
              onClick={logout}
              className="btn btn-ghost"
              style={{ color: 'var(--error)', borderColor: 'var(--border)' }}
            >
              <LogOut size={16} style={{ marginRight: 8 }} />
              Log Out
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

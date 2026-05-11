'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { isElectron } from '@/lib/utils';
import BackgroundEffects from '../UI/BackgroundEffects';
import TopBar from '../UI/TopBar';

interface LoginFormProps {
  onContinueOffline: () => void;
}

export default function LoginForm({ onContinueOffline }: LoginFormProps) {
  const { login, register, isLoading, error, clearError } = useAuthStore();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccessMsg('');

    if (isRegistering) {
      const success = await register(email, password);
      if (success) {
        setSuccessMsg('Account created! Please log in.');
        setIsRegistering(false);
        setPassword('');
      }
    } else {
      const success = await login(email, password);
      if (success && isElectron()) {
        // Save token in Electron config
        const { token } = useAuthStore.getState();
        const config = await window.electronAPI?.readConfig() || {};
        await window.electronAPI?.writeConfig({ ...config, authToken: token });
      } else if (success) {
        // Web fallback
        const { token } = useAuthStore.getState();
        if (token) localStorage.setItem('aurora_token', token);
      }
    }
  };

  return (
    <div className="relative flex h-screen w-screen items-center justify-center bg-[#0d0d0f] text-white">
      <BackgroundEffects />
      <TopBar />

      <div className="glass-panel z-10 w-full max-w-md p-8 animate-fade-in">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold font-display">
            {isRegistering ? 'Create Account' : 'Welcome to Aurora'}
          </h1>
          <p className="mt-2 text-white/60">
            {isRegistering 
              ? 'Join to sync your library across devices' 
              : 'Sign in to access your synced library'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder-white/30 focus:border-[#24C8D8] focus:outline-none focus:ring-1 focus:ring-[#24C8D8] transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder-white/30 focus:border-[#24C8D8] focus:outline-none focus:ring-1 focus:ring-[#24C8D8] transition-colors"
              placeholder="••••••••"
            />
            {isRegistering && (
              <p className="text-xs text-white/40 mt-1">
                Must be at least 8 characters, with 1 uppercase, 1 lowercase, and 1 number.
              </p>
            )}
          </div>

          {error && <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg">{error}</div>}
          {successMsg && <div className="text-emerald-400 text-sm bg-emerald-400/10 p-3 rounded-lg">{successMsg}</div>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn btn-primary py-3 text-base mt-4"
          >
            {isLoading ? 'Loading...' : (isRegistering ? 'Register' : 'Sign In')}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center space-y-4">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              clearError();
              setSuccessMsg('');
            }}
            className="text-sm text-[#24C8D8] hover:underline"
          >
            {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Register"}
          </button>

          <div className="w-full flex items-center">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="px-3 text-xs text-white/40 uppercase">OR</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          <button
            onClick={onContinueOffline}
            className="w-full btn py-3 text-base"
          >
            Continue Offline
          </button>
        </div>
      </div>
    </div>
  );
}

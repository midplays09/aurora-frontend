import { create } from 'zustand';
import api from '@/lib/api';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  restoreSession: (token: string) => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.login(email, password);
      if (data.token) {
        api.setToken(data.token);
        localStorage.setItem('aurora_token', data.token);
        try {
          const me = await api.getMe();
          set({
            user: me.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          set({
            user: { id: '', email, roles: ['ROLE_USER'], createdAt: '' },
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
        }
        return true;
      }
      set({ error: 'Login failed.', isLoading: false });
      return false;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string; message?: string } } };
      const msg = error.response?.data?.error || error.response?.data?.message || 'Login failed.';
      set({ error: msg, isLoading: false });
      return false;
    }
  },

  register: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      await api.register(email, password);
      set({ isLoading: false });
      return true;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      const msg = error.response?.data?.error || 'Registration failed.';
      set({ error: msg, isLoading: false });
      return false;
    }
  },

  logout: () => {
    api.setToken(null);
    localStorage.removeItem('aurora_token');
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  restoreSession: async (token) => {
    api.setToken(token);
    try {
      const me = await api.getMe();
      set({ user: me.user, token, isAuthenticated: true });
      return true;
    } catch {
      api.setToken(null);
      localStorage.removeItem('aurora_token');
      set({ token: null, isAuthenticated: false });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));

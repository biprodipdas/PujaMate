'use client';

import { create } from 'zustand';
import { api } from '@/lib/api';

const TOKEN_KEY = 'pujamate_token';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  loading: false,
  hydrated: false,
  error: null,

  hydrate: async () => {
    if (typeof window === 'undefined') return;
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (!token) {
      set({ hydrated: true });
      return;
    }

    set({ token, loading: true, error: null });
    try {
      const data = await api.getCurrentUser();
      set({ user: data.user, loading: false, hydrated: true });
    } catch {
      window.localStorage.removeItem(TOKEN_KEY);
      set({ user: null, token: null, loading: false, hydrated: true });
    }
  },

  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const data = await api.register(name, email, password);
      window.localStorage.setItem(TOKEN_KEY, data.token);
      set({ user: data.user, token: data.token, loading: false, hydrated: true });
      return data;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const data = await api.login(email, password);
      window.localStorage.setItem(TOKEN_KEY, data.token);
      set({ user: data.user, token: data.token, loading: false, hydrated: true });
      return data;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') window.localStorage.removeItem(TOKEN_KEY);
    set({ user: null, token: null, error: null });
  },
}));
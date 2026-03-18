import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PosRole } from '../types';

export type KDSTab = 'active' | 'scheduled' | 'ready-done' | 'cancelled';
export type ViewMode = 'list' | 'card';
export type Theme = 'light' | 'dark';

interface SessionState {
  restaurantCode: string | null;
  restaurantName: string;
  role: PosRole;
  staffName: string;
  theme: Theme;
  activeTab: KDSTab;
  viewMode: ViewMode;
  login: (code: string, name: string, role?: PosRole, staffName?: string) => void;
  logout: () => void;
  setTheme: (theme: Theme) => void;
  setActiveTab: (tab: KDSTab) => void;
  setViewMode: (mode: ViewMode) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      restaurantCode: null,
      restaurantName: '',
      role: 'owner' as PosRole,
      staffName: '',
      theme: 'dark' as Theme,
      activeTab: 'active',
      viewMode: 'list',   // 기본값: list view
      login: (code, name, role = 'owner', staffName = '') =>
        set({ restaurantCode: code, restaurantName: name, role, staffName }),
      logout: () =>
        set({ restaurantCode: null, restaurantName: '', role: 'owner', staffName: '' }),
      setTheme: (theme) => set({ theme }),
      setActiveTab: (activeTab) => set({ activeTab }),
      setViewMode: (viewMode) => set({ viewMode }),
    }),
    {
      name: 'kds-session',
      partialize: (state) => ({
        restaurantCode: state.restaurantCode,
        restaurantName: state.restaurantName,
        role: state.role,
        staffName: state.staffName,
        theme: state.theme,
        activeTab: state.activeTab,
        viewMode: state.viewMode,
      }),
    }
  )
);

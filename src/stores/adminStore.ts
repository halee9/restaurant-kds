import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RestaurantConfig } from '../types';

export type AdminTheme = 'light' | 'dark';

interface AdminState {
  restaurantCode: string | null;
  restaurantName: string;
  config: RestaurantConfig | null;
  pin: string;
  isAuthenticated: boolean;
  theme: AdminTheme;
  login: (config: RestaurantConfig, pin: string) => void;
  logout: () => void;
  updateConfig: (config: RestaurantConfig) => void;
  setTheme: (theme: AdminTheme) => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      restaurantCode: null,
      restaurantName: '',
      config: null,
      pin: '',
      isAuthenticated: false,
      theme: 'light' as AdminTheme,
      login: (config, pin) =>
        set({
          restaurantCode: config.restaurant_code,
          restaurantName: config.name,
          config,
          pin,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          restaurantCode: null,
          restaurantName: '',
          config: null,
          pin: '',
          isAuthenticated: false,
        }),
      updateConfig: (config) =>
        set({ config, restaurantName: config.name }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'admin-session',
      partialize: (state) => ({
        restaurantCode: state.restaurantCode,
        restaurantName: state.restaurantName,
        config: state.config,
        pin: state.pin,
        isAuthenticated: state.isAuthenticated,
        theme: state.theme,
      }),
    }
  )
);

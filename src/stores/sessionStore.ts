import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SessionState {
  restaurantCode: string | null;
  restaurantName: string;
  login: (code: string, name: string) => void;
  logout: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      restaurantCode: null,
      restaurantName: '',
      login: (code, name) => set({ restaurantCode: code, restaurantName: name }),
      logout: () => set({ restaurantCode: null, restaurantName: '' }),
    }),
    {
      name: 'kds-session',
      // restaurantCode, restaurantName만 localStorage에 저장
      partialize: (state) => ({
        restaurantCode: state.restaurantCode,
        restaurantName: state.restaurantName,
      }),
    }
  )
);

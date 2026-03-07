import { create } from 'zustand';
import type { KDSOrder, OrderStatus, MenuDisplayConfig } from '../types';

type FilterType = 'ALL' | 'OPEN' | 'IN_PROGRESS' | 'READY' | 'COMPLETED';

const ACTIVATION_KEY = 'kds_activation_minutes';
const DEFAULT_ACTIVATION = 20;
const SEP_KEY = 'kds_section_separation';
const AUTO_START_KEY = 'kds_auto_start';
const SPLIT_PCT_KEY = 'kds_instore_split_pct';
const DEFAULT_SPLIT_PCT = 40;

interface KDSState {
  // 상태
  orders: KDSOrder[];
  filter: FilterType;
  connected: boolean;
  printOrder: KDSOrder | null;
  menuDisplayConfig: MenuDisplayConfig;

  // KDS 설정 (localStorage 영속화)
  scheduledActivationMinutes: number;
  sectionSeparation: boolean;
  autoStartOrders: boolean;
  inStoreSplitPct: number;  // IN-STORE 섹션 높이 % (기본 40)

  // 주문 액션
  setOrders: (orders: KDSOrder[]) => void;
  addOrder: (order: KDSOrder) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  cancelOrder: (id: string) => void;

  // UI 액션
  setFilter: (filter: FilterType) => void;
  setConnected: (connected: boolean) => void;
  setPrintOrder: (order: KDSOrder | null) => void;
  setMenuDisplayConfig: (config: MenuDisplayConfig) => void;
  setScheduledActivationMinutes: (minutes: number) => void;
  setSectionSeparation: (v: boolean) => void;
  setAutoStartOrders: (v: boolean) => void;
  setInStoreSplitPct: (pct: number) => void;

  // 파생 상태
  filteredOrders: () => KDSOrder[];
  orderCounts: () => { open: number; inProgress: number; ready: number; completed: number };
}

export const useKDSStore = create<KDSState>()((set, get) => ({
  orders: [],
  filter: 'ALL',
  connected: false,
  printOrder: null,
  menuDisplayConfig: { menuItems: [], modifiers: [] },
  scheduledActivationMinutes: parseInt(localStorage.getItem(ACTIVATION_KEY) ?? String(DEFAULT_ACTIVATION)),
  sectionSeparation: localStorage.getItem(SEP_KEY) !== 'false',
  autoStartOrders: localStorage.getItem(AUTO_START_KEY) !== 'false',
  inStoreSplitPct: parseInt(localStorage.getItem(SPLIT_PCT_KEY) ?? String(DEFAULT_SPLIT_PCT)),

  setOrders: (orders) => set({ orders }),

  addOrder: (order) =>
    set((state) => {
      if (state.orders.find((o) => o.id === order.id)) return state; // 중복 방지
      return { orders: [order, ...state.orders] };
    }),

  updateOrderStatus: (id, status) =>
    set((state) => ({
      orders: state.orders.map((o) => {
        if (o.id !== id) return o;
        const now = new Date().toISOString();
        return {
          ...o,
          status,
          updatedAt: now,
          // IN_PROGRESS 전환 시마다 startedAt 갱신 (재시작 포함)
          ...(status === 'IN_PROGRESS' ? { startedAt: now } : {}),
        };
      }),
    })),

  cancelOrder: (id) =>
    set((state) => ({
      orders: state.orders.filter((o) => o.id !== id),
    })),

  setFilter: (filter) => set({ filter }),
  setConnected: (connected) => set({ connected }),
  setPrintOrder: (printOrder) => set({ printOrder }),
  setMenuDisplayConfig: (menuDisplayConfig) => set({ menuDisplayConfig }),

  setScheduledActivationMinutes: (minutes) => {
    localStorage.setItem(ACTIVATION_KEY, String(minutes));
    set({ scheduledActivationMinutes: minutes });
  },

  setSectionSeparation: (v) => {
    localStorage.setItem(SEP_KEY, String(v));
    set({ sectionSeparation: v });
  },

  setAutoStartOrders: (v) => {
    localStorage.setItem(AUTO_START_KEY, String(v));
    set({ autoStartOrders: v });
  },

  setInStoreSplitPct: (pct) => {
    const clamped = Math.round(Math.max(10, Math.min(90, pct)));
    localStorage.setItem(SPLIT_PCT_KEY, String(clamped));
    set({ inStoreSplitPct: clamped });
  },

  filteredOrders: () => {
    const { orders, filter } = get();
    return filter === 'ALL' ? orders : orders.filter((o) => o.status === filter);
  },

  orderCounts: () => {
    const { orders } = get();
    return {
      open: orders.filter((o) => o.status === 'OPEN').length,
      inProgress: orders.filter((o) => o.status === 'IN_PROGRESS').length,
      ready: orders.filter((o) => o.status === 'READY').length,
      completed: orders.filter((o) => o.status === 'COMPLETED').length,
    };
  },
}));

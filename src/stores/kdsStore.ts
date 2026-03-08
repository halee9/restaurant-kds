import { create } from 'zustand';
import type { KDSOrder, OrderStatus, MenuDisplayConfig } from '../types';

type FilterType = 'ALL' | 'OPEN' | 'IN_PROGRESS' | 'READY' | 'COMPLETED';

const ACTIVATION_KEY = 'kds_activation_minutes';
const DEFAULT_ACTIVATION = 20;
const SEP_KEY = 'kds_section_separation';
const AUTO_START_KEY = 'kds_auto_start';
const AUTO_PRINT_KEY = 'kds_auto_print';
const SPLIT_PCT_KEY = 'kds_instore_split_pct';
const DEFAULT_SPLIT_PCT = 40;

// 긴급도 임계값 (분)
const URGENCY_YELLOW_KEY = 'kds_urgency_yellow';
const URGENCY_ORANGE_KEY = 'kds_urgency_orange';
const URGENCY_RED_KEY    = 'kds_urgency_red';
const DEFAULT_URGENCY_YELLOW = 5;
const DEFAULT_URGENCY_ORANGE = 10;
const DEFAULT_URGENCY_RED    = 15;

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
  autoPrint: boolean;       // IN_PROGRESS 전환 시 자동 프린트 (기본 true)
  inStoreSplitPct: number;  // IN-STORE 섹션 높이 % (기본 40)

  // 긴급도 색상 임계값 (분)
  urgencyYellowMin: number;  // 기본 5분
  urgencyOrangeMin: number;  // 기본 10분
  urgencyRedMin: number;     // 기본 15분

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
  setAutoPrint: (v: boolean) => void;
  setInStoreSplitPct: (pct: number) => void;
  setUrgencyYellowMin: (v: number) => void;
  setUrgencyOrangeMin: (v: number) => void;
  setUrgencyRedMin: (v: number) => void;

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
  autoPrint: localStorage.getItem(AUTO_PRINT_KEY) === 'true',
  inStoreSplitPct: parseInt(localStorage.getItem(SPLIT_PCT_KEY) ?? String(DEFAULT_SPLIT_PCT)),
  urgencyYellowMin: parseInt(localStorage.getItem(URGENCY_YELLOW_KEY) ?? String(DEFAULT_URGENCY_YELLOW)),
  urgencyOrangeMin: parseInt(localStorage.getItem(URGENCY_ORANGE_KEY) ?? String(DEFAULT_URGENCY_ORANGE)),
  urgencyRedMin:    parseInt(localStorage.getItem(URGENCY_RED_KEY)    ?? String(DEFAULT_URGENCY_RED)),

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
          // 각 상태에 처음 도달한 시각만 기록 — 백워드 전환 시 덮어쓰지 않음
          ...(status === 'IN_PROGRESS' && !o.startedAt ? { startedAt: now } : {}),
          ...(status === 'READY' && !o.readyAt ? { readyAt: now } : {}),
          ...(status === 'COMPLETED' && !o.completedAt ? { completedAt: now } : {}),
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

  setAutoPrint: (v) => {
    localStorage.setItem(AUTO_PRINT_KEY, String(v));
    set({ autoPrint: v });
  },

  setInStoreSplitPct: (pct) => {
    const clamped = Math.round(Math.max(10, Math.min(90, pct)));
    localStorage.setItem(SPLIT_PCT_KEY, String(clamped));
    set({ inStoreSplitPct: clamped });
  },

  setUrgencyYellowMin: (v) => {
    localStorage.setItem(URGENCY_YELLOW_KEY, String(v));
    set({ urgencyYellowMin: v });
  },
  setUrgencyOrangeMin: (v) => {
    localStorage.setItem(URGENCY_ORANGE_KEY, String(v));
    set({ urgencyOrangeMin: v });
  },
  setUrgencyRedMin: (v) => {
    localStorage.setItem(URGENCY_RED_KEY, String(v));
    set({ urgencyRedMin: v });
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

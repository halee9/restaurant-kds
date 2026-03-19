import { useEffect, useRef } from 'react';
import { useKDSStore } from '../stores/kdsStore';
import { useSessionStore } from '../stores/sessionStore';
import { nowTimeStr } from '../utils/timezone';

/**
 * 고객용 주문 추적 디스플레이 (풀스크린)
 * 대형 모니터에 표시 — 사이드바 없이 독립 레이아웃
 *
 * Socket.io 연결은 AppShell에서 관리하므로 여기서는 store만 읽음
 */
export default function DisplayScreen() {
  const restaurantCode = useSessionStore((s) => s.restaurantCode);
  const restaurantName = useSessionStore((s) => s.restaurantName);
  const orders = useKDSStore((s) => s.orders);
  const connected = useKDSStore((s) => s.connected);
  const prevReadyRef = useRef<Set<string>>(new Set());

  // Ready 상태 전환 시 알림음
  useEffect(() => {
    const currentReady = new Set(orders.filter((o) => o.status === 'READY').map((o) => o.id));
    const newReady = [...currentReady].filter((id) => !prevReadyRef.current.has(id));
    if (newReady.length > 0) {
      try { new Audio('/notification.mp3').play(); } catch (_) {}
    }
    prevReadyRef.current = currentReady;
  }, [orders]);

  // 시계
  useEffect(() => {
    const el = document.getElementById('display-clock');
    if (!el) return;
    const tick = () => {
      el.textContent = nowTimeStr({ hour: 'numeric', minute: '2-digit', second: undefined });
    };
    tick();
    const id = setInterval(tick, 10_000);
    return () => clearInterval(id);
  }, []);

  if (!restaurantCode) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <p className="text-xl">Please log in from POS first</p>
      </div>
    );
  }

  const preparing = orders.filter((o) => o.status === 'IN_PROGRESS');
  const ready = orders.filter((o) => o.status === 'READY');
  const completed = orders
    .filter((o) => o.status === 'COMPLETED')
    .sort((a, b) => new Date(b.completedAt ?? b.updatedAt).getTime() - new Date(a.completedAt ?? a.updatedAt).getTime())
    .slice(0, 6);

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white overflow-hidden select-none">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-gray-800/60">
        <h1 className="text-3xl font-bold tracking-wide">{restaurantName || 'Order Status'}</h1>
        <div className="flex items-center gap-4">
          <span id="display-clock" className="text-2xl font-medium text-gray-300 tabular-nums" />
          <span className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
        </div>
      </header>

      {/* ── 3-column grid ──────────────────────────────────────── */}
      <div className="flex-1 grid grid-cols-3 min-h-0">

        {/* Preparing */}
        <section className="flex flex-col border-r border-gray-800/40">
          <div className="px-6 py-4 bg-amber-500/10 border-b border-gray-800/40">
            <h2 className="text-xl font-bold text-amber-400 text-center tracking-wide">
              🔥 Preparing
            </h2>
          </div>
          <div className="flex-1 overflow-auto p-5 space-y-3">
            {preparing.length === 0 ? (
              <p className="text-center text-gray-700 mt-12 text-lg">—</p>
            ) : (
              preparing.map((o) => (
                <div key={o.id} className="bg-gray-900/80 rounded-xl px-5 py-4 text-center border border-gray-800/40">
                  <span className="text-5xl font-extrabold text-amber-300 tabular-nums">
                    #{o.displayId}
                  </span>
                  {o.displayName && (
                    <p className="text-lg text-gray-400 mt-1 truncate">{o.displayName}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Ready for Pickup */}
        <section className="flex flex-col border-r border-gray-800/40">
          <div className="px-6 py-4 bg-emerald-500/10 border-b border-gray-800/40">
            <h2 className="text-xl font-bold text-emerald-400 text-center tracking-wide">
              ✅ Ready for Pickup
            </h2>
          </div>
          <div className="flex-1 overflow-auto p-5 space-y-4">
            {ready.length === 0 ? (
              <p className="text-center text-gray-700 mt-12 text-lg">—</p>
            ) : (
              ready.map((o) => (
                <div
                  key={o.id}
                  className="bg-emerald-900/25 border-2 border-emerald-500/60 rounded-xl px-5 py-5 text-center animate-ready-pulse"
                >
                  <span className="text-6xl font-extrabold text-emerald-300 tabular-nums">
                    #{o.displayId}
                  </span>
                  {o.displayName && (
                    <p className="text-xl text-emerald-200 mt-2 font-semibold truncate">{o.displayName}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Picked Up (completed) */}
        <section className="flex flex-col">
          <div className="px-6 py-4 bg-gray-800/30 border-b border-gray-800/40">
            <h2 className="text-xl font-bold text-gray-500 text-center tracking-wide">
              Picked Up
            </h2>
          </div>
          <div className="flex-1 overflow-auto p-5 space-y-3">
            {completed.length === 0 ? (
              <p className="text-center text-gray-700 mt-12 text-lg">—</p>
            ) : (
              completed.map((o) => (
                <div key={o.id} className="bg-gray-900/40 rounded-xl px-5 py-3 text-center opacity-40">
                  <span className="text-3xl font-bold text-gray-500 tabular-nums">
                    #{o.displayId}
                  </span>
                  {o.displayName && (
                    <p className="text-sm text-gray-600 mt-1 truncate">{o.displayName}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

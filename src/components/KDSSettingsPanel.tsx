import { X, Volume2, VolumeX, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { useKDSStore } from '../stores/kdsStore';
import { useSessionStore } from '../stores/sessionStore';
import { playTestSound } from '../utils/sounds';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

// 긴급도 단계 표시용
const URGENCY_ROWS = [
  { dot: 'bg-green-500',  label: 'Normal',   desc: '0 min (always)',          editable: false },
  { dot: 'bg-yellow-400', label: 'Warning',  desc: '',                         editable: true,  key: 'yellow' as const },
  { dot: 'bg-orange-400', label: 'Alert',    desc: '',                         editable: true,  key: 'orange' as const },
  { dot: 'bg-red-500',    label: 'Critical', desc: '+ pulsing animation',      editable: true,  key: 'red'    as const },
] as const;

interface Props {
  open: boolean;
  onClose: () => void;
}

function Toggle({ checked, onChange, 'aria-label': ariaLabel }: { checked: boolean; onChange: () => void; 'aria-label'?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
        checked ? 'bg-primary' : 'bg-muted'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export default function KDSSettingsPanel({ open, onClose }: Props) {
  const {
    scheduledActivationMinutes, setScheduledActivationMinutes,
    autoStartOrders, setAutoStartOrders,
    autoPrint, setAutoPrint,
    soundEnabled, setSoundEnabled,
    soundVolume, setSoundVolume,
    urgencyYellowMin, setUrgencyYellowMin,
    urgencyOrangeMin, setUrgencyOrangeMin,
    urgencyRedMin,    setUrgencyRedMin,
    readySortOrder, setReadySortOrder,
  } = useKDSStore();

  const { restaurantCode, pin, theme, setTheme } = useSessionStore();
  const [activationInput, setActivationInput] = useState(String(scheduledActivationMinutes));

  // 긴급도 임계값 로컬 입력 상태
  const [urgencyInputs, setUrgencyInputs] = useState({
    yellow: String(urgencyYellowMin),
    orange: String(urgencyOrangeMin),
    red:    String(urgencyRedMin),
  });

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Slide panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-72 bg-card border-l border-border flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="font-bold text-base">POS Settings</span>
          <button
            onClick={onClose}
            className="opacity-50 hover:opacity-100 transition-opacity"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Settings items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-5">

          {/* Theme toggle */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {theme === 'dark' ? <Moon className="h-4 w-4 text-muted-foreground" /> : <Sun className="h-4 w-4 text-muted-foreground" />}
              <div>
                <p className="text-sm font-semibold">Theme</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {theme === 'dark' ? 'Dark mode' : 'Light mode'}
                </p>
              </div>
            </div>
            <Toggle
              checked={theme === 'dark'}
              onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Theme"
            />
          </div>

          <div className="h-px bg-border/60" />

          {/* Scheduled order activation */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold">Scheduled Order Activation</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={5}
                max={120}
                value={activationInput}
                onChange={(e) => setActivationInput(e.target.value)}
                className="w-20 bg-background border border-border rounded px-2 py-1 text-sm text-center tabular-nums"
              />
              <span className="text-sm text-muted-foreground">min before</span>
              <button
                className="ml-auto text-xs px-2 py-1 rounded bg-primary text-primary-foreground font-semibold hover:opacity-80 transition-opacity"
                onClick={async () => {
                  const v = parseInt(activationInput, 10);
                  if (isNaN(v) || v < 5 || v > 120) return;
                  setScheduledActivationMinutes(v);
                  // 서버에도 저장 (모든 KDS 동기화)
                  if (restaurantCode) {
                    try {
                      await fetch(`${SERVER_URL}/api/admin/${restaurantCode}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ pin, settings: { scheduled_activation_minutes: v } }),
                      });
                    } catch {}
                  }
                }}
              >
                Apply
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Show scheduled orders N minutes before pickup time. (Default: 10 min)
            </p>
          </div>

          <div className="h-px bg-border/60" />

          {/* Auto-start orders */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Auto-Start Orders</p>
              <p className="text-xs text-muted-foreground mt-0.5">Move new orders to IN PROGRESS immediately</p>
            </div>
            <Toggle checked={autoStartOrders} onChange={() => setAutoStartOrders(!autoStartOrders)} />
          </div>

          <div className="h-px bg-border/60" />

          {/* Ready tab sort order */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Ready List Order</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {readySortOrder === 'asc' ? 'Oldest ready first' : 'Newest ready first'}
              </p>
            </div>
            <Toggle
              checked={readySortOrder === 'desc'}
              onChange={() => setReadySortOrder(readySortOrder === 'asc' ? 'desc' : 'asc')}
              aria-label="Ready list order"
            />
          </div>

          <div className="h-px bg-border/60" />

          {/* Auto-print */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Auto Print</p>
              <p className="text-xs text-muted-foreground mt-0.5">Print order ticket when order starts</p>
            </div>
            <Toggle checked={autoPrint} onChange={() => setAutoPrint(!autoPrint)} />
          </div>

          <div className="h-px bg-border/60" />

          {/* Sound */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {soundEnabled ? <Volume2 className="h-4 w-4 text-muted-foreground" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
                <div>
                  <p className="text-sm font-semibold">Order Sound</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Play sound when new order arrives</p>
                </div>
              </div>
              <Toggle checked={soundEnabled} onChange={() => setSoundEnabled(!soundEnabled)} />
            </div>

            {soundEnabled && (
              <>
                {/* Volume slider */}
                <div className="flex items-center gap-2">
                  <VolumeX className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={soundVolume}
                    onChange={(e) => setSoundVolume(parseInt(e.target.value))}
                    className="flex-1 h-1.5 accent-primary cursor-pointer"
                  />
                  <Volume2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-xs text-muted-foreground tabular-nums w-8 text-right">{soundVolume}%</span>
                </div>

                {/* Test buttons */}
                <div className="flex gap-2">
                  <button
                    className="text-xs px-2.5 py-1 rounded bg-primary/20 text-primary font-medium hover:bg-primary/30 transition-colors"
                    onClick={() => playTestSound('default', soundVolume / 100)}
                  >
                    ▶ Default
                  </button>
                  <button
                    className="text-xs px-2.5 py-1 rounded bg-orange-500/20 text-orange-400 font-medium hover:bg-orange-500/30 transition-colors"
                    onClick={() => playTestSound('delivery', soundVolume / 100)}
                  >
                    ▶ Delivery
                  </button>
                </div>
                <p className="text-xs text-muted-foreground -mt-1">
                  Delivery orders (DoorDash, Uber, Grubhub) use a different alert sound
                </p>
              </>
            )}
          </div>

          <div className="h-px bg-border/60" />

          {/* Urgency Color Thresholds */}
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-sm font-semibold">Order Urgency Colors</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Color changes when cooking time exceeds threshold
              </p>
            </div>

            {/* 컬러 테이블 */}
            <div className="flex flex-col gap-1.5">
              {URGENCY_ROWS.map((row) => (
                <div key={row.label} className="flex items-center gap-2 text-sm">
                  {/* 색상 도트 */}
                  <span className={`w-3 h-3 rounded-full shrink-0 ${row.dot}`} />
                  {/* 라벨 */}
                  <span className="w-16 font-semibold shrink-0">{row.label}</span>
                  {/* 입력 or 고정 */}
                  {row.editable ? (
                    <>
                      <input
                        type="number"
                        min={1}
                        max={999}
                        value={urgencyInputs[row.key]}
                        onChange={(e) =>
                          setUrgencyInputs((prev) => ({ ...prev, [row.key]: e.target.value }))
                        }
                        className="w-14 bg-background border border-border rounded px-2 py-0.5 text-sm text-center tabular-nums"
                      />
                      <span className="text-xs text-muted-foreground">min</span>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">{row.desc}</span>
                  )}
                </div>
              ))}
            </div>

            <button
              className="self-start text-xs px-3 py-1 rounded bg-primary text-primary-foreground font-semibold hover:opacity-80 transition-opacity"
              onClick={() => {
                const y = parseInt(urgencyInputs.yellow, 10);
                const o = parseInt(urgencyInputs.orange, 10);
                const r = parseInt(urgencyInputs.red,    10);
                if (isNaN(y) || isNaN(o) || isNaN(r)) return;
                if (y < 1 || o <= y || r <= o) return; // 순서 검증
                setUrgencyYellowMin(y);
                setUrgencyOrangeMin(o);
                setUrgencyRedMin(r);
              }}
            >
              Apply
            </button>
            <p className="text-xs text-muted-foreground -mt-1">
              Values must be in ascending order (e.g. 5 → 10 → 15)
            </p>
          </div>

        </div>
      </div>
    </>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { useSessionStore } from '../stores/sessionStore';
import { useKDSStore } from '../stores/kdsStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import {
  Banknote, ChevronLeft, ChevronRight, Save, RefreshCw,
  TrendingUp, TrendingDown, Minus, History,
} from 'lucide-react';
import { formatMoney } from '../utils';
import { todayStr as tzTodayStr, formatDateDisplay } from '../utils/timezone';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

// ─── 타입 ────────────────────────────────────────────────────────────────────
interface HistoryEntry {
  date: string;
  cash_sales_total: number;
  counted_total: number;
  variance: number;
}

const BILLS = [
  { key: 'bills_100', label: '$100', value: 10000 },
  { key: 'bills_50',  label: '$50',  value: 5000 },
  { key: 'bills_20',  label: '$20',  value: 2000 },
  { key: 'bills_10',  label: '$10',  value: 1000 },
  { key: 'bills_5',   label: '$5',   value: 500 },
  { key: 'bills_1',   label: '$1',   value: 100 },
] as const;

const COINS = [
  { key: 'coins_quarters', label: '25\u00A2', value: 25 },
  { key: 'coins_dimes',    label: '10\u00A2', value: 10 },
  { key: 'coins_nickels',  label: '5\u00A2',  value: 5 },
  { key: 'coins_pennies',  label: '1\u00A2',  value: 1 },
] as const;

type BillKey = typeof BILLS[number]['key'];
type CoinKey = typeof COINS[number]['key'];
type DenomKey = BillKey | CoinKey;

function todayStr() {
  return tzTodayStr();
}

function formatDate(dateStr: string) {
  return formatDateDisplay(dateStr, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('en-CA');
}

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────────
export default function CashManagementScreen() {
  const restaurantCode = useSessionStore((s) => s.restaurantCode)!;
  const pendingPaymentCount = useKDSStore((s) => s.orderCounts)().pendingPayment;

  const [date, setDate] = useState(todayStr);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [enableCoinCounting, setEnableCoinCounting] = useState(false);

  // Cash sales total from server
  const [cashSalesTotal, setCashSalesTotal] = useState(0);

  // Denomination counts
  const [denoms, setDenoms] = useState<Record<DenomKey, number>>({
    bills_100: 0, bills_50: 0, bills_20: 0,
    bills_10: 0, bills_5: 0, bills_1: 0,
    coins_quarters: 0, coins_dimes: 0,
    coins_nickels: 0, coins_pennies: 0,
  });

  // Owner deposit/withdraw + note
  const [ownerDeposit, setOwnerDeposit] = useState(0);
  const [ownerWithdraw, setOwnerWithdraw] = useState(0);
  const [note, setNote] = useState('');

  // History
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Calculate counted total
  const billsTotal = BILLS.reduce((sum, b) => sum + denoms[b.key] * b.value, 0);
  const coinsTotal = enableCoinCounting
    ? COINS.reduce((sum, c) => sum + denoms[c.key] * c.value, 0)
    : 0;
  const countedTotal = billsTotal + coinsTotal;

  // Expected = cash_sales + deposit - withdraw
  const expectedTotal = cashSalesTotal + ownerDeposit - ownerWithdraw;
  const variance = countedTotal - expectedTotal;

  // ── Fetch data ──
  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    const code = restaurantCode.toLowerCase();

    try {
      // Fetch daily cash, sales total, history, and restaurant config in parallel
      const [dailyRes, salesRes, historyRes, configRes] = await Promise.all([
        fetch(`${SERVER_URL}/api/cash/${code}/daily/${date}`),
        fetch(`${SERVER_URL}/api/cash/${code}/sales-total/${date}`),
        fetch(`${SERVER_URL}/api/cash/${code}/history?from=${shiftDate(date, -30)}&to=${shiftDate(date, -1)}`),
        fetch(`${SERVER_URL}/api/admin/${code}/config`).catch(() => null),
      ]);

      // Sales total
      if (salesRes.ok) {
        const salesData = await salesRes.json();
        setCashSalesTotal(salesData.total ?? 0);
      }

      // Daily cash record
      if (dailyRes.ok) {
        const dailyJson = await dailyRes.json();
        const dailyData = dailyJson.data;
        if (dailyData) {
          setDenoms({
            bills_100: dailyData.bills_100 ?? 0, bills_50: dailyData.bills_50 ?? 0,
            bills_20: dailyData.bills_20 ?? 0, bills_10: dailyData.bills_10 ?? 0,
            bills_5: dailyData.bills_5 ?? 0, bills_1: dailyData.bills_1 ?? 0,
            coins_quarters: dailyData.coins_quarters ?? 0, coins_dimes: dailyData.coins_dimes ?? 0,
            coins_nickels: dailyData.coins_nickels ?? 0, coins_pennies: dailyData.coins_pennies ?? 0,
          });
          setOwnerDeposit(dailyData.owner_deposit ?? 0);
          setOwnerWithdraw(dailyData.owner_withdraw ?? 0);
          setNote(dailyData.note ?? '');
        } else {
          // No record for this date — reset
          setDenoms({
            bills_100: 0, bills_50: 0, bills_20: 0,
            bills_10: 0, bills_5: 0, bills_1: 0,
            coins_quarters: 0, coins_dimes: 0,
            coins_nickels: 0, coins_pennies: 0,
          });
          setOwnerDeposit(0);
          setOwnerWithdraw(0);
          setNote('');
        }
      }

      // History
      if (historyRes.ok) {
        const histJson = await historyRes.json();
        const histData = histJson.data ?? histJson;
        setHistory(Array.isArray(histData) ? histData : []);
      }

      // Config — check enable_coin_counting
      if (configRes?.ok) {
        const cfg = await configRes.json();
        setEnableCoinCounting(cfg?.enable_coin_counting ?? false);
      }
    } catch (err) {
      console.error('[Cash] fetch failed:', err);
      setErrorMsg('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [restaurantCode, date]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Save ──
  const handleSave = async () => {
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`${SERVER_URL}/api/cash/${restaurantCode.toLowerCase()}/daily/${date}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...denoms,
          counted_total: countedTotal,
          cash_sales_total: cashSalesTotal,
          owner_deposit: ownerDeposit,
          owner_withdraw: ownerWithdraw,
          variance,
          note,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        setErrorMsg(d.error || 'Failed to save');
        return;
      }

      setSuccessMsg('Saved!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      setErrorMsg('Cannot connect to server');
    } finally {
      setSaving(false);
    }
  };

  // ── Denomination input handler ──
  const setDenom = (key: DenomKey, value: string) => {
    const num = parseInt(value, 10);
    setDenoms((prev) => ({ ...prev, [key]: isNaN(num) ? 0 : Math.max(0, num) }));
  };

  // ── Dollar input handler (for deposit/withdraw) ──
  const parseDollarInput = (val: string): number => {
    const n = parseFloat(val);
    return isNaN(n) ? 0 : Math.max(0, Math.round(n * 100));
  };

  const isToday = date === todayStr();
  const canGoForward = date < todayStr();

  return (
    <div className="h-full overflow-auto bg-background">
      <div className="max-w-2xl mx-auto px-4 py-4 sm:px-6 space-y-4">

        {/* ── 헤더 ── */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Banknote size={22} className="text-amber-400" />
            Cash Management
          </h1>
          <div className="flex items-center gap-2">
            {pendingPaymentCount > 0 && (
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30" variant="outline">
                {pendingPaymentCount} pending
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </Button>
          </div>
        </div>

        {/* ── 날짜 네비게이션 ── */}
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setDate((d) => shiftDate(d, -1))}>
            <ChevronLeft size={16} />
          </Button>
          <span className="text-sm font-medium text-foreground min-w-[220px] text-center">
            {formatDate(date)}
            {isToday && <span className="text-xs text-muted-foreground ml-2">(Today)</span>}
          </span>
          <Button variant="outline" size="sm" onClick={() => setDate((d) => shiftDate(d, 1))} disabled={!canGoForward}>
            <ChevronRight size={16} />
          </Button>
        </div>

        {/* ── Cash Sales Summary ── */}
        <Card className="bg-card border-border">
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Cash Sales Today</span>
              <span className="text-lg font-bold text-foreground">{formatMoney(cashSalesTotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Owner Deposit</span>
              </div>
              <div className="w-28">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={ownerDeposit ? (ownerDeposit / 100).toFixed(2) : ''}
                  onChange={(e) => setOwnerDeposit(parseDollarInput(e.target.value))}
                  placeholder="0.00"
                  className="text-right h-8 text-sm"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Owner Withdraw</span>
              </div>
              <div className="w-28">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={ownerWithdraw ? (ownerWithdraw / 100).toFixed(2) : ''}
                  onChange={(e) => setOwnerWithdraw(parseDollarInput(e.target.value))}
                  placeholder="0.00"
                  className="text-right h-8 text-sm"
                />
              </div>
            </div>
            <div className="border-t border-border pt-2 flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Expected Total</span>
              <span className="text-lg font-bold text-foreground">{formatMoney(expectedTotal)}</span>
            </div>
          </CardContent>
        </Card>

        {/* ── Denomination Counter ── */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-wider flex items-center gap-2">
              Count Cash
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {/* Bills */}
            {BILLS.map((bill) => {
              const count = denoms[bill.key];
              const subtotal = count * bill.value;
              return (
                <div key={bill.key} className="flex items-center gap-3">
                  <span className="text-sm font-mono w-12 text-right text-muted-foreground">{bill.label}</span>
                  <span className="text-xs text-muted-foreground">&times;</span>
                  <Input
                    type="number"
                    min="0"
                    value={count || ''}
                    onChange={(e) => setDenom(bill.key, e.target.value)}
                    className="w-20 h-8 text-center text-sm"
                    placeholder="0"
                  />
                  <span className="text-xs text-muted-foreground">=</span>
                  <span className="text-sm font-medium w-24 text-right">{formatMoney(subtotal)}</span>
                </div>
              );
            })}

            {/* Coins (if enabled) */}
            {enableCoinCounting && (
              <>
                <div className="border-t border-border my-2" />
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Coins</p>
                {COINS.map((coin) => {
                  const count = denoms[coin.key];
                  const subtotal = count * coin.value;
                  return (
                    <div key={coin.key} className="flex items-center gap-3">
                      <span className="text-sm font-mono w-12 text-right text-muted-foreground">{coin.label}</span>
                      <span className="text-xs text-muted-foreground">&times;</span>
                      <Input
                        type="number"
                        min="0"
                        value={count || ''}
                        onChange={(e) => setDenom(coin.key, e.target.value)}
                        className="w-20 h-8 text-center text-sm"
                        placeholder="0"
                      />
                      <span className="text-xs text-muted-foreground">=</span>
                      <span className="text-sm font-medium w-24 text-right">{formatMoney(subtotal)}</span>
                    </div>
                  );
                })}
              </>
            )}

            {/* Totals */}
            <div className="border-t border-border pt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Counted Total</span>
                <span className="text-lg font-bold">{formatMoney(countedTotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Expected</span>
                <span className="text-sm text-muted-foreground">{formatMoney(expectedTotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Variance</span>
                <span className={`text-lg font-bold flex items-center gap-1 ${
                  variance === 0 ? 'text-emerald-400' : variance > 0 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {variance === 0 ? <Minus size={14} /> : variance > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {variance >= 0 ? '+' : ''}{formatMoney(variance)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Note ── */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cash-note" className="text-sm">Note</Label>
          <Input
            id="cash-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional note for this day..."
            className="text-sm"
          />
        </div>

        {/* ── Save button ── */}
        {errorMsg && <p className="text-destructive text-sm text-center">{errorMsg}</p>}
        {successMsg && <p className="text-emerald-400 text-sm text-center">{successMsg}</p>}

        <Button onClick={handleSave} disabled={saving} size="lg" className="w-full">
          <Save size={16} className="mr-2" />
          {saving ? 'Saving...' : 'Save'}
        </Button>

        {/* ── Cash History (30 days) ── */}
        {history.length > 0 && (
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm uppercase tracking-wider flex items-center gap-2">
                <History size={14} />
                Cash History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[400px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-card border-b border-border">
                    <tr className="text-xs text-muted-foreground uppercase tracking-wider">
                      <th className="text-left py-2 px-3">Date</th>
                      <th className="text-right py-2 px-3">Cash Sales</th>
                      <th className="text-right py-2 px-3">Counted</th>
                      <th className="text-right py-2 px-3">Variance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {history.map((h) => {
                      const d = new Date(h.date + 'T12:00:00');
                      const dateLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
                      return (
                        <tr
                          key={h.date}
                          onClick={() => setDate(h.date)}
                          className="hover:bg-muted/30 transition-colors cursor-pointer"
                        >
                          <td className="py-2 px-3 font-mono text-muted-foreground">{dateLabel}</td>
                          <td className="py-2 px-3 text-right">{formatMoney(h.cash_sales_total)}</td>
                          <td className="py-2 px-3 text-right">{h.counted_total ? formatMoney(h.counted_total) : <span className="text-muted-foreground">—</span>}</td>
                          <td className={`py-2 px-3 text-right font-medium ${
                            h.variance === 0 ? 'text-emerald-400' : h.variance > 0 ? 'text-amber-400' : 'text-red-400'
                          }`}>
                            {h.counted_total ? `${h.variance >= 0 ? '+' : ''}${formatMoney(h.variance)}` : <span className="text-muted-foreground">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}

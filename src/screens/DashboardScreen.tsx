import { useState, useEffect, useCallback } from 'react';
import { useSessionStore } from '../stores/sessionStore';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  DollarSign, ShoppingBag, TrendingUp, XCircle,
  RefreshCw, ArrowUp, ArrowDown,
} from 'lucide-react';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

// ─── 타입 ───────────────────────────────────────────────────────────────────
interface Summary {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  cancelRate: number;
  totalTips: number;
  canceledOrders: number;
  today: { revenue: number; orders: number };
  yesterday: { revenue: number; orders: number };
}

interface SalesPoint { date: string; revenue: number; orders: number }
interface ItemData { name: string; quantity: number; revenue: number }
interface SourceData { source: string; orders: number; revenue: number }
interface HourlyData { hour: number; orders: number; revenue: number }

// ─── 유틸 ───────────────────────────────────────────────────────────────────
function formatMoney(cents: number) {
  if (cents >= 100000) return `$${(cents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  return `$${(cents / 100).toFixed(2)}`;
}

function formatShortMoney(cents: number) {
  if (cents >= 100_00) return `$${Math.round(cents / 100)}`;
  return `$${(cents / 100).toFixed(0)}`;
}

const COLORS = ['#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#6366f1', '#ec4899'];

const PERIOD_OPTIONS = [
  { value: '7', label: 'Last 7 days' },
  { value: '14', label: 'Last 14 days' },
  { value: '30', label: 'Last 30 days' },
];

function getFromDate(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

// ─── 컴포넌트 ────────────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const restaurantCode = useSessionStore((s) => s.restaurantCode);
  const theme = useSessionStore((s) => s.theme);
  const isDark = theme === 'dark';
  const [period, setPeriod] = useState('7');
  const [loading, setLoading] = useState(false);

  const [summary, setSummary] = useState<Summary | null>(null);
  const [sales, setSales] = useState<SalesPoint[]>([]);
  const [items, setItems] = useState<ItemData[]>([]);
  const [sources, setSources] = useState<SourceData[]>([]);
  const [hourly, setHourly] = useState<HourlyData[]>([]);

  const fetchAll = useCallback(async () => {
    if (!restaurantCode) return;
    setLoading(true);
    const from = getFromDate(parseInt(period));
    const base = `${SERVER_URL}/api/analytics/${restaurantCode.toLowerCase()}`;

    try {
      const [sumRes, salesRes, itemsRes, srcRes, hourRes] = await Promise.all([
        fetch(`${base}/summary?from=${from}`),
        fetch(`${base}/sales?from=${from}&groupBy=day`),
        fetch(`${base}/items?from=${from}&limit=8`),
        fetch(`${base}/sources?from=${from}`),
        fetch(`${base}/hourly?from=${from}`),
      ]);

      const [sumData, salesData, itemsData, srcData, hourData] = await Promise.all([
        sumRes.json(), salesRes.json(), itemsRes.json(), srcRes.json(), hourRes.json(),
      ]);

      setSummary(sumData);
      setSales(salesData.data || []);
      setItems(itemsData.data || []);
      setSources(srcData.data || []);
      setHourly((hourData.data || []).filter((h: HourlyData) => h.orders > 0));
    } catch (err) {
      console.error('[Dashboard] fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, [restaurantCode, period]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // 매출 차트용 날짜 포맷
  const formatChartDate = (date: string) => {
    const d = new Date(date + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const todayVsYesterday = summary
    ? summary.yesterday.revenue > 0
      ? Math.round(((summary.today.revenue - summary.yesterday.revenue) / summary.yesterday.revenue) * 100)
      : summary.today.revenue > 0 ? 100 : 0
    : 0;

  return (
    <div className="h-full overflow-auto bg-background">
      <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-foreground">Dashboard</h1>
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="h-8 text-sm w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIOD_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={fetchAll} disabled={loading}>
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard
              label="Revenue"
              value={formatMoney(summary.totalRevenue)}
              icon={<DollarSign size={16} />}
              sub={`Today: ${formatMoney(summary.today.revenue)}`}
              trend={todayVsYesterday}
            />
            <SummaryCard
              label="Orders"
              value={String(summary.totalOrders)}
              icon={<ShoppingBag size={16} />}
              sub={`Today: ${summary.today.orders}`}
            />
            <SummaryCard
              label="Avg. Order"
              value={formatMoney(summary.avgOrderValue)}
              icon={<TrendingUp size={16} />}
              sub={`Tips: ${formatMoney(summary.totalTips)}`}
            />
            <SummaryCard
              label="Cancel Rate"
              value={`${summary.cancelRate}%`}
              icon={<XCircle size={16} />}
              sub={`${summary.canceledOrders} canceled`}
              negative
            />
          </div>
        )}

        {/* Sales Trend */}
        <Card className="p-4 bg-card border-border">
          <h3 className="text-sm font-medium text-foreground mb-3">Sales Trend</h3>
          <div className="h-[220px] sm:h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sales} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'} />
                <XAxis dataKey="date" tickFormatter={formatChartDate} tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#6b7280' }} />
                <YAxis tickFormatter={(v) => formatShortMoney(v)} tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#6b7280' }} />
                <Tooltip
                  contentStyle={{ background: isDark ? '#1f2937' : '#fff', border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`, borderRadius: 8, fontSize: 12, color: isDark ? '#f9fafb' : '#111827' }}
                  labelFormatter={(label: any) => formatChartDate(String(label))}
                  formatter={(value: any, name: any) => [
                    name === 'revenue' ? formatMoney(Number(value)) : value,
                    name === 'revenue' ? 'Revenue' : 'Orders',
                  ]}
                />
                <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Row: Sources + Popular Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Sources Pie Chart */}
          <Card className="p-4 bg-card border-border">
            <h3 className="text-sm font-medium text-foreground mb-3">Order Sources</h3>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sources}
                    dataKey="revenue"
                    nameKey="source"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    innerRadius={40}
                    paddingAngle={2}
                    label={({ name, percent }: any) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {sources.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: isDark ? '#1f2937' : '#fff', border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`, borderRadius: 8, fontSize: 12, color: isDark ? '#f9fafb' : '#111827' }}
                    formatter={(value: any) => formatMoney(Number(value))}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend below */}
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 justify-center">
              {sources.map((s, i) => (
                <div key={s.source} className="flex items-center gap-1 text-xs text-muted-foreground">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  {s.source} ({s.orders})
                </div>
              ))}
            </div>
          </Card>

          {/* Popular Items */}
          <Card className="p-4 bg-card border-border">
            <h3 className="text-sm font-medium text-foreground mb-3">Popular Items</h3>
            <div className="space-y-2">
              {items.map((item, i) => {
                const maxRev = items[0]?.revenue || 1;
                const pct = (item.revenue / maxRev) * 100;
                return (
                  <div key={item.name}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-foreground truncate max-w-[60%]">
                        <span className="text-muted-foreground mr-1">#{i + 1}</span>
                        {item.name}
                      </span>
                      <span className="text-muted-foreground">
                        {formatMoney(item.revenue)} · {item.quantity} sold
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Hourly Pattern */}
        <Card className="p-4 bg-card border-border">
          <h3 className="text-sm font-medium text-foreground mb-3">Hourly Pattern</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourly} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'} />
                <XAxis
                  dataKey="hour"
                  tickFormatter={(h) => {
                    if (h === 0) return '12a';
                    if (h < 12) return `${h}a`;
                    if (h === 12) return '12p';
                    return `${h - 12}p`;
                  }}
                  tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#6b7280' }}
                />
                <YAxis tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#6b7280' }} />
                <Tooltip
                  contentStyle={{ background: isDark ? '#1f2937' : '#fff', border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`, borderRadius: 8, fontSize: 12, color: isDark ? '#f9fafb' : '#111827' }}
                  labelFormatter={(h: any) => {
                    const hour = Number(h);
                    if (hour === 0) return '12:00 AM';
                    if (hour < 12) return `${hour}:00 AM`;
                    if (hour === 12) return '12:00 PM';
                    return `${hour - 12}:00 PM`;
                  }}
                  formatter={(value: any, name: any) => [
                    name === 'revenue' ? formatMoney(Number(value)) : value,
                    name === 'revenue' ? 'Revenue' : 'Orders',
                  ]}
                />
                <Bar dataKey="orders" fill="#10b981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Summary Card ──────────────────────────────────────────────────────────
function SummaryCard({ label, value, icon, sub, trend, negative }: {
  label: string;
  value: string;
  icon: React.ReactNode;
  sub?: string;
  trend?: number;
  negative?: boolean;
}) {
  return (
    <Card className="p-3 bg-card border-border">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <div className="text-xl sm:text-2xl font-bold text-foreground">{value}</div>
      <div className="flex items-center gap-1 mt-1">
        {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
        {trend !== undefined && trend !== 0 && (
          <span className={`text-xs flex items-center gap-0.5 ml-auto ${
            (negative ? trend > 0 : trend > 0) ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {trend > 0 ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
    </Card>
  );
}

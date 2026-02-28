import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Props {
  connected: boolean;
  restaurantName: string;
  orderCounts: { open: number; inProgress: number; completed: number };
  filter: 'ALL' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
  onFilterChange: (f: 'ALL' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED') => void;
  onLogout: () => void;
}

const FILTERS = [
  { key: 'ALL' as const,         label: 'All' },
  { key: 'OPEN' as const,        label: 'New' },
  { key: 'IN_PROGRESS' as const, label: 'In Progress' },
  { key: 'COMPLETED' as const,   label: 'Done' },
];

export default function StatusBar({ connected, restaurantName, orderCounts, filter, onFilterChange, onLogout }: Props) {
  const getCount = (key: typeof FILTERS[number]['key']) => {
    if (key === 'ALL') return orderCounts.open + orderCounts.inProgress + orderCounts.completed;
    if (key === 'OPEN') return orderCounts.open;
    if (key === 'IN_PROGRESS') return orderCounts.inProgress;
    return orderCounts.completed;
  };

  return (
    <div className="no-print flex items-center justify-between px-4 py-2 bg-card border-b border-border">
      {/* 연결 상태 */}
      <div className="flex items-center gap-2 min-w-32">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${connected ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
        <span className={`text-xs font-medium truncate ${connected ? 'text-green-400' : 'text-red-400'}`}>
          {connected ? (restaurantName || 'Live') : 'Offline'}
        </span>
      </div>

      {/* 필터 버튼 */}
      <div className="flex items-center gap-1">
        {FILTERS.map(({ key, label }) => {
          const count = getCount(key);
          const isActive = filter === key;
          return (
            <Button
              key={key}
              variant={isActive ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onFilterChange(key)}
              className="h-7 px-3 text-xs gap-1.5"
            >
              {label}
              {count > 0 && (
                <Badge variant={isActive ? 'default' : 'secondary'} className="h-4 px-1.5 text-xs">
                  {count}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>

      {/* 날짜 + 로그아웃 */}
      <div className="flex items-center gap-3 min-w-32 justify-end">
        <span className="text-xs text-muted-foreground hidden sm:block">
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </span>
        <Separator orientation="vertical" className="h-4" />
        <Button variant="ghost" size="sm" onClick={onLogout} className="h-7 px-2 text-xs text-muted-foreground">
          ✕
        </Button>
      </div>
    </div>
  );
}

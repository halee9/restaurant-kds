import { LayoutGrid, List, Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { ViewMode } from '../stores/sessionStore';

interface Props {
  connected: boolean;
  restaurantName: string;
  activeTab: 'kitchen' | 'done';
  onTabChange: (tab: 'kitchen' | 'done') => void;
  kitchenCount: number;
  pendingCount: number;
  doneCount: number;
  onLogout: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onSettings: () => void;
}

export default function StatusBar({
  connected, restaurantName,
  activeTab, onTabChange,
  kitchenCount, pendingCount, doneCount,
  onLogout, viewMode, onViewModeChange, onSettings,
}: Props) {
  return (
    <div className="no-print flex items-center justify-between px-5 py-2.5 bg-card border-b border-border">
      {/* 연결 상태 */}
      <div className="flex items-center gap-2 min-w-36">
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${connected ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
        <span className={`text-sm font-semibold truncate ${connected ? 'text-green-400' : 'text-red-400'}`}>
          {connected ? (restaurantName || 'Live') : 'Offline'}
        </span>
      </div>

      {/* Kitchen / Done 탭 */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onTabChange('kitchen')}
          className={`flex items-center gap-2 px-4 py-2 rounded text-base font-bold transition-colors ${
            activeTab === 'kitchen'
              ? 'bg-secondary text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Kitchen
          {kitchenCount > 0 && (
            <Badge variant={activeTab === 'kitchen' ? 'default' : 'secondary'} className="h-5 px-2 text-sm">
              {kitchenCount}
            </Badge>
          )}
          {pendingCount > 0 && (
            <Badge variant="outline" className="h-5 px-2 text-sm border-purple-500 text-purple-400">
              +{pendingCount}
            </Badge>
          )}
        </button>

        <button
          onClick={() => onTabChange('done')}
          className={`flex items-center gap-2 px-4 py-2 rounded text-base font-bold transition-colors ${
            activeTab === 'done'
              ? 'bg-secondary text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Done
          {doneCount > 0 && (
            <Badge variant={activeTab === 'done' ? 'default' : 'secondary'} className="h-5 px-2 text-sm">
              {doneCount}
            </Badge>
          )}
        </button>
      </div>

      {/* 뷰 토글 + 날짜 + 로그아웃 */}
      <div className="flex items-center gap-2 min-w-36 justify-end">
        <div className="flex items-center rounded-md border border-border overflow-hidden">
          <Button
            variant={viewMode === 'card' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('card')}
            className="h-8 px-2.5 rounded-none border-0"
            title="Card view"
          >
            <LayoutGrid className="h-5 w-5" />
          </Button>
          <Separator orientation="vertical" className="h-5" />
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className="h-8 px-2.5 rounded-none border-0"
            title="List view"
          >
            <List className="h-5 w-5" />
          </Button>
        </div>
        <Separator orientation="vertical" className="h-5" />
        <span className="text-sm text-muted-foreground hidden sm:block">
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </span>
        <Separator orientation="vertical" className="h-5" />
        <Button variant="ghost" size="sm" onClick={onSettings} className="h-8 px-2.5 text-muted-foreground" title="KDS Settings">
          <Settings className="h-5 w-5" />
        </Button>
        <Separator orientation="vertical" className="h-5" />
        <Button variant="ghost" size="sm" onClick={onLogout} className="h-8 px-2.5 text-muted-foreground" title="Logout">
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

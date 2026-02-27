interface Props {
  connected: boolean;
  restaurantName: string;
  orderCounts: { open: number; inProgress: number; completed: number };
  filter: 'ALL' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
  onFilterChange: (f: 'ALL' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED') => void;
  onLogout: () => void;
}

const FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'OPEN', label: 'New' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'COMPLETED', label: 'Done' },
] as const;

export default function StatusBar({ connected, restaurantName, orderCounts, filter, onFilterChange, onLogout }: Props) {
  const getCount = (f: typeof FILTERS[number]['key']) => {
    if (f === 'ALL') return orderCounts.open + orderCounts.inProgress + orderCounts.completed;
    if (f === 'OPEN') return orderCounts.open;
    if (f === 'IN_PROGRESS') return orderCounts.inProgress;
    return orderCounts.completed;
  };

  return (
    <div className="no-print flex items-center justify-between px-5 py-2.5 bg-gray-950 border-b border-gray-800">
      {/* 연결 상태 + 레스토랑 이름 */}
      <div className="flex items-center gap-2 w-40">
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${connected ? 'bg-green-400' : 'bg-red-500 animate-pulse'}`} />
        <span className={`text-xs font-medium truncate ${connected ? 'text-green-400' : 'text-red-400'}`}>
          {connected ? (restaurantName || 'Live') : 'Offline'}
        </span>
      </div>

      {/* 필터 */}
      <div className="flex gap-1">
        {FILTERS.map(({ key, label }) => {
          const count = getCount(key);
          const isActive = filter === key;
          return (
            <button
              key={key}
              onClick={() => onFilterChange(key)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors
                ${isActive ? 'bg-white text-gray-900' : 'text-gray-400 hover:text-white hover:bg-gray-800'}
              `}
            >
              {label}
              {count > 0 && (
                <span className={`text-xs rounded-full px-1.5 py-0.5 leading-none font-bold
                  ${isActive ? 'bg-gray-900 text-white' : 'bg-gray-700 text-gray-300'}
                `}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 날짜 + 레스토랑 변경 */}
      <div className="flex items-center gap-3 w-40 justify-end">
        <span className="text-xs text-gray-500">
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </span>
        <button
          onClick={onLogout}
          className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
          title="Change restaurant"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

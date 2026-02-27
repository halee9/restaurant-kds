interface Props {
  connected: boolean;
  orderCounts: { open: number; inProgress: number; completed: number };
  filter: 'ALL' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
  onFilterChange: (f: 'ALL' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED') => void;
}

export default function StatusBar({ connected, orderCounts, filter, onFilterChange }: Props) {
  return (
    <div className="no-print flex items-center justify-between px-6 py-3 bg-gray-950 border-b border-gray-800">
      <div className="flex items-center gap-2">
        <div className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-green-400' : 'bg-red-500'}`} />
        <span className="text-sm text-gray-400">{connected ? 'Live' : 'Reconnecting...'}</span>
      </div>

      <div className="flex gap-2">
        {(['ALL', 'OPEN', 'IN_PROGRESS', 'COMPLETED'] as const).map((f) => {
          const count = f === 'ALL'
            ? orderCounts.open + orderCounts.inProgress + orderCounts.completed
            : f === 'OPEN' ? orderCounts.open
            : f === 'IN_PROGRESS' ? orderCounts.inProgress
            : orderCounts.completed;

          const label = f === 'IN_PROGRESS' ? 'In Progress' : f.charAt(0) + f.slice(1).toLowerCase();

          return (
            <button
              key={f}
              onClick={() => onFilterChange(f)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors
                ${filter === f ? 'bg-white text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}
              `}
            >
              {label} {count > 0 && <span className="ml-1 opacity-70">{count}</span>}
            </button>
          );
        })}
      </div>

      <div className="text-xs text-gray-500">
        {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
      </div>
    </div>
  );
}

import type { KDSOrder } from '../types';
import { formatMoney, formatTime, formatElapsed, getElapsedMinutes, SOURCE_COLORS } from '../utils';

interface Props {
  order: KDSOrder;
  onUpdateStatus: (orderId: string, status: KDSOrder['status']) => void;
  onPrint: (order: KDSOrder) => void;
}

export default function OrderCard({ order, onUpdateStatus, onPrint }: Props) {
  const elapsed = getElapsedMinutes(order.createdAt);
  const isUrgent = elapsed >= 15 && order.status === 'OPEN';

  const borderColor =
    order.status === 'COMPLETED' ? 'border-gray-700' :
    order.status === 'IN_PROGRESS' ? 'border-yellow-400' :
    isUrgent ? 'border-red-500' : 'border-gray-600';

  return (
    <div className={`rounded-xl border-2 flex flex-col gap-0 bg-gray-900 overflow-hidden transition-all
      ${borderColor}
      ${order.status === 'COMPLETED' ? 'opacity-50' : ''}
      ${isUrgent ? 'shadow-lg shadow-red-900/40' : ''}
    `}>
      {/* Header bar */}
      <div className={`flex items-center justify-between px-4 py-3
        ${order.status === 'IN_PROGRESS' ? 'bg-yellow-500/10' : ''}
        ${isUrgent ? 'bg-red-500/10' : ''}
      `}>
        <div className="flex items-center gap-2">
          <span className="text-xl font-black text-white tracking-tight">#{order.displayId}</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded text-white ${SOURCE_COLORS[order.source]}`}>
            {order.source}
          </span>
        </div>
        <div className="text-right leading-tight">
          <div className="text-xs text-gray-400">{formatTime(order.createdAt)}</div>
          <div className={`text-xs font-bold ${isUrgent ? 'text-red-400' : 'text-gray-400'}`}>
            {formatElapsed(order.createdAt)}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="flex flex-col gap-2 px-4 py-3 border-t border-gray-800">
        {order.lineItems.map((item, idx) => (
          <div key={idx}>
            <div className="flex items-baseline gap-1 text-sm">
              <span className="font-bold text-white min-w-[1.5rem]">{item.quantity}×</span>
              <span className="text-gray-100 font-medium">{item.name}</span>
              {item.variationName && (
                <span className="text-gray-500 text-xs">({item.variationName})</span>
              )}
            </div>
            {item.modifiers && item.modifiers.length > 0 && (
              <div className="ml-6 text-xs text-gray-400">
                + {item.modifiers.join(', ')}
              </div>
            )}
          </div>
        ))}
        {order.note && (
          <div className="mt-1 text-xs text-yellow-200 bg-yellow-900/30 border border-yellow-800/40 rounded px-2 py-1">
            Note: {order.note}
          </div>
        )}
      </div>

      {/* Footer: total + actions */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-800 bg-gray-950/40">
        <span className="text-white font-bold text-sm flex-1">{formatMoney(order.totalMoney)}</span>

        {order.status === 'OPEN' && (
          <button
            onClick={() => onUpdateStatus(order.id, 'IN_PROGRESS')}
            className="px-4 py-1.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm transition-colors"
          >
            Start
          </button>
        )}
        {order.status === 'IN_PROGRESS' && (
          <button
            onClick={() => onUpdateStatus(order.id, 'COMPLETED')}
            className="px-4 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold text-sm transition-colors"
          >
            Done
          </button>
        )}
        {order.status === 'COMPLETED' && (
          <span className="text-green-400 font-bold text-sm">✓ Done</span>
        )}
        <button
          onClick={() => onPrint(order)}
          className="p-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm transition-colors no-print"
          title="Print ticket"
        >
          🖨️
        </button>
      </div>
    </div>
  );
}

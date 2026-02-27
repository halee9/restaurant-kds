import type { KDSOrder } from '../types';
import { formatMoney, formatTime, getElapsedMinutes, SOURCE_COLORS } from '../utils';

interface Props {
  order: KDSOrder;
  onUpdateStatus: (orderId: string, status: KDSOrder['status']) => void;
  onPrint: (order: KDSOrder) => void;
}

export default function OrderCard({ order, onUpdateStatus, onPrint }: Props) {
  const elapsed = getElapsedMinutes(order.createdAt);
  const isUrgent = elapsed >= 15 && order.status !== 'COMPLETED';

  return (
    <div className={`rounded-xl border-2 flex flex-col gap-3 p-4 bg-gray-900 transition-all
      ${order.status === 'COMPLETED' ? 'border-gray-700 opacity-60' : ''}
      ${order.status === 'IN_PROGRESS' ? 'border-yellow-400' : ''}
      ${order.status === 'OPEN' ? (isUrgent ? 'border-red-500 animate-pulse' : 'border-gray-600') : ''}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-white">#{order.displayId}</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${SOURCE_COLORS[order.source]}`}>
            {order.source}
          </span>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400">{formatTime(order.createdAt)}</div>
          <div className={`text-sm font-bold ${isUrgent ? 'text-red-400' : 'text-gray-300'}`}>
            {elapsed}m ago
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="flex flex-col gap-1 border-t border-gray-700 pt-3">
        {order.lineItems.map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm">
            <div>
              <span className="font-bold text-white">{item.quantity}x </span>
              <span className="text-gray-200">{item.name}</span>
              {item.variationName && (
                <span className="text-gray-400"> ({item.variationName})</span>
              )}
              {item.modifiers && item.modifiers.length > 0 && (
                <div className="text-xs text-gray-400 ml-4">
                  + {item.modifiers.join(', ')}
                </div>
              )}
            </div>
          </div>
        ))}
        {order.note && (
          <div className="mt-1 text-xs text-yellow-300 bg-yellow-900/30 rounded px-2 py-1">
            📝 {order.note}
          </div>
        )}
      </div>

      {/* Total */}
      <div className="flex justify-between items-center border-t border-gray-700 pt-2">
        <span className="text-gray-400 text-sm">Total</span>
        <span className="text-white font-bold">{formatMoney(order.totalMoney)}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 no-print">
        {order.status === 'OPEN' && (
          <button
            onClick={() => onUpdateStatus(order.id, 'IN_PROGRESS')}
            className="flex-1 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm transition-colors"
          >
            Start
          </button>
        )}
        {order.status === 'IN_PROGRESS' && (
          <button
            onClick={() => onUpdateStatus(order.id, 'COMPLETED')}
            className="flex-1 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold text-sm transition-colors"
          >
            Complete
          </button>
        )}
        {order.status === 'COMPLETED' && (
          <div className="flex-1 py-2 text-center text-green-400 font-bold text-sm">
            ✓ Done
          </div>
        )}
        <button
          onClick={() => onPrint(order)}
          className="px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm transition-colors"
          title="Print"
        >
          🖨️
        </button>
      </div>
    </div>
  );
}
